# Local REVA integration checks

These scripts are intentionally outside Node's routine test-file naming patterns. The root `pnpm test` command runs only `tests/*.test.mjs`.

Every integration script requires `--run-local-qa-integration`. Scripts that create or delete fixtures, submit purchase requests, alter Orders/reservations, or invoke cleanup also require `--allow-local-qa-mutations`.

Examples for an explicitly approved local integration run (mutating examples require a disposable target):

```powershell
node scripts/integration/local-auth-browser.mjs --run-local-qa-integration
node scripts/integration/manual-product-sale-concurrency.mjs --run-local-qa-integration --allow-local-qa-mutations
node scripts/integration/manual-product-sold-browser.mjs --run-local-qa-integration --allow-local-qa-mutations
```

**Do not run `transactional-flow.mjs` against the shared `revadevelopment` local Supabase database.** It invokes the global `cleanup_transactional_records` RPC and can affect unrelated expired local QA rows. Its explicit invocation is `node scripts/integration/transactional-flow.mjs --run-local-qa-integration --allow-local-qa-mutations`, but that command is **not safe to execute yet**: the script remains bound to the repository's shared Supabase project/container. First establish and verify a disposable Supabase CLI workdir with a distinct project ID, ports, Docker containers, synthetic fixtures, and no copied QA data; then adapt and test the script's target selection. These flags are an accidental-execution barrier, not database isolation.

The two manual-Sold browser/concurrency scripts also write and remove synthetic fixture rows in the currently configured local database. Do not run them against shared QA during this task; use the same disposable-stack strategy before repeating mutating browser/concurrency coverage.

The Supabase pgTAP transactional suites also call global cleanup. Do not run the aggregate `supabase test db` command against shared local QA for this Sprint. Run them only in the future disposable stack. Non-transactional Node tests may be run with `pnpm test`.
