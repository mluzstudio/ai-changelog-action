# AI Changelog Action

## Project Overview
GitHub Action that generates AI-powered release notes from git tags using Claude.
Collects commits/diffs between tags, sends to Anthropic API, updates CHANGELOG.md, creates GitHub Release.

## Tech Stack
- TypeScript, bundled with `@vercel/ncc` into `dist/index.js`
- `@actions/core`, `@actions/github`, `@actions/exec`, `@anthropic-ai/sdk`
- Vitest for testing

## Architecture
Multi-module: `src/git.ts`, `src/ai.ts`, `src/changelog.ts`, `src/release.ts`, `src/index.ts` (orchestrator).
Each module takes dependencies as parameters (no global singletons) for testability.

## Commands
- `npm test` — run all tests (vitest)
- `npm run build` — bundle with ncc to `dist/`
- `npx tsc --noEmit` — type-check without emitting

## Testing Patterns
- Tests live in `tests/<module>.test.ts`, mirroring `src/<module>.ts`
- `@actions/exec` is mocked via `vi.mock("@actions/exec")` in git tests
- AI and release tests use manual mock objects passed as dependencies
- Changelog tests use real filesystem with tmp dirs (no mocks)

## Key Conventions
- `dist/` is committed (required for GitHub Actions `uses: ./` and marketplace) — rebuild with `npm run build` after src changes
- Action inputs defined in `action.yml` — keep in sync with `core.getInput()` calls in `src/index.ts`
- Diffs are truncated to ~100KB to stay within Claude's context limits
