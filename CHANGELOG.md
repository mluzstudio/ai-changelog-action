# Changelog

## [v1.0.0] - 2026-03-28

## Features

- **Automated release notes workflow**: Added a GitHub Actions workflow (`.github/workflows/release.yml`) that automatically generates release notes when a new version tag is pushed, writing them to the changelog and creating a GitHub Release.
- **Local release test skill**: Added a Claude skill (`.claude/skills/release-test/SKILL.md`) that allows simulating release note generation locally without an API key or GitHub credentials — useful for iterating on prompt quality before tagging.

## Improvements

- **Updated default model to `claude-sonnet-4-6`**: The action now uses the latest Claude Sonnet model by default, both in `action.yml` and the README input reference table.
- **`dist/` is now committed to the repository**: The compiled output is no longer gitignored, which is required for GitHub Actions to work correctly with `uses: ./` and the GitHub Marketplace. Run `npm run build` after making source changes.
- **Renamed action display name**: Changed from "AI Changelog Generator" to "AI Changelog Action" in `action.yml` for consistency.
