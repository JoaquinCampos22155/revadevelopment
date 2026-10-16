import { randomBytes, randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const TRANSACTIONAL_MIGRATION_VERSIONS = ["20261015120000", "20261015143000", "20261015170000", "20261016110000", "20261016150000", "20261016153000", "20261016160000", "20261016170000"];
const qaDirectory = path.join(process.env.LOCALAPPDATA ?? path.join(homedir(), "AppData", "Local"), "REVA", "transactional-qa");
const credentialsPath = path.join(qaDirectory, "credentials.json");
const encryptionKeyPath = path.join(qaDirectory, "encryption-key-v1.txt");
const hmacKeyPath = path.join(qaDirectory, "hmac-key-v1.txt");
const manifestPath = path.join(qaDirectory, "fixtures.json");
const pnpmEntrypoint = path.join(path.dirname(process.execPath), "node_modules", "corepack", "dist", "pnpm.js");

function isLoopback(hostname) {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

export function assertLocalSupabaseEndpoints({ apiUrl, databaseUrl }) {
  try {
    const api = new URL(apiUrl);
    const database = new URL(databaseUrl);
    if (!isLoopback(api.hostname) || !isLoopback(database.hostname)) throw new Error("loopback endpoints required");
  } catch {
    throw new Error("Local transactional QA requires loopback Supabase API and database endpoints.");
  }
}

export function isCanonicalAes256Key(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value)) return false;
  const key = Buffer.from(value, "base64url");
  return key.byteLength === 32 && key.toString("base64url") === value;
}

export async function readOrRecoverCredentials(filePath, recover) {
  let contents;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    const credentials = await recover();
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(credentials, null, 2)}\n`, { flag: "wx", mode: 0o600 });
    return credentials;
  }
  return JSON.parse(contents);
}

async function readOrCreateLocalHmacKey() {
  await mkdir(qaDirectory, { recursive: true });
  try {
    return (await readFile(hmacKeyPath, "utf8")).trim();
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    const generated = randomBytes(32).toString("base64url");
    try {
      await writeFile(hmacKeyPath, `${generated}\n`, { flag: "wx", mode: 0o600 });
      return generated;
    } catch (writeError) {
      if (writeError?.code !== "EEXIST") throw writeError;
      return (await readFile(hmacKeyPath, "utf8")).trim();
    }
  }
}

export function launchDetachedProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { detached: true, stdio: "ignore" });
    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error || result.status !== 0) throw new Error(`${command} failed during local QA setup.`);
  return result.stdout;
}

function loadSupabaseStatus() {
  const output = run(process.execPath, [pnpmEntrypoint, "exec", "supabase", "status", "--output", "json"]);
  const jsonStart = output.indexOf("{");
  if (jsonStart < 0) throw new Error("Local Supabase is not available. Start the local stack first.");
  const status = JSON.parse(output.slice(jsonStart));
  const apiUrl = status.API_URL;
  const databaseUrl = status.DB_URL;
  assertLocalSupabaseEndpoints({ apiUrl, databaseUrl });
  for (const name of ["PUBLISHABLE_KEY", "SERVICE_ROLE_KEY"]) {
    if (typeof status[name] !== "string" || !status[name]) throw new Error("Local Supabase returned incomplete local configuration.");
  }
  return { apiUrl, databaseUrl, publishableKey: status.PUBLISHABLE_KEY, serviceRoleKey: status.SERVICE_ROLE_KEY };
}

function assertTransactionalMigrationsApplied() {
  const versions = TRANSACTIONAL_MIGRATION_VERSIONS.map((version) => `'${version}'`).join(",");
  const query = `select count(*) from supabase_migrations.schema_migrations where version in (${versions});`;
  const result = run("docker", ["exec", "supabase_db_revadevelopment", "psql", "-U", "postgres", "-d", "postgres", "-At", "-c", query]);
  if (result.trim() !== String(TRANSACTIONAL_MIGRATION_VERSIONS.length)) throw new Error("The local transactional migrations are not fully applied; no reset or remote migration was attempted.");
}

async function ensureLocalFiles() {
  await mkdir(qaDirectory, { recursive: true });
  let credentials;
  try {
    credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
  } catch {
    credentials = {
      admin: { email: "reva-local-admin@local.test", password: randomBytes(24).toString("base64url") },
      customer: { email: "reva-local-customer@local.test", password: randomBytes(24).toString("base64url") },
    };
    await writeFile(credentialsPath, `${JSON.stringify(credentials, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  }

  let encryptionKey;
  try {
    encryptionKey = (await readFile(encryptionKeyPath, "utf8")).trim();
  } catch {
    encryptionKey = randomBytes(32).toString("base64url");
    await writeFile(encryptionKeyPath, `${encryptionKey}\n`, { flag: "wx", mode: 0o600 });
  }
  if (!isCanonicalAes256Key(encryptionKey)) throw new Error("Local encryption key file is invalid.");
  const hmacKey = await readOrCreateLocalHmacKey();
  if (!isCanonicalAes256Key(hmacKey) || hmacKey === encryptionKey) throw new Error("Local HMAC key file is invalid or reuses the encryption key.");
  return { credentials, encryptionKey, hmacKey };
}

