import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateReleaseNotes } from "../src/ai";

describe("generateReleaseNotes", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      messages: {
        create: vi.fn(),
      },
    };
  });

  it("sends commits and diffs to Claude and returns release notes", async () => {
    mockClient.messages.create.mockResolvedValueOnce({
      content: [{ type: "text", text: "## Features\n- Added login page" }],
    });

    const result = await generateReleaseNotes({
      client: mockClient,
      model: "claude-sonnet-4-20250514",
      commits: "abc1234 feat: add login",
      diffs: "diff --git a/src/login.ts ...",
      categories: ["Features", "Bug Fixes", "Other"],
      extraPrompt: "",
    });

    expect(result).toBe("## Features\n- Added login page");

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.model).toBe("claude-sonnet-4-20250514");
    expect(callArgs.system).toContain("Features");
    expect(callArgs.system).toContain("Bug Fixes");
    expect(callArgs.messages[0].content).toContain("abc1234 feat: add login");
    expect(callArgs.messages[0].content).toContain(
      "diff --git a/src/login.ts ..."
    );
  });

  it("appends extra-prompt to system prompt", async () => {
    mockClient.messages.create.mockResolvedValueOnce({
      content: [{ type: "text", text: "## Features\n- Stuff" }],
    });

    await generateReleaseNotes({
      client: mockClient,
      model: "claude-sonnet-4-20250514",
      commits: "abc feat: stuff",
      diffs: "diff ...",
      categories: ["Features", "Other"],
      extraPrompt: "Write in a casual, fun tone.",
    });

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.system).toContain("Write in a casual, fun tone.");
  });

  it("injects custom categories into the system prompt", async () => {
    mockClient.messages.create.mockResolvedValueOnce({
      content: [{ type: "text", text: "## Added\n- thing" }],
    });

    await generateReleaseNotes({
      client: mockClient,
      model: "claude-sonnet-4-20250514",
      commits: "abc feat: thing",
      diffs: "diff ...",
      categories: ["Added", "Changed", "Removed"],
      extraPrompt: "",
    });

    const callArgs = mockClient.messages.create.mock.calls[0][0];
    expect(callArgs.system).toContain("Added");
    expect(callArgs.system).toContain("Changed");
    expect(callArgs.system).toContain("Removed");
  });

  it("throws when API returns no text content", async () => {
    mockClient.messages.create.mockResolvedValueOnce({
      content: [],
    });

    await expect(
      generateReleaseNotes({
        client: mockClient,
        model: "claude-sonnet-4-20250514",
        commits: "abc feat: thing",
        diffs: "diff ...",
        categories: ["Features"],
        extraPrompt: "",
      })
    ).rejects.toThrow("No text content in Claude response");
  });
});
