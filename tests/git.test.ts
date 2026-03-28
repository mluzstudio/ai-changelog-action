import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTagRange, getCommitsAndDiffs } from "../src/git";

vi.mock("@actions/exec", () => ({
  getExecOutput: vi.fn(),
}));

import { getExecOutput } from "@actions/exec";

const mockGetExecOutput = vi.mocked(getExecOutput);

describe("getTagRange", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses current tag from GITHUB_REF and finds previous tag", async () => {
    mockGetExecOutput.mockResolvedValueOnce({
      stdout: "v1.0.0\n",
      stderr: "",
      exitCode: 0,
    });

    const result = await getTagRange("refs/tags/v1.1.0");

    expect(result).toEqual({
      currentTag: "v1.1.0",
      previousRef: "v1.0.0",
    });
    expect(mockGetExecOutput).toHaveBeenCalledWith("git", [
      "describe",
      "--tags",
      "--abbrev=0",
      "v1.1.0^",
    ]);
  });

  it("falls back to root commit when no previous tag exists", async () => {
    mockGetExecOutput.mockRejectedValueOnce(new Error("No tags found"));
    mockGetExecOutput.mockResolvedValueOnce({
      stdout: "abc123def456\n",
      stderr: "",
      exitCode: 0,
    });

    const result = await getTagRange("refs/tags/v1.0.0");

    expect(result).toEqual({
      currentTag: "v1.0.0",
      previousRef: "abc123def456",
    });
  });

  it("throws if GITHUB_REF is not a tag ref", async () => {
    await expect(getTagRange("refs/heads/main")).rejects.toThrow(
      "GITHUB_REF is not a tag"
    );
  });
});

describe("getCommitsAndDiffs", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns commits and diffs between two refs", async () => {
    mockGetExecOutput.mockResolvedValueOnce({
      stdout: "abc1234 feat: add login\ndef5678 fix: resolve crash\n",
      stderr: "",
      exitCode: 0,
    });
    mockGetExecOutput.mockResolvedValueOnce({
      stdout: "diff --git a/src/app.ts b/src/app.ts\n+added line\n",
      stderr: "",
      exitCode: 0,
    });

    const result = await getCommitsAndDiffs("v1.0.0", "v1.1.0");

    expect(result.commits).toBe(
      "abc1234 feat: add login\ndef5678 fix: resolve crash"
    );
    expect(result.diffs).toContain("+added line");
    expect(mockGetExecOutput).toHaveBeenCalledWith("git", [
      "log",
      "--pretty=format:%h %s",
      "v1.0.0..v1.1.0",
    ]);
    expect(mockGetExecOutput).toHaveBeenCalledWith("git", [
      "diff",
      "v1.0.0..v1.1.0",
    ]);
  });

  it("truncates diffs exceeding maxDiffSize", async () => {
    const largeDiff = "x".repeat(200_000);
    mockGetExecOutput.mockResolvedValueOnce({
      stdout: "abc1234 feat: big change\n",
      stderr: "",
      exitCode: 0,
    });
    mockGetExecOutput.mockResolvedValueOnce({
      stdout: largeDiff,
      stderr: "",
      exitCode: 0,
    });

    const result = await getCommitsAndDiffs("v1.0.0", "v1.1.0", 100_000);

    expect(result.diffs.length).toBeLessThanOrEqual(
      100_000 + "\n...[diff truncated]".length
    );
    expect(result.diffs).toContain("...[diff truncated]");
  });
});
