import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export type SensitiveValueContext = Readonly<{
  field: string;
  recordId: string;
  recordType: "purchase_request" | "order";
}>;

export type EncryptedSensitiveValue = Readonly<{
  ciphertext: string;
  nonce: string;
  tag: string;
  keyVersion: number;
}>;

export type VersionedKeyring = Readonly<{
  activeVersion: number;
  keys: ReadonlyMap<number, Uint8Array>;
}>;

export type TransactionalKeyrings = Readonly<{
  encryption: VersionedKeyring;
  hmac: VersionedKeyring;
}>;

const ALGORITHM = "aes-256-gcm";
const NONCE_BYTES = 12;
const TAG_BYTES = 16;

/** Decode one canonical, unpadded base64url-encoded 256-bit AES key. */
export function decodeAes256Key(encoded: string | undefined): Uint8Array | null {
  if (!encoded || !/^[A-Za-z0-9_-]{43}$/.test(encoded)) return null;
  const key = Buffer.from(encoded, "base64url");
  return key.byteLength === 32 && key.toString("base64url") === encoded ? key : null;
}

function loadVersionedKeyring(
  environment: Readonly<Record<string, string | undefined>>,
  activeVersionName: string,
  keyPrefix: string,
): VersionedKeyring {
  const activeValue = environment[activeVersionName];
  if (!activeValue || !/^[1-9]\d{0,3}$/.test(activeValue)) throw new Error("Transactional keyring configuration is invalid.");
  const activeVersion = Number(activeValue);
  const versionPrefix = `${keyPrefix}_V`;
  const keys = new Map<number, Uint8Array>();

  for (const [name, value] of Object.entries(environment)) {
    if (!name.startsWith(versionPrefix)) continue;
    const versionValue = name.slice(versionPrefix.length);
    if (!/^[1-9]\d{0,3}$/.test(versionValue) || !value) throw new Error("Transactional keyring configuration is invalid.");
    const version = Number(versionValue);
    const key = decodeAes256Key(value);
    if (!key || keys.has(version)) throw new Error("Transactional keyring configuration is invalid.");
    keys.set(version, key);
  }

  if (!keys.has(activeVersion) || keys.size === 0) throw new Error("Transactional active key is unavailable.");
  const uniqueKeyBytes = new Set([...keys.values()].map((key) => Buffer.from(key).toString("hex")));
  if (uniqueKeyBytes.size !== keys.size) throw new Error("Transactional key versions must contain distinct key material.");
  return { activeVersion, keys };
}

/** Load distinct, versioned keyrings; AES and HMAC configuration never share key material. */
export function loadTransactionalKeyrings(
  environment: Readonly<Record<string, string | undefined>>,
): TransactionalKeyrings {
  const encryption = loadVersionedKeyring(environment, "REVA_ENCRYPTION_ACTIVE_VERSION", "REVA_ENCRYPTION_KEY");
  const hmac = loadVersionedKeyring(environment, "REVA_HMAC_ACTIVE_VERSION", "REVA_HMAC_KEY");
  const encryptionBytes = new Set([...encryption.keys.values()].map((key) => Buffer.from(key).toString("hex")));
  if ([...hmac.keys.values()].some((key) => encryptionBytes.has(Buffer.from(key).toString("hex")))) {
    throw new Error("Transactional AES and HMAC key material must be independent.");
  }
  return { encryption, hmac };
}

function associatedData(context: SensitiveValueContext, keyVersion: number): Buffer {
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(context.field) || !/^[0-9a-f-]{36}$/i.test(context.recordId)) {
    throw new Error("Sensitive-value context is invalid.");
  }

  return Buffer.from(`${context.recordType}:${context.recordId}:${context.field}:v${keyVersion}`, "utf8");
}

function getKey(keyring: ReadonlyMap<number, Uint8Array>, keyVersion: number): Uint8Array {
  const key = keyring.get(keyVersion);
  if (!Number.isSafeInteger(keyVersion) || keyVersion < 1 || !key || key.byteLength !== 32) {
    throw new Error("Sensitive-value key version is unavailable.");
  }

  return key;
}

export function encryptSensitiveValue(
  plaintext: string,
  context: SensitiveValueContext,
  keyring: ReadonlyMap<number, Uint8Array>,
  keyVersion: number,
): EncryptedSensitiveValue {
  const key = getKey(keyring, keyVersion);
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, nonce, { authTagLength: TAG_BYTES });
  cipher.setAAD(associatedData(context, keyVersion));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  return {
    ciphertext: ciphertext.toString("base64url"),
    nonce: nonce.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    keyVersion,
  };
}

export function decryptSensitiveValue(
  encrypted: EncryptedSensitiveValue,
  context: SensitiveValueContext,
  keyring: ReadonlyMap<number, Uint8Array>,
): string {
  const key = getKey(keyring, encrypted.keyVersion);
  const nonce = Buffer.from(encrypted.nonce, "base64url");
  const tag = Buffer.from(encrypted.tag, "base64url");
  const ciphertext = Buffer.from(encrypted.ciphertext, "base64url");
  if (nonce.byteLength !== NONCE_BYTES || tag.byteLength !== TAG_BYTES) {
    throw new Error("Sensitive value could not be decrypted.");
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, key, nonce, { authTagLength: TAG_BYTES });
    decipher.setAAD(associatedData(context, encrypted.keyVersion));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Sensitive value could not be decrypted.");
  }
}
