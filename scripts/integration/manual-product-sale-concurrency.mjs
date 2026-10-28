import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { requireLocalQaMutationOptIn } from "../local-qa-test-authorization.mjs";

requireLocalQaMutationOptIn();

const container = "supabase_db_revadevelopment";
const migrationVersion = "20261027110000";
const userId = randomUUID();
const intakeId = randomUUID();
const productId = randomUUID();
const suffix = `${Date.now()}${Math.floor(Math.random() * 10_000)}`;
const sku = `RV-${suffix}`;
const slug = `manual-sale-race-${productId.replaceAll("-", "")}`;

function startPsql() {
  return spawn("docker", ["exec", "-i", container, "psql", "-X", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-At"], { stdio: ["pipe", "pipe", "pipe"] });
}

function runSql(sql) {
  return new Promise((resolve, reject) => {
    const process = startPsql();
    let stdout = "";
    let stderr = "";
    process.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    process.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    process.once("error", reject);
    process.once("close", (code) => code === 0 ? resolve(stdout.trim()) : reject(new Error(`Local psql command failed (${code}): ${stderr.trim()}`)));
    process.stdin.end(sql);
  });
}

function waitForOutput(process, marker, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error("Timed out waiting for the local lock holder.")), timeoutMs);
    process.stdout.setEncoding("utf8").on("data", (chunk) => {
      output += chunk;
      if (output.includes(marker)) {
        clearTimeout(timeout);
        resolve();
      }
    });
    process.once("error", (error) => { clearTimeout(timeout); reject(error); });
    process.once("close", (code) => {
      clearTimeout(timeout);
      if (!output.includes(marker)) reject(new Error(`Local lock holder exited before acquiring its lock (${code}).`));
    });
  });
}

async function waitForBothCallersToBlock() {
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    const waiting = await runSql("select count(*) from pg_stat_activity where state = 'active' and wait_event_type = 'Lock' and query like '%admin_mark_product_sold%';");
    if (waiting === "2") return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Both local sale attempts did not reach the Product row lock in time.");
}

async function waitForProcess(process) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    process.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    process.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    process.once("error", reject);
    process.once("close", (code) => resolve({ code, stdout, stderr }));
  });
}

const productSql = `
insert into auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values('${userId}','authenticated','authenticated','manual-sale-race-${productId}@local.test','{}'::jsonb,'{}'::jsonb,now(),now());
update public.profiles set role='admin' where id='${userId}';
insert into public.intake_items(id,source_type,destination,created_by_profile_id,acquisition_cost,received_at)
values('${intakeId}','sell','catalog','${userId}',1.00,current_date);
insert into public.products(id,intake_item_id,created_by_profile_id,sku,slug,title,status)
values('${productId}','${intakeId}','${userId}','${sku}','${slug}','Synthetic local race fixture','draft');
`;

async function cleanup() {
  await runSql(`delete from private.product_lifecycle_events where product_id='${productId}'; delete from public.products where id='${productId}'; delete from public.intake_items where id='${intakeId}'; delete from public.profiles where id='${userId}'; delete from auth.users where id='${userId}';`);
}

let fixtureCreated = false;
let lockHolder;
let callers = [];

try {
  const localConfirmation = await runSql(`select exists(select 1 from supabase_migrations.schema_migrations where version='${migrationVersion}') and current_database()='postgres';`);
  if (localConfirmation !== "t") throw new Error("Required manual-sale migration is not applied to the expected local database.");

  await runSql(productSql);
  fixtureCreated = true;

  lockHolder = startPsql();
  const lockOutput = waitForOutput(lockHolder, "PRODUCT_LOCK_HELD");
  lockHolder.stdin.write(`begin; select id from public.products where id='${productId}' for update; \\echo PRODUCT_LOCK_HELD\n`);
  await lockOutput;

  const callerSql = `\\set VERBOSITY verbose\nbegin; set local role authenticated; select set_config('request.jwt.claim.sub','${userId}',true); select * from public.admin_mark_product_sold('${productId}','draft',true); commit;`;
  callers = [startPsql(), startPsql()];
  const callerResults = callers.map(waitForProcess);
  for (const caller of callers) caller.stdin.end(callerSql);

  let bothBlocked = false;
  try {
    await waitForBothCallersToBlock();
    bothBlocked = true;
  } finally {
    lockHolder.stdin.end("commit;\n\\q\n");
  }

  const results = await Promise.all(callerResults);
  const successes = results.filter((result) => result.code === 0);
  const rejected = results.filter((result) => result.code !== 0 && result.stderr.includes("PRODUCT_ALREADY_SOLD"));
  if (!bothBlocked || successes.length !== 1 || rejected.length !== 1) {
    throw new Error("Concurrent local manual-sale attempts did not produce exactly one winner and one duplicate-sale rejection.");
  }

  const finalState = await runSql(`select p.status || ':' || count(e.id)::text from public.products p left join private.product_lifecycle_events e on e.product_id=p.id where p.id='${productId}' group by p.status;`);
  if (finalState !== "sold:1") throw new Error("Local concurrency fixture did not finish with one Sold state and one audit event.");

  console.log("Local concurrent manual-sale test passed: one transition succeeded, one duplicate was rejected, and one audit event was written.");
} finally {
  if (lockHolder && lockHolder.exitCode === null) {
    lockHolder.stdin.end("rollback;\n\\q\n");
    await waitForProcess(lockHolder).catch(() => undefined);
  }
  await Promise.all(callers.map((process) => process.exitCode === null ? waitForProcess(process).catch(() => undefined) : Promise.resolve()));
  if (fixtureCreated) await cleanup();
}
