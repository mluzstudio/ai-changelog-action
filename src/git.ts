import { getExecOutput } from "@actions/exec";

export interface TagRange {
  currentTag: string;
  previousRef: string;
}

export interface CommitData {
  commits: string;
  diffs: string;
}

const DEFAULT_MAX_DIFF_SIZE = 100_000;

export async function getTagRange(githubRef: string): Promise<TagRange> {
  if (!githubRef.startsWith("refs/tags/")) {
    throw new Error(`GITHUB_REF is not a tag: ${githubRef}`);
  }

  const currentTag = githubRef.replace("refs/tags/", "");
  let previousRef: string;

  try {
    const { stdout } = await getExecOutput("git", [
      "describe",
      "--tags",
      "--abbrev=0",
      `${currentTag}^`,
    ]);
    previousRef = stdout.trim();
  } catch {
    const { stdout } = await getExecOutput("git", [
      "rev-list",
      "--max-parents=0",
      "HEAD",
    ]);
    previousRef = stdout.trim();
  }

  return { currentTag, previousRef };
}

export async function getCommitsAndDiffs(
  previousRef: string,
  currentTag: string,
  maxDiffSize: number = DEFAULT_MAX_DIFF_SIZE
): Promise<CommitData> {
  const { stdout: commits } = await getExecOutput("git", [
    "log",
    "--pretty=format:%h %s",
    `${previousRef}..${currentTag}`,
  ]);

  const { stdout: rawDiffs } = await getExecOutput("git", [
    "diff",
    `${previousRef}..${currentTag}`,
  ]);

  let diffs = rawDiffs;
  if (diffs.length > maxDiffSize) {
    diffs = diffs.substring(0, maxDiffSize) + "\n...[diff truncated]";
  }

  return { commits: commits.trim(), diffs };
}
