# CLAUDE.md — Idle Dragon Ball: Profectus Edition

## Project Overview

Idle Dragon Ball is a passive incremental game built with the [Profectus](https://github.com/profectus-engine/Profectus) framework in TypeScript/Vue 3.

Resources and progression happen **entirely passively** — there is no clicking to generate resources.
The player's role is strategic: purchasing upgrades, allocating resources, and deciding when to prestige.

## Tech Stack

- **Framework**: Profectus v0.7.0
- **Language**: TypeScript (strict) + Vue 3 + JSX
- **Build tool**: Vite
- **Tests**: Vitest

## Project Rules

1. **No click-to-generate**: Resources accumulate automatically every game tick via `layer.on("update", diff => {...})`. Never add a button whose sole purpose is to generate resources.
2. **Passive-first design**: All primary resource generation is driven by the game loop, not player interaction.
3. **Strategic upgrades**: Players spend resources on upgrades that alter passive rates — this is the primary form of player interaction.
4. **One layer per file**: Every Profectus layer lives in `src/data/layers/<id>.tsx`. Never put more than one layer in a single file.
5. **Never break existing systems**: When adding a new feature, add a new file. Only modify an existing file when strictly required (and document why).
6. **Always update `CHANGELOG.md`**: Every change must increment the version following [Semantic Versioning](https://semver.org/) and be documented in `CHANGELOG.md`.
7. **Clean Profectus-style TypeScript**: Use `createResource`, `createUpgrade`, `createLayer`, `createLazyProxy`, etc. from Profectus utilities. Match the style of existing framework code.
8. **New dependencies**: Flag any new dependency requirement in the PR/commit message **before** installing anything.

## Layer Structure

```
src/data/layers/
  ki.tsx          — Ki energy: the primary passive resource (v0.1.0)
  (future) training.tsx   — Passive training stats
  (future) zenkai.tsx     — Prestige mechanic (Zenkai boost)
```

## Coding Style

- All resource generation goes through `layer.on("update", diff => ...)`.
- Use `computed()` for reactive multipliers and gain rates.
- Use `createUpgrade` for one-time strategic player decisions.
- JSX for layer `display` functions.
- Every feature should have a comment explaining what it does.
- `projInfo.json` version number must match the current `CHANGELOG.md` release.
