## Summary

<!-- One paragraph: what this PR does and why. Link related issues: Closes #123 -->

## Type of change

<!-- Check all that apply -->

- [ ] `feat` — new feature or API addition
- [ ] `fix` — bug fix
- [ ] `perf` — performance improvement (no API change)
- [ ] `refactor` — code restructuring (no behavior change)
- [ ] `docs` — documentation only
- [ ] `test` — test addition or fix
- [ ] `chore` / `ci` / `build` — tooling, CI, build changes

## Changes

<!-- Bullet list of what changed. Reference files/lines where useful. -->

-
-

## Test plan

<!-- How was this tested? What new tests were added? -->

- [ ] Added tests covering the new behavior
- [ ] Ran `npm test` — all tests pass (`node --test`)
- [ ] Manual verification: <!-- describe steps -->

## Breaking changes

<!-- List any breaking API changes and the migration path, or write "None". -->

---

## Pre-merge checklist

<!-- All boxes must be checked before merging. CI enforces what it can automatically. -->

- [ ] `npm test` passes on Node 18/20/22
- [ ] Commit messages follow Conventional Commits (`type(scope): subject`)
- [ ] Docs updated if API changed (`README.md`, `docs/`)
- [ ] `types/*.d.ts` updated if public API changed
- [ ] No new runtime dependencies added (zero-dependency invariant)
- [ ] No client-side JS introduced outside the documented Suspense swap script (see `docs/ai/AGENT_CONTEXT.md`)