async function findOrCreateUser(client, identity) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error("Could not inspect local synthetic Auth identities.");
    const existing = data.users.find((user) => user.email?.toLowerCase() === identity.email.toLowerCase());
    if (existing) {
      const { error: updateError } = await client.auth.admin.updateUserById(existing.id, { password: identity.password, email_confirm: true });
      if (updateError) throw new Error("Could not refresh a local synthetic Auth identity.");
      return existing.id;
    }
    if (data.users.length < page * 100) break;
  }
  const { data, error } = await client.auth.admin.createUser({ email: identity.email, password: identity.password, email_confirm: true });
  if (error || !data.user) throw new Error("Could not create a local synthetic Auth identity.");
  return data.user.id;
}

async function setLocalSyntheticProfileRole(userId, role) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) throw new Error("Local synthetic profile id is invalid.");
  if (role !== "admin" && role !== "customer") throw new Error("Local synthetic profile role is invalid.");
  const query = `update public.profiles set role = '${role}' where id = '${userId}'; select role from public.profiles where id = '${userId}';`;
  const result = run("docker", ["exec", "supabase_db_revadevelopment", "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-At", "-c", query]);
  if (result.trim().split(/\r?\n/).at(-1) !== role) throw new Error("Local synthetic profile role could not be verified.");
}

async function signIn(apiUrl, publishableKey, identity) {
  const client = createClient(apiUrl, publishableKey, { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email: identity.email, password: identity.password });
  if (error || !data.user) throw new Error("Could not authenticate a local synthetic identity.");
  return { client, userId: data.user.id };
}

