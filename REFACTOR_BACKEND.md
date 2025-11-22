# Backend refactor and linting plan

## Goal

Improve backend code quality incrementally without breaking existing runtime behavior. Add linting/formatting, create a safe refactor checklist, and extract business logic into `services/` gradually.

## What I added

- ESLint config (`.eslintrc.js`) compatible with ESM/node
- Prettier config (`.prettierrc`)
- `.eslintignore`
- npm scripts in `package.json`: `lint`, `lint:fix`, `format`

## Safe, incremental refactor steps

1. Lint-only pass (no code moves)

   - Run `npm install` (dev deps were added) then `npm run lint` to list problems.
   - Address only clear issues (`no-unused-vars`, stylistic). Prefer `// eslint-disable-next-line` for risky fixes.

2. Add a `services/` layer in place

   - For a small controller file (pick one low-risk endpoint), create `services/<feature>.service.js` and copy the business logic there.
   - Keep controller thin: call service and handle HTTP response.
   - Add unit tests for the service if possible.

3. Standardize code shape

   - Adopt consistent error handling via existing `utils/appError.js` and `middlewares/error.middleware.js`.
   - Add JSDoc comments for complex functions to help later TypeScript migration.

4. Move other controllers incrementally

   - Repeat step 2 per controller; keep each change small and tested.

5. Optional: migrate backend to TypeScript
   - After services are stable and typed with JSDoc, plan a TS migration (separate PRs per folder).

## Running locally

In `server/` run:

```powershell
npm install
npm run lint        # report lint issues
npm run lint:fix    # automatically fix where safe
npm run format      # run prettier
```

## Notes & safety

- Avoid renaming files or changing exports in bulk.
- Keep PRs small (one controller/service per PR) and test endpoints manually.
- Use feature flags if you need to gate larger behavior changes.
