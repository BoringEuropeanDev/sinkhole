# Contributing

Thanks for helping improve Sinkhole.

## Add a new tool
1. Add metadata in `app/lib/tools.js`.
2. Add processing logic in `app/api/tools/route.js`.
3. Validate local behavior and update docs.

## Design principles
- No paywalls or auth walls.
- Single-purpose, fast tools.
- Custom UI only (no website templates).

## Merge safety checklist (required)
To prevent unresolved merge conflicts from ever reaching a branch:
1. Rebase before opening/updating your PR:
   - `git fetch origin`
   - `git rebase origin/main`
2. Run conflict marker check:
   - `npm run check:conflicts`
3. If conflicts are reported, resolve them and re-run the check before pushing.
