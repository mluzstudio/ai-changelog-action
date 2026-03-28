---
name: release-test
description: Simulate the action locally by generating release notes from recent git history using Claude
---

# Release Test

Simulate the ai-changelog-action locally to verify prompt quality and output format.

## Steps

1. **Determine tag range** — find the two most recent tags, or use the last tag vs HEAD if only one exists:
   ```bash
   git tag --sort=-version:refname | head -2
   ```

2. **Collect commits and diffs** between the two refs:
   ```bash
   git log --pretty=format:"%h %s" <previous>..<current>
   git diff <previous>..<current>
   ```

3. **Read `src/ai.ts`** to get the current system prompt and understand the GenerateOptions interface.

4. **Call Claude** using the same prompt structure from `ai.ts` with:
   - The commits and diffs collected above
   - Default categories: `Features,Bug Fixes,Improvements,Breaking Changes,Other`
   - Model: `claude-sonnet-4-6`

5. **Display the generated release notes** in the terminal for review.

6. **Ask the user** if the output looks good or if they want to adjust the prompt in `src/ai.ts`.

## Notes
- This does NOT write to CHANGELOG.md or create a GitHub Release — it's a dry run.
- If there are no tags yet, use the root commit as the starting point.
- Truncate diffs to ~100KB to match production behavior.
