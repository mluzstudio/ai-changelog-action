import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRelease } from "../src/release";

describe("createRelease", () => {
  let mockOctokit: any;

  beforeEach(() => {
    mockOctokit = {
      rest: {
        repos: {
          createRelease: vi.fn().mockResolvedValue({
            data: {
              html_url: "https://github.com/owner/repo/releases/tag/v1.0.0",
            },
          }),
        },
      },
    };
  });

  it("creates a GitHub release with correct parameters", async () => {
    const context = { repo: { owner: "myorg", repo: "myrepo" } };

    const url = await createRelease({
      octokit: mockOctokit,
      context,
      tag: "v1.0.0",
      releaseNotes: "## Features\n- Added login",
    });

    expect(url).toBe(
      "https://github.com/owner/repo/releases/tag/v1.0.0"
    );
    expect(mockOctokit.rest.repos.createRelease).toHaveBeenCalledWith({
      owner: "myorg",
      repo: "myrepo",
      tag_name: "v1.0.0",
      name: "v1.0.0",
      body: "## Features\n- Added login",
      make_latest: "true",
    });
  });
});
