import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { access, copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PNPM_ENTRY = path.join(path.dirname(process.execPath), "node_modules", "corepack", "dist", "pnpm.js");
const PORT_BLOCK_SIZE = 12;

export function arePublishedBindingsLoopback(portMap, portBase) {
  if (!portMap || typeof portMap !== "object" || Array.isArray(portMap)) return false;
  for (const bindings of Object.values(portMap)) {
    if (bindings === null) continue;
    if (!Array.isArray(bindings)) return false;
    for (const binding of bindings) {
      if (!binding || !["127.0.0.1", "::1"].includes(String(binding.HostIp).replace(/^\[|\]$/g, ""))) return false;
      if (portBase !== undefined) {
        const hostPort = Number(binding.HostPort);
        if (!Number.isInteger(hostPort) || hostPort < portBase || hostPort >= portBase + PORT_BLOCK_SIZE) return false;
      }
    }
  }
  return true;
}

export function isAttachedToIsolatedNetwork(networkMode, attachedNetworks, networkName) {
  return networkMode === networkName
    && typeof attachedNetworks === "object"
    && attachedNetworks !== null
    && Object.keys(attachedNetworks).length === 1
    && Object.hasOwn(attachedNetworks, networkName);
}

export function sanitizeSupabaseEnvironment(source) {
  const environment = { ...source };
  for (const name of Object.keys(environment)) {
    if (/^(?:SUPABASE_|NEXT_PUBLIC_SUPABASE_|REVA_|DATABASE_URL$|DIRECT_URL$|DB_(?:URL|HOST|PORT|NAME|USER|PASSWORD)$|POSTGRES(?:_|$)|PG[A-Z0-9_]*$)/i.test(name)) {
      delete environment[name];
    }
  }
  return environment;
}

function sanitizedEnvironment() {
  return sanitizeSupabaseEnvironment(process.env);
}

function run(command, args, { cwd = ROOT, timeout = 180_000 } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: sanitizedEnvironment(),
    encoding: "utf8",
    maxBuffer: 24 * 1024 * 1024,
    timeout,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Disposable Supabase step failed (${result.error?.code ?? result.status ?? "unknown"}).`);
  }
  return result.stdout ?? "";
}

async function portIsFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => server.close(() => resolve(true)));
  });
}

async function findPortBase() {
  for (let base = 56400; base <= 59000; base += PORT_BLOCK_SIZE) {
    const available = await Promise.all(Array.from({ length: PORT_BLOCK_SIZE }, (_, offset) => portIsFree(base + offset)));
    if (available.every(Boolean)) return base;
  }
  throw new Error("No free isolated Supabase port block was found.");
}

function rewriteConfig(config, projectId, basePort) {
  let currentSection = "";
  const ports = {
    api: { port: basePort },
    db: { port: basePort + 1, shadow_port: basePort + 6 },
    "db.pooler": { port: basePort + 9 },
    studio: { port: basePort + 2 },
    local_smtp: { port: basePort + 3 },
    analytics: { port: basePort + 7 },
  };
  const lines = config.replace(/^project_id\s*=\s*"[^"]+"/m, `project_id = "${projectId}"`).split(/\r?\n/);
  const seen = new Set();
  const rewritten = lines.map((line) => {
    const section = line.match(/^\[([^\]]+)\]$/);
    if (section) currentSection = section[1];
    const replacement = ports[currentSection];
    const setting = line.match(/^(port|shadow_port)\s*=\s*\d+\s*$/);
    if (replacement && setting && Object.hasOwn(replacement, setting[1])) {
      const key = `${currentSection}.${setting[1]}`;
      seen.add(key);
      return `${setting[1]} = ${replacement[setting[1]]}`;
    }
    return line;
  }).join("\n");
  const expected = Object.entries(ports).flatMap(([section, settings]) => Object.keys(settings).map((key) => `${section}.${key}`));
  if (seen.size !== expected.length || expected.some((entry) => !seen.has(entry))) throw new Error("Local Supabase configuration did not contain every expected port setting.");
  if (!rewritten.includes(`project_id = "${projectId}"`)) throw new Error("Isolated Supabase project identity was not written.");
  return rewritten;
}

async function copyProject(workdir, projectId, basePort) {
  const sourceConfig = await readFile(path.join(ROOT, "supabase", "config.toml"), "utf8");
  await mkdir(path.join(workdir, "supabase", "migrations"), { recursive: true });
  await mkdir(path.join(workdir, "supabase", "tests"), { recursive: true });
  await writeFile(path.join(workdir, "supabase", "config.toml"), rewriteConfig(sourceConfig, projectId, basePort), { flag: "wx" });
  await writeFile(path.join(workdir, "supabase", "seed.sql"), "-- Disposable database tests use no seed data.\n", { flag: "wx" });
  for (const [folder, destination] of [["migrations", "migrations"], ["tests", "tests"]]) {
    for (const name of await readdir(path.join(ROOT, "supabase", folder))) {
      if (!name.endsWith(".sql")) continue;
      await copyFile(path.join(ROOT, "supabase", folder, name), path.join(workdir, "supabase", destination, name));
    }
  }
}

function inspectNetwork(networkName) {
  const value = JSON.parse(run("docker", ["network", "inspect", networkName], { timeout: 15_000 }))[0];
  if (value?.Options?.["com.docker.network.bridge.host_binding_ipv4"] !== "127.0.0.1") {
    throw new Error("Docker loopback network option was not confirmed.");
  }
}

function inspectProjectContainers(projectId, portBase, networkName) {
  const names = run("docker", ["ps", "--all", "--filter", `name=${projectId}`, "--format", "{{.Names}}"], { timeout: 15_000 })
    .split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
  if (names.length < 8 || names.some((name) => !name.includes(projectId))) {
    throw new Error("Disposable Supabase container identity could not be verified.");
  }
  for (const name of names) {
    const [networkMode, networksJson, portsJson] = run("docker", ["inspect", "--format", "{{.HostConfig.NetworkMode}}|{{json .NetworkSettings.Networks}}|{{json .NetworkSettings.Ports}}", name], { timeout: 15_000 }).trim().split("|");
    const networks = JSON.parse(networksJson ?? "null");
    const ports = JSON.parse(portsJson ?? "null");
    if (!isAttachedToIsolatedNetwork(networkMode, networks, networkName)) {
      throw new Error("A disposable Supabase container is not attached only through its verified isolated network.");
    }
    if (!arePublishedBindingsLoopback(ports, portBase)) {
      throw new Error("A disposable Supabase service has an unapproved host binding or port.");
    }
  }
  return names;
}

function stopExactProject(workdir, projectId) {
  try { run(process.execPath, [PNPM_ENTRY, "exec", "supabase", "--workdir", workdir, "stop"], { cwd: ROOT, timeout: 120_000 }); } catch { /* Fall back to the exact generated container names below. */ }
  try {
    const names = run("docker", ["ps", "--all", "--filter", `name=${projectId}`, "--format", "{{.Names}}"], { timeout: 15_000 })
      .split(/\r?\n/).map((name) => name.trim()).filter((name) => name.includes(projectId));
    if (names.length) run("docker", ["stop", "--time", "2", ...names], { timeout: 30_000 });
  } catch { /* Preserve any remaining container evidence for manual inspection. */ }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (!args.has("--run-local-qa-integration") || !args.has("--create-disposable")) {
    throw new Error("Explicit opt-in required: --run-local-qa-integration --create-disposable");
  }
  if (args.size !== 2) throw new Error("Unexpected arguments; this launcher accepts only its two explicit opt-in flags.");
  await access(PNPM_ENTRY);

  const suffix = randomBytes(3).toString("hex");
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const projectId = `reva-b2b-accept-${date}-${suffix}`;
  const networkName = `${projectId}-loopback`;
  const workdir = path.join(os.tmpdir(), projectId);
  const basePort = await findPortBase();

  try { await access(workdir); throw new Error("Disposable workdir already exists; refusing to reuse it."); } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  await mkdir(workdir, { recursive: false });
  await copyProject(workdir, projectId, basePort);
  run("docker", ["network", "create", "--driver", "bridge", "--opt", "com.docker.network.bridge.host_binding_ipv4=127.0.0.1", networkName]);
  inspectNetwork(networkName);

  try {
    run(process.execPath, [PNPM_ENTRY, "exec", "supabase", "--workdir", workdir, "start", "--network-id", networkName, "--yes"], { cwd: ROOT, timeout: 240_000 });
    inspectProjectContainers(projectId, basePort, networkName);

    // No SQL or test fixtures are run until every published container port passes inspection.
    run(process.execPath, [PNPM_ENTRY, "exec", "supabase", "--workdir", workdir, "db", "reset", "--local", "--no-seed"], { cwd: ROOT, timeout: 240_000 });
    // Supabase may recreate the database container during reset; verify effective bindings again before reporting readiness.
    const verifiedContainers = inspectProjectContainers(projectId, basePort, networkName);
    const migrationStatus = run(process.execPath, [PNPM_ENTRY, "exec", "supabase", "--workdir", workdir, "migration", "list", "--local"], { cwd: ROOT, timeout: 30_000 });
    if (!migrationStatus.includes("20261030140000")) throw new Error("The isolated database did not report the latest local migration as applied.");
    console.log(`ISOLATED_SUPABASE_READY project=${projectId} workdir=${workdir} network=${networkName} api=http://127.0.0.1:${basePort} db=127.0.0.1:${basePort + 1} containers=${verifiedContainers.length} migrations=M001-M028`);
  } catch (error) {
    stopExactProject(workdir, projectId);
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Disposable Supabase setup failed.");
    process.exitCode = 1;
  });
}
