import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

import * as encryption from "../src/features/transactions/server/encryption.ts";

const { decodeAes256Key, decryptSensitiveValue, encryptSensitiveValue } = encryption;

const keyring = new Map([[1, randomBytes(32)]]);
const context = { field: "first_name", recordId: "3b10d8d4-5e82-4f89-bf5e-10477002ca34", recordType: "purchase_request" };

test("sensitive values round-trip and ciphertext does not contain plaintext", () => {
  const encrypted = encryptSensitiveValue("Ana María", context, keyring, 1);

  assert.equal(decryptSensitiveValue(encrypted, context, keyring), "Ana María");
  assert.equal(encrypted.keyVersion, 1);
  assert.equal(JSON.stringify(encrypted).includes("Ana María"), false);
});

test("authenticated context prevents ciphertext from moving to another field or record", () => {
  const encrypted = encryptSensitiveValue("55551234", { ...context, field: "phone" }, keyring, 1);

  assert.throws(() => decryptSensitiveValue(encrypted, { ...context, field: "first_name" }, keyring));
  assert.throws(() => decryptSensitiveValue(encrypted, { ...context, recordId: "0ef3a4f0-5d7f-445d-b7f2-57716bff2870" }, keyring));
});

test("tampering and unavailable key versions fail closed", () => {
  const encrypted = encryptSensitiveValue("Casa 12", { ...context, field: "address" }, keyring, 1);
  const tampered = { ...encrypted, ciphertext: `${encrypted.ciphertext.slice(0, -2)}AA` };

  assert.throws(() => decryptSensitiveValue(tampered, { ...context, field: "address" }, keyring));
  assert.throws(() => decryptSensitiveValue({ ...encrypted, keyVersion: 2 }, { ...context, field: "address" }, keyring));
});

test("serialized ciphertext survives a process-style keyring reload and v1-to-v2 rotation", () => {
  const keyV1 = randomBytes(32);
  const keyV2 = randomBytes(32);
  const original = encryptSensitiveValue("Avenida Reforma 10-00", { ...context, field: "street" }, new Map([[1, keyV1]]), 1);
  const persisted = JSON.parse(JSON.stringify(original));
  const restoredKeyring = new Map([[1, keyV1], [2, keyV2]]);

  assert.equal(decryptSensitiveValue(persisted, { ...context, field: "street" }, restoredKeyring), "Avenida Reforma 10-00");
  const rotated = encryptSensitiveValue("Zona 10", { ...context, field: "zone" }, restoredKeyring, 2);
  assert.equal(decryptSensitiveValue(rotated, { ...context, field: "zone" }, restoredKeyring), "Zona 10");
  assert.equal(decryptSensitiveValue(persisted, { ...context, field: "street" }, restoredKeyring), "Avenida Reforma 10-00");
  assert.throws(() => decryptSensitiveValue(persisted, { ...context, field: "street" }, new Map([[2, keyV2]])));
});

test("AES-256 key loader rejects missing, malformed, padded, and wrong-length values", () => {
  const valid = randomBytes(32).toString("base64url");

  assert.equal(decodeAes256Key(undefined), null);
  assert.equal(decodeAes256Key("not-a-key"), null);
  assert.equal(decodeAes256Key(`${valid}=`), null);
  assert.equal(decodeAes256Key(randomBytes(31).toString("base64url")), null);
  assert.deepEqual(Buffer.from(decodeAes256Key(valid)), Buffer.from(valid, "base64url"));
});

test("versioned encryption and independent HMAC keyrings select active versions separately", () => {
  assert.equal(typeof encryption.loadTransactionalKeyrings, "function");
  const aesV1 = randomBytes(32);
  const aesV2 = randomBytes(32);
  const hmacV1 = randomBytes(32);
  const hmacV2 = randomBytes(32);
  const env = {
    REVA_ENCRYPTION_ACTIVE_VERSION: "2",
    REVA_ENCRYPTION_KEY_V1: aesV1.toString("base64url"),
    REVA_ENCRYPTION_KEY_V2: aesV2.toString("base64url"),
    REVA_HMAC_ACTIVE_VERSION: "1",
    REVA_HMAC_KEY_V1: hmacV1.toString("base64url"),
    REVA_HMAC_KEY_V2: hmacV2.toString("base64url"),
  };

  const keyrings = encryption.loadTransactionalKeyrings(env);

  assert.equal(keyrings.encryption.activeVersion, 2);
  assert.equal(keyrings.hmac.activeVersion, 1);
  assert.deepEqual(Buffer.from(keyrings.encryption.keys.get(1)), aesV1);
  assert.deepEqual(Buffer.from(keyrings.encryption.keys.get(2)), aesV2);
  assert.deepEqual(Buffer.from(keyrings.hmac.keys.get(1)), hmacV1);
  assert.deepEqual(Buffer.from(keyrings.hmac.keys.get(2)), hmacV2);
});

test("transaction keyrings fail closed for missing active keys and shared AES/HMAC material", () => {
  assert.equal(typeof encryption.loadTransactionalKeyrings, "function");
  const aesKey = randomBytes(32).toString("base64url");
  const hmacKey = randomBytes(32).toString("base64url");
  const validEnv = {
    REVA_ENCRYPTION_ACTIVE_VERSION: "1",
    REVA_ENCRYPTION_KEY_V1: aesKey,
    REVA_HMAC_ACTIVE_VERSION: "1",
    REVA_HMAC_KEY_V1: hmacKey,
  };

  assert.throws(() => encryption.loadTransactionalKeyrings({ ...validEnv, REVA_HMAC_KEY_V1: aesKey }), /independent/i);
  assert.throws(() => encryption.loadTransactionalKeyrings({ ...validEnv, REVA_ENCRYPTION_ACTIVE_VERSION: "2" }), /active/i);
  assert.throws(() => encryption.loadTransactionalKeyrings({ ...validEnv, REVA_HMAC_KEY_V1: `${hmacKey}=` }), /invalid/i);
});
