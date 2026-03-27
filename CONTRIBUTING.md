# Contributing

Thank you for contributing to `react-mapy`.

For substantial changes, please discuss the proposal first through a GitHub issue, discussion, or direct contact with the repository owner before opening a large pull request. Small fixes, documentation improvements, and focused test additions can usually go straight to a PR.

This repository follows a lightweight but explicit contribution model:

- keep `main` releasable
- use short-lived feature branches
- use Conventional Commits
- use Changesets for publishable changes
- update tests, Storybook, and docs when public behavior changes

## Repository Principles

When contributing:

- keep provider abstractions generic and renderer-agnostic
- keep Mapy.com-specific behavior isolated under `src/providers/mapy/`
- prefer pure utilities first, then thin React wrappers, then higher-level presets
- avoid bundling framework-specific design choices into the runtime library
- keep YAML files on the `.yaml` extension only
- do not manually bump `package.json` version for normal feature work

## Branch Naming

Use lowercase branch names with a clear prefix.

Recommended prefixes:

| Prefix     | Usage                                             |
| ---------- | ------------------------------------------------- |
| `feature/` | New features or public API additions              |
| `bugfix/`  | Non-urgent bug fixes                              |
| `hotfix/`  | Urgent production or release-critical fixes       |
| `docs/`    | Documentation-only changes                        |
| `chore/`   | Tooling, dependencies, maintenance                |
| `release/` | Release preparation or release-specific follow-up |

Examples:

```bash
git checkout -b feature/stream-track-legend
git checkout -b bugfix/heatmap-overlay-pan
git checkout -b docs/storybook-proxy-guide
git checkout -b chore/workflow-pnpm-version
```

## Commit Conventions

Use Conventional Commits whenever possible.

Recommended prefixes:

| Prefix      | Description                                               |
| ----------- | --------------------------------------------------------- |
| `feat:`     | New feature or enhancement                                |
| `fix:`      | Bug fix                                                   |
| `chore:`    | Project maintenance, dependency updates, scripts          |
| `docs:`     | Documentation changes                                     |
| `style:`    | Formatting or style-only changes without behavior changes |
| `refactor:` | Internal refactoring without intended behavior changes    |
| `test:`     | Adding or updating tests                                  |
| `perf:`     | Performance optimization                                  |
| `ci:`       | CI/CD configuration changes                               |

Reference: [conventionalcommits.org](https://www.conventionalcommits.org/)

Examples:

```bash
git commit -m "feat(marker): add ofeed built-in marker preset"
git commit -m "fix(heatmap): keep overlay above tiles during pan"
git commit -m "docs(readme): refresh getting started section"
git commit -m "ci(release): use pnpm version from packageManager"
git commit -m "feat(provider): add backend-proxied Mapy tiles" -m "Refs #45"
git commit -m "fix(storybook): remove duplicate prop in proxy story" -m "Closes #52"
```

## Pull Request Process

1. Create a focused branch from `main`.
2. Implement the change.
3. Run the relevant validation commands locally.
4. Add a Changeset if the change affects the published package.
5. Update README, Storybook, and docs when API, behavior, configuration, or usage changes.
6. Open a pull request with a clear summary and testing notes.
7. Merge only after required review and CI checks pass.

Recommended local validation:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If stories or docs changed, also run:

```bash
pnpm build-storybook
```

## Versioning and Releases

This repository uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

Important rules:

- do not manually edit the package version for normal feature or fix work
- add a changeset for any change that should affect the published npm package
- let the release workflow update `package.json` version automatically

Create a changeset:

```bash
pnpm changeset
```

Choose the bump carefully:

| Bump    | Use when                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------- |
| `patch` | Bug fix, small non-breaking improvement, docs/runtime correction that changes package behavior without breaking API |
| `minor` | New backward-compatible feature, new component, new prop, new preset, new provider option                           |
| `major` | Breaking API change, removed export, renamed prop, changed default behavior with migration impact                   |

Examples for this library:

- `patch`: fix heatmap rendering during pan
- `minor`: add `GeoreferencedImageOverlay`
- `major`: rename a public export or remove a provider option

Release flow:

1. Contributors merge PRs with changesets into `main`.
2. GitHub Actions creates or updates a release PR.
3. The release PR applies semver bumps and updates `package.json`.
4. Merging the release PR publishes the package and creates the release commit/tag.

The release workflow lives in [release.yaml](./.github/workflows/release.yaml).

## When a Changeset Is Not Needed

You can usually skip a changeset for:

- typo fixes with no package impact
- CI-only changes
- repo metadata changes
- internal docs-only changes
- test-only changes with no runtime or API impact

If you are unsure, prefer adding a changeset or ask in the PR.

## Storybook and Documentation Expectations

This repository uses Storybook as the primary interactive documentation surface.

When public behavior changes:

- add or update a story when appropriate
- keep examples aligned with the current API
- update README usage examples when consumers would rely on them
- document new provider options, presets, themes, or marker variants

## Code of Conduct

This project follows the Contributor Covenant.

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for the full policy and
enforcement contact.
