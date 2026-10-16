import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import { chromium } from "playwright";

const baseUrl = process.env.REVA_LOCAL_AUTH_BASE_URL ?? "http://127.0.0.1:3000";
const credentialsPath = path.join(
  process.env.LOCALAPPDATA ?? path.join(homedir(), "AppData", "Local"),
  "REVA",
  "transactional-qa",
  "credentials.json",
);
const credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
const expectedEmails = {
  admin: "reva-local-admin@local.test",
  customer: "reva-local-customer@local.test",
};

for (const role of Object.keys(expectedEmails)) {
  assert.equal(credentials[role]?.email, expectedEmails[role], `${role} QA identity mismatch`);
  assert.equal(typeof credentials[role]?.password, "string", `${role} QA password is missing`);
}

assert.equal(new URL(baseUrl).hostname, "127.0.0.1", "Browser tests must use the approved loopback host");

const browser = await chromium.launch({ headless: true });
const results = [];

async function signIn(context, identity) {
  const page = await context.newPage();
  let serverActionResponse = null;
  page.on("response", async (response) => {
    if (response.request().method() !== "POST" || !response.request().headers()["next-action"]) return;
    const location = response.headers().location;
    const actionRedirect = response.headers()["x-action-redirect"];
    serverActionResponse = {
      status: response.status(),
      redirect: location
        ? new URL(location, baseUrl).pathname + new URL(location, baseUrl).search
        : actionRedirect?.split(";")[0] ?? null,
    };
  });

  const initialResponse = await page.goto(`${baseUrl}/iniciar-sesion`, { waitUntil: "domcontentloaded" });
  assert.equal(initialResponse?.status(), 200, "Login page did not load");
  assert.equal(new URL(page.url()).origin, baseUrl, "Login page changed origin");
  assert.deepEqual(await context.cookies(baseUrl), [], "Fresh browser context unexpectedly has cookies");

  await page.getByLabel("Correo electrónico").first().fill(identity.email);
  await page.getByLabel("Contraseña").first().fill(identity.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL((url) => url.pathname === "/catalogo" || url.searchParams.get("error") === "credenciales", { timeout: 15000 });

  const authCookies = (await context.cookies(baseUrl)).filter((cookie) => cookie.name.includes("auth-token"));
  return { page, serverActionResponse, authCookieCount: authCookies.length };
}

try {
  for (const role of Object.keys(expectedEmails)) {
    const context = await browser.newContext();
    const login = await signIn(context, credentials[role]);
    const { page } = login;
    const loginPath = new URL(page.url()).pathname + new URL(page.url()).search;
    assert.equal(loginPath, "/catalogo", `${role} login did not redirect to Catalog`);
    assert.ok(login.authCookieCount > 0, `${role} login did not create an Auth cookie`);

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Cuenta" }).waitFor({ state: "visible" });

    let roleAccess;
    if (role === "admin") {
      const adminResponse = await page.goto(`${baseUrl}/admin/solicitudes`, { waitUntil: "domcontentloaded" });
      assert.equal(adminResponse?.status(), 200, "Admin could not open request management");
      await page.getByRole("heading", { name: "Solicitudes y órdenes" }).waitFor({ state: "visible" });
      roleAccess = "admin route allowed";
    } else {
      const checkoutResponse = await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });
      assert.equal(checkoutResponse?.status(), 200, "Customer could not open Checkout");
      const adminResponse = await page.goto(`${baseUrl}/admin/solicitudes`, { waitUntil: "domcontentloaded" });
      assert.notEqual(new URL(page.url()).pathname, "/admin/solicitudes", "Customer reached admin route");
      assert.equal(adminResponse?.status(), 200, "Customer denial did not resolve to an accessible page");
      assert.equal(await page.getByRole("heading", { name: "Solicitudes y órdenes" }).count(), 0, "Customer received admin route content");
      roleAccess = "Checkout allowed; admin route denied";
    }

    await page.getByRole("button", { name: "Cuenta" }).click();
    const logoutAction = page.waitForResponse((response) =>
      response.request().method() === "POST" && Boolean(response.request().headers()["next-action"]),
    { timeout: 15000 });
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    const logoutResponse = await logoutAction;
    assert.ok(logoutResponse.status() < 400, "Logout Server Action failed");
    await page.waitForURL((url) => url.pathname === "/", { timeout: 15000 });
    const remainingAuthCookies = (await context.cookies(baseUrl)).filter((cookie) => cookie.name.includes("auth-token"));
    assert.equal(remainingAuthCookies.length, 0, `${role} logout retained Auth cookies`);
    await page.goto(`${baseUrl}/iniciar-sesion`, { waitUntil: "domcontentloaded" });
    assert.equal(new URL(page.url()).pathname, "/iniciar-sesion", `${role} session remained active after logout`);
    assert.equal((await page.getByRole("button", { name: "Iniciar sesión" }).count()), 1, "Login form missing after logout");

    results.push({ role, loginPath, action: login.serverActionResponse, authCookieCount: login.authCookieCount, refresh: "persisted", roleAccess, logout: "signed out" });
    await context.close();
  }

  const invalidContext = await browser.newContext();
  const invalidLogin = await signIn(invalidContext, {
    email: credentials.customer.email,
    password: `${credentials.customer.password}invalid`,
  });
  assert.equal(new URL(invalidLogin.page.url()).searchParams.get("error"), "credenciales", "Invalid password was not rejected");
  assert.equal(invalidLogin.authCookieCount, 0, "Invalid password created an Auth cookie");
  results.push({ role: "invalid-password", loginPath: new URL(invalidLogin.page.url()).pathname + new URL(invalidLogin.page.url()).search, authCookieCount: 0, rejected: true });
  await invalidContext.close();

  console.log(JSON.stringify({ baseUrl, freshContexts: true, results }, null, 2));
} finally {
  await browser.close();
}
