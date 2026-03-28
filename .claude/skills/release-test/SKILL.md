---
name: release-test
description: Simulate the action locally by generating release notes from recent git history
---

# Release Test

Simulate the ai-changelog-action locally to verify prompt quality and output format.
You ARE Claude — just generate the release notes directly, no API call needed.

## Steps

1. **Determine tag range** — find the two most recent tags, or use the last tag vs HEAD if only one exists:
   ```bash
   git tag --sort=-version:refname | head -2
   ```
   If no tags exist, use the root commit (`git rev-list --max-parents=0 HEAD`) as the starting point and HEAD as the end.

2. **Collect commits and diffs** between the two refs:
   ```bash
   git log --pretty=format:"%h %s" <previous>..<current>
   git diff <previous>..<current>
   ```
   Truncate diffs to ~100KB to match production behavior.

3. **Read `src/ai.ts`** to get the current system prompt (the `system` variable in `generateReleaseNotes`).

4. **Generate the release notes yourself** by following the exact same instructions from the system prompt in `ai.ts`:
   - Use the categories from the prompt (default: Features, Bug Fixes, Improvements, Breaking Changes, Other)
   - Omit empty categories
   - Use ## headings with bullet points
   - Describe what changed and why it matters, don't just repeat commit messages

5. **Display the generated release notes** for the user to review.

6. **Ask the user** if the output looks good or if they want to adjust the prompt in `src/ai.ts`.

## Notes
- This does NOT write to CHANGELOG.md or create a GitHub Release — it's a dry run.
- No API key or SDK call is needed — you generate the notes directly as Claude.
