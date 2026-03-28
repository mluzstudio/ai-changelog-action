# AI Changelog Action

Generate human-readable release notes from git tags using Claude AI. Automatically updates your CHANGELOG.md and creates GitHub Releases.

## Usage

```yaml
name: Release Notes
on:
  push:
    tags:
      - "v*"

jobs:
  changelog:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: your-org/ai-changelog-action@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `anthropic-api-key` | Yes | — | Anthropic API key |
| `github-token` | Yes | — | GitHub token with `contents: write` |
| `model` | No | `claude-sonnet-4-20250514` | Claude model |
| `extra-prompt` | No | `""` | Custom instructions for tone/format |
| `categories` | No | `Features,Bug Fixes,Improvements,Breaking Changes,Other` | Changelog categories |
| `changelog-file` | No | `CHANGELOG.md` | Path to changelog file |

## Outputs

| Output | Description |
|--------|-------------|
| `release-notes` | Generated markdown release notes |
| `tag` | The processed tag |

## Customization

### Custom Categories

```yaml
- uses: your-org/ai-changelog-action@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    categories: "Added,Changed,Deprecated,Removed,Fixed,Security"
```

### Custom Tone

```yaml
- uses: your-org/ai-changelog-action@v1
  with:
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    extra-prompt: "Write in a casual, developer-friendly tone. Use emoji."
```
