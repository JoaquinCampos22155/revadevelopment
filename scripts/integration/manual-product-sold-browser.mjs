import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import { chromium } from "playwright";
import { requireLocalQaMutationOptIn } from "../local-qa-test-authorization.mjs";

requireLocalQaMutationOptIn();

const baseUrl = process.env.REVA_LOCAL_AUTH_BASE_URL ?? "http://127.0.0.1:3000";
assert.equal(new URL(baseUrl).origin, "http://127.0.0.1:3000", "Browser test must target the approved local REVA origin");

const credentialsPath = path.join(
  process.env.LOCALAPPDATA ?? path.join(homedir(), "AppData", "Local"),
  "REVA",
  "transactional-qa",
  "credentials.json",
);
const credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
assert.equal(credentials.admin?.email, "reva-local-admin@local.test", "Synthetic local Admin identity mismatch");
assert.equal(typeof credentials.admin?.password, "string", "Synthetic local Admin password is missing");

const container = "supabase_db_revadevelopment";
const migrationVersion = "20261027110000";
const viewports = [390, 768, 1366];
const fixtures = viewports.map(() => {
  const productId = randomUUID();
  return {
    productId,
    intakeId: randomUUID(),
    sku: `RV-${Date.now()}${Math.floor(Math.random() * 10_000)}`,
    slug: `manual-sale-browser-${productId.replaceAll("-", "")}`,
  };
});
let fixtureCreated = false;

function runLocalSql(sql) {
  const result = spawnSync("docker", ["exec", container, "psql", "-X", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-At", "-c", sql], { encoding: "utf8" });
  if (result.error || result.status !== 0) throw new Error("Local-only manual-sale browser fixture operation failed.");
  return result.stdout.trim();
}

async function cleanupFixture() {
  for (const fixture of fixtures) {
    runLocalSql(`delete from private.product_lifecycle_events where product_id='${fixture.productId}'; delete from public.products where id='${fixture.productId}'; delete from public.intake_items where id='${fixture.intakeId}';`);
  }
}

const browser = await chromium.launch({ headless: true });
try {
  assert.equal(runLocalSql(`select current_database()='postgres' and exists(select 1 from supabase_migrations.schema_migrations where version='${migrationVersion}');`), "t", "Expected local migration is not applied in the local Supabase container");
  const setup = fixtures.map(({ productId, intakeId, sku, slug }) => `insert into public.intake_items(id,source_type,destination,created_by_profile_id,acquisition_cost,received_at) values('${intakeId}','sell','catalog',(select id from auth.users where email='reva-local-admin@local.test'),1.00,current_date); insert into public.products(id,intake_item_id,created_by_profile_id,sku,slug,title,status) values('${productId}','${intakeId}',(select id from auth.users where email='reva-local-admin@local.test'),'${sku}','${slug}','Synthetic local Sold confirmation fixture','draft');`).join(" ");
  runLocalSql(`do $$ begin if not exists(select 1 from auth.users u join public.profiles p on p.id=u.id where u.email='reva-local-admin@local.test' and p.role='admin') then raise exception 'LOCAL_SYNTHETIC_ADMIN_REQUIRED'; end if; ${setup} end $$;`);
  fixtureCreated = true;

  for (const [index, width] of viewports.entries()) {
    const { sku, slug } = fixtures[index];
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/iniciar-sesion`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Correo electrónico").first().fill(credentials.admin.email);
    await page.getByLabel("Contraseña").first().fill(credentials.admin.password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL((url) => url.pathname === "/catalogo", { timeout: 15_000 });

    await page.goto(`${baseUrl}/admin/productos?q=${encodeURIComponent(sku)}`, { waitUntil: "domcontentloaded" });
    const row = page.locator("li").filter({ hasText: sku });
    await row.getByRole("link", { name: "Gestionar" }).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Admin detail overflowed at ${width}px`);
    const trigger = page.getByRole("button", { name: "Registrar como vendido" });
    await trigger.waitFor({ state: "visible" });

    const dialog = page.getByRole("dialog", { name: "Confirmar venta de esta prenda" });
    await trigger.click();
    await dialog.waitFor({ state: "visible" });
    await dialog.getByText("Synthetic local Sold confirmation fixture", { exact: true }).waitFor({ state: "visible" });

    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await trigger.evaluate((element) => element === document.activeElement), true, "Dialog did not restore focus to its trigger");

    await trigger.click();
    await dialog.waitFor({ state: "visible" });
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await dialog.waitFor({ state: "hidden" });

    await trigger.click();
    await dialog.waitFor({ state: "visible" });
    await dialog.getByRole("button", { name: "Confirmar venta" }).click();
    await dialog.waitFor({ state: "visible" });
    assert.equal(await dialog.getByLabel("Confirmo que revisé el pago externo y que corresponde a esta prenda.").isChecked(), false, "Payment attestation was unexpectedly preselected");

    const saleAction = page.waitForResponse((response) => response.request().method() === "POST" && Boolean(response.request().headers()["next-action"]), { timeout: 15_000 });
    await dialog.getByLabel("Confirmo que revisé el pago externo y que corresponde a esta prenda.").check();
    await dialog.getByRole("button", { name: "Confirmar venta" }).click();
    const actionResponse = await saleAction;
    assert.ok(actionResponse.status() < 400, "Manual-sale Server Action failed");
    await page.getByText("Esta prenda se registró como vendida y ya no está disponible para compra.", { exact: true }).waitFor({ state: "visible" });
    await page.getByText("Vendido", { exact: true }).waitFor({ state: "visible" });
    assert.equal(await page.getByRole("button", { name: "Registrar como vendido" }).count(), 0, "Sold Product retained the manual-sale action");

    await page.goto(`${baseUrl}/admin/productos?q=${encodeURIComponent(sku)}`, { waitUntil: "domcontentloaded" });
    const soldRow = page.locator("li").filter({ hasText: sku });
    await soldRow.getByText("Vendido", { exact: true }).waitFor({ state: "visible" });
    await soldRow.getByRole("link", { name: "Gestionar" }).waitFor({ state: "visible" });

    const detailResponse = await page.request.get(`${baseUrl}/productos/${slug}`);
    const detailHtml = await detailResponse.text();
    const detailEvidence = {
      status: detailResponse.status(),
      exposesSyntheticTitle: detailHtml.includes("Synthetic local Sold confirmation fixture"),
      exposesPurchaseAction: detailHtml.includes("Comprar ahora"),
      exposesSyntheticSku: detailHtml.includes(sku),
    };
    assert.equal(detailEvidence.exposesSyntheticTitle || detailEvidence.exposesPurchaseAction || detailEvidence.exposesSyntheticSku, false, `Sold Product PDP still exposes purchase information: ${JSON.stringify(detailEvidence)}`);
    const sitemap = await page.request.get(`${baseUrl}/sitemap.xml`);
    assert.ok(sitemap.ok(), "Sitemap request failed");
    assert.equal((await sitemap.text()).includes(slug), false, "Sold Product remained sitemap-eligible");

    await context.close();
  }

  console.log("Local Admin manual-sale browser flow passed at 390px, 768px, and 1366px; confirmation, payment attestation, focus restoration, Sold visibility, PDP/sitemap exclusion were verified.");
} finally {
  await browser.close();
  if (fixtureCreated) await cleanupFixture();
}
