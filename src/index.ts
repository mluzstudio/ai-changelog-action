import * as core from "@actions/core";
import * as github from "@actions/github";
import { getExecOutput } from "@actions/exec";
import Anthropic from "@anthropic-ai/sdk";
import { getTagRange, getCommitsAndDiffs } from "./git";
import { generateReleaseNotes } from "./ai";
import { updateChangelog } from "./changelog";
import { createRelease } from "./release";

async function run(): Promise<void> {
  try {
    const anthropicApiKey = core.getInput("anthropic-api-key", {
      required: true,
    });
    const githubToken = core.getInput("github-token", { required: true });
    const model = core.getInput("model");
    const extraPrompt = core.getInput("extra-prompt");
    const categoriesRaw = core.getInput("categories");
    const changelogFile = core.getInput("changelog-file");

    const categories = categoriesRaw.split(",").map((c) => c.trim());

    const client = new Anthropic({ apiKey: anthropicApiKey });
    const octokit = github.getOctokit(githubToken);

    const githubRef = process.env.GITHUB_REF;
    if (!githubRef) {
      throw new Error("GITHUB_REF environment variable is not set");
    }

    core.info("Determining tag range...");
    const { currentTag, previousRef } = await getTagRange(githubRef);
    core.info(`Current tag: ${currentTag}, Previous ref: ${previousRef}`);

    core.info("Collecting commits and diffs...");
    const { commits, diffs } = await getCommitsAndDiffs(
      previousRef,
      currentTag
    );
    core.info(`Found ${commits.split("\n").length} commits`);

    core.info("Generating release notes with Claude...");
    const releaseNotes = await generateReleaseNotes({
      client,
      model,
      commits,
      diffs,
      categories,
      extraPrompt,
    });
    core.info("Release notes generated successfully");

    core.info(`Updating ${changelogFile}...`);
    updateChangelog(releaseNotes, currentTag, changelogFile);

    core.info("Committing changelog...");
    await getExecOutput("git", ["config", "user.name", "github-actions[bot]"]);
    await getExecOutput("git", [
      "config",
      "user.email",
      "github-actions[bot]@users.noreply.github.com",
    ]);
    await getExecOutput("git", ["add", changelogFile]);
    await getExecOutput("git", [
      "commit",
      "-m",
      `docs: update ${changelogFile} for ${currentTag}`,
    ]);
    await getExecOutput("git", ["push", "origin", "HEAD:main"]);

    core.info("Creating GitHub Release...");
    const releaseUrl = await createRelease({
      octokit,
      context: { repo: github.context.repo },
      tag: currentTag,
      releaseNotes,
    });
    core.info(`Release created: ${releaseUrl}`);

    core.setOutput("release-notes", releaseNotes);
    core.setOutput("tag", currentTag);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred");
    }
  }
}

run();
