import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { assertLocalSupabaseEndpoints, isCanonicalAes256Key, readOrRecoverCredentials, launchDetachedProcess } from "../scripts/local-transactional-qa.mjs";

test("local QA accepts loopback Supabase API and database endpoints", () => {
  assert.doesNotThrow(() => assertLocalSupabaseEndpoints({
    apiUrl: "http://127.0.0.1:54321",
    databaseUrl: "postgresql://postgres:postgres@localhost:54322/postgres",
  }));
});

test("local QA refuses a remote Supabase API endpoint", () => {
  assert.throws(() => assertLocalSupabaseEndpoints({
    apiUrl: "https://example.supabase.co",
    databaseUrl: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  }), /loopback/);
});

test("local QA refuses a remote database endpoint", () => {
  assert.throws(() => assertLocalSupabaseEndpoints({
    apiUrl: "http://127.0.0.1:54321",
    databaseUrl: "postgresql://postgres:postgres@db.example.test:5432/postgres",
  }), /loopback/);
});

test("local QA accepts only canonical unpadded 256-bit base64url keys", () => {
  const validKey = randomBytes(32).toString("base64url");

  assert.equal(isCanonicalAes256Key(validKey), true);
  assert.equal(isCanonicalAes256Key(`${validKey}=`), false);
  assert.equal(isCanonicalAes256Key(randomBytes(31).toString("base64url")), false);
  assert.equal(isCanonicalAes256Key("malformed"), false);
  assert.equal(isCanonicalAes256Key(undefined), false);
});

test("local QA recreates only a missing credentials file through its recovery callback", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "reva-credentials-test-"));
  const filePath = path.join(directory, "credentials.json");
  const expected = { admin: { email: "admin@local.test", password: "synthetic" } };
  let recoveries = 0;

  try {
    const credentials = await readOrRecoverCredentials(filePath, async () => {
      recoveries += 1;
      return expected;
    });

    assert.deepEqual(credentials, expected);
    assert.deepEqual(JSON.parse(await readFile(filePath, "utf8")), expected);
    assert.equal(recoveries, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("local QA preserves an existing credentials file without resetting passwords", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "reva-credentials-test-"));
  const filePath = path.join(directory, "credentials.json");
  const expected = { admin: { email: "admin@local.test", password: "preserved" } };
  let recoveries = 0;

  try {
    await writeFile(filePath, JSON.stringify(expected));
    const credentials = await readOrRecoverCredentials(filePath, async () => {
      recoveries += 1;
      return { admin: { email: "admin@local.test", password: "replacement" } };
    });

    assert.deepEqual(credentials, expected);
    assert.equal(recoveries, 0);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("opening local credentials launches the viewer without waiting for it to close", async () => {
  const started = performance.now();
  await launchDetachedProcess(process.execPath, ["-e", "setTimeout(() => {}, 400)"]);
  assert.ok(performance.now() - started < 300);
});
