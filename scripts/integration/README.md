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

### Fresh B2-B disposable database

The approved launcher is `pnpm exec node scripts/integration/start-isolated-supabase.mjs --run-local-qa-integration --create-disposable`. It creates a new temporary Supabase workdir with a unique project ID, a non-overlapping 12-port range, and a dedicated Docker bridge configured with `com.docker.network.bridge.host_binding_ipv4=127.0.0.1`, then starts Supabase with `--network-id`. The launcher removes inherited Supabase, REVA key, and common database connection variables from child processes and verifies every project's containers use only the named isolated network and every published port binds to loopback within the reserved range both before reset and immediately after reset. A failed post-reset check stops only that exact project and prevents it from being reported ready. **This is detection, not proof that reset never exposes a wildcard-bound port:** a prior reset/recreation changed the database binding from loopback to `0.0.0.0` even though the bridge option remained loopback. Do not run this launcher or any reset/replay until a supported configuration has been shown to keep every effective binding on loopback throughout recreation. If any published binding is not loopback, stop that exact project, preserve its volumes, and do not run tests. The post-reset guard has not yet been runtime-tested after this source correction.

The generated workdir and network are intentionally retained for inspection and reuse; the launcher does not remove volumes or prune Docker. To stop one confirmed disposable stack without deleting its volumes, use `pnpm exec supabase --workdir <exact-temp-workdir> stop` after confirming that exact project ID and workdir. Never target the repository's shared project or another QA project. Supabase's [local development guidance](https://supabase.com/docs/guides/local-development) documents the loopback-bound bridge/network approach; verify effective Docker bindings for the installed CLI instead of assuming defaults are safe.