async function createDraftProduct(adminClient, slug, title, price, publish, imageBytes, imageDimensions) {
  const { data: draftRows, error: draftError } = await adminClient.rpc("create_product_draft_from_intake", {
    p_acquisition_cost: "1.00",
    p_audience: "unisex",
    p_brand: "REVA QA LOCAL",
    p_color: "Azul de prueba",
    p_condition_notes: "Fixture sintético local; no es inventario real.",
    p_condition_rating: "3",
    p_description: "Producto sintético para pruebas locales de Checkout y órdenes. No corresponde a inventario real.",
    p_garment_type: "pantalones",
    p_material_details: "Ilustración sintética de prueba",
    p_measurements: null,
    p_price: price,
    p_received_at: new Date().toISOString().slice(0, 10),
    p_size_label: "M",
    p_slug: slug,
    p_source_profile_id: "",
    p_source_type: "sell",
    p_title: title,
  });
  const draft = Array.isArray(draftRows) ? draftRows[0] : null;
  if (draftError || !draft || typeof draft.product_id !== "string" || typeof draft.sku !== "string") {
    throw new Error(`Could not seed a local synthetic Product draft (${draftError?.code ?? "no-row"}): ${draftError?.message ?? "missing row"}`);
  }
  const product = { id: draft.product_id, sku: draft.sku, slug };

  if (!publish) return { id: product.id, sku: product.sku, slug: product.slug, status: "draft" };

  const imageId = randomUUID();
  const storageKey = `products/${product.id}/${imageId}.webp`;
  const { error: uploadError } = await adminClient.storage.from("product-media").upload(storageKey, imageBytes, { cacheControl: "0", contentType: "image/webp", upsert: false });
  if (uploadError) throw new Error("Could not upload the local synthetic Product illustration.");
  const { error: imageError } = await adminClient.rpc("create_product_image_metadata", {
    p_alt_text_prefix: "Ilustración sintética de prueba local; no corresponde a inventario real.",
    p_height: imageDimensions.height,
    p_image_id: imageId,
    p_product_id: product.id,
    p_storage_key: storageKey,
    p_width: imageDimensions.width,
  });
  if (imageError) throw new Error("Could not create local synthetic Product image metadata.");

  const { data: readiness, error: readinessError } = await adminClient.rpc("get_product_publication_readiness", { p_product_id: product.id });
  const missingRequirements = Array.isArray(readiness) && readiness[0] && typeof readiness[0] === "object"
    ? readiness[0].missing_requirements
    : null;
  if (readinessError || !Array.isArray(missingRequirements) || missingRequirements.length > 0) {
    throw new Error(`Local synthetic Product is not ready for the normal publication lifecycle (${readinessError?.message ?? JSON.stringify(readiness)}).`);
  }
  const { error: prepareError } = await adminClient.rpc("prepare_product_publication", { p_product_id: product.id });
  if (prepareError) throw new Error("Could not prepare local synthetic Product publication.");
  const { error: copyError } = await adminClient.storage.from("product-media").copy(storageKey, `products/${imageId}.webp`, { destinationBucket: "public-product-media" });
  if (copyError) throw new Error("Could not materialize the local synthetic Product public image.");
  const { error: completeError } = await adminClient.rpc("complete_product_publication", { p_product_id: product.id });
  if (completeError) throw new Error("Could not complete local synthetic Product publication.");
  return { id: product.id, imageId, sku: product.sku, slug: product.slug, status: "published" };
}

async function setup() {
  const supabase = loadSupabaseStatus();
  assertTransactionalMigrationsApplied();
  const { credentials } = await ensureLocalFiles();
  const serviceClient = createClient(supabase.apiUrl, supabase.serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const adminId = await findOrCreateUser(serviceClient, credentials.admin);
  const customerId = await findOrCreateUser(serviceClient, credentials.customer);
  await setLocalSyntheticProfileRole(adminId, "admin");
  await setLocalSyntheticProfileRole(customerId, "customer");
  const { client: adminClient } = await signIn(supabase.apiUrl, supabase.publishableKey, credentials.admin);
  const { client: customerClient } = await signIn(supabase.apiUrl, supabase.publishableKey, credentials.customer);
  const customerProfile = await customerClient.from("profiles").select("id,role").eq("id", customerId).single();
  if (customerProfile.error || customerProfile.data?.role !== "customer") throw new Error("Local synthetic customer profile is not isolated as a customer.");

  const batch = randomBytes(3).toString("hex");
  const imageSource = await readFile(path.resolve("src/assets/product-denim-front.svg"));
  const { data: imageBytes, info: imageDimensions } = await sharp(imageSource).resize({ width: 720, height: 900, fit: "contain", background: "#f4f2ed" }).webp({ quality: 72 }).toBuffer({ resolveWithObject: true });
  const definitions = [
    ["success", "Prenda sintética QA · compra", "75.00", true],
    ["competition", "Prenda sintética QA · concurrencia", "82.00", true],
    ["stale-price", "Prenda sintética QA · precio", "64.00", true],
    ["multi-a", "Prenda sintética QA · selección A", "55.00", true],
    ["multi-b", "Prenda sintética QA · selección B", "61.00", true],
    ["unavailable", "Prenda sintética QA · no publicada", "49.00", false],
  ];
  const products = [];
  for (const [scenario, title, price, publish] of definitions) {
    products.push({
      ...(await createDraftProduct(adminClient, `qa-local-${batch}-${scenario}`, title, price, publish, imageBytes, imageDimensions)),
      scenario,
      price,
      title,
    });
  }
  const manifest = { batch, createdAt: new Date().toISOString(), products };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
  console.log(`Local synthetic identities and ${products.length} Product fixtures are ready. Credential file: ${credentialsPath}`);
  console.log(`Fixture manifest: ${manifestPath}`);
  console.log("All identities, credentials, database records, and media are local-only.");
}

function readEncryptionKey() {
  return readFile(encryptionKeyPath, "utf8").then((value) => value.trim());
}

function configureLocalEnvironment(supabase, encryptionKey, hmacKey, development) {
  if (development) process.env.NODE_ENV = "development";
  else delete process.env.NODE_ENV;
  process.env.NEXT_PUBLIC_SUPABASE_URL = supabase.apiUrl;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = supabase.publishableKey;
  process.env.SUPABASE_SERVICE_ROLE_KEY = supabase.serviceRoleKey;
  process.env.REVA_ENCRYPTION_ACTIVE_VERSION = "1";
  process.env.REVA_ENCRYPTION_KEY_V1 = encryptionKey;
  process.env.REVA_HMAC_ACTIVE_VERSION = "1";
  process.env.REVA_HMAC_KEY_V1 = hmacKey;
  process.env.REVA_LOCAL_TRANSACTIONAL_ENABLED = "true";
}

async function runLocalCommand(command, args) {
  const supabase = loadSupabaseStatus();
  assertTransactionalMigrationsApplied();
  const encryptionKey = await readEncryptionKey();
  const hmacKey = await readOrCreateLocalHmacKey();
  if (!isCanonicalAes256Key(encryptionKey) || !isCanonicalAes256Key(hmacKey) || encryptionKey === hmacKey) throw new Error("Local transactional key files are invalid or reuse key material.");
  configureLocalEnvironment(supabase, encryptionKey, hmacKey, args[0] === "dev");
  const result = spawnSync(process.execPath, [pnpmEntrypoint, ...args], { stdio: "inherit", env: process.env });
  if (result.error || result.status !== 0) process.exitCode = result.status ?? 1;
}

async function openCredentials() {
  await readOrRecoverCredentials(credentialsPath, async () => {
    const supabase = loadSupabaseStatus();
    const credentials = {
      admin: { email: "reva-local-admin@local.test", password: randomBytes(24).toString("base64url") },
      customer: { email: "reva-local-customer@local.test", password: randomBytes(24).toString("base64url") },
    };
    const serviceClient = createClient(supabase.apiUrl, supabase.serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const adminId = await findOrCreateUser(serviceClient, credentials.admin);
    const customerId = await findOrCreateUser(serviceClient, credentials.customer);
    await setLocalSyntheticProfileRole(adminId, "admin");
    await setLocalSyntheticProfileRole(customerId, "customer");
    for (const identity of [credentials.admin, credentials.customer]) {
      const { client } = await signIn(supabase.apiUrl, supabase.publishableKey, identity);
      await client.auth.signOut();
    }
    return credentials;
  });
  await launchDetachedProcess("notepad.exe", [credentialsPath]);
  console.log(`Opened local-only synthetic credentials: ${credentialsPath}`);
}

async function main() {
  const action = process.argv[2];
  if (action === "setup") return setup();
  if (action === "start") return runLocalCommand("pnpm", ["dev", "--hostname", "127.0.0.1", "--port", "3000"]);
  if (action === "build") return runLocalCommand("pnpm", ["build"]);
  if (action === "credentials") return openCredentials();
  throw new Error("Usage: node scripts/local-transactional-qa.mjs <setup|start|build|credentials>");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
