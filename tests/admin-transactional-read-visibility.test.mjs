import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const requestPage = readFileSync("src/app/admin/solicitudes/page.tsx", "utf8");
const ordersPage = readFileSync("src/app/admin/solicitudes/ordenes/page.tsx", "utf8");
const adminData = readFileSync("src/features/transactions/server/transactional-admin.server.ts", "utf8");
const adminActions = readFileSync("src/features/transactions/server/transactional-admin.actions.ts", "utf8");
const adminLayout = readFileSync("src/app/admin/layout.tsx", "utf8");
const requestDetail = readFileSync("src/app/admin/solicitudes/[requestId]/page.tsx", "utf8");
const orderDetail = readFileSync("src/app/admin/solicitudes/ordenes/[orderId]/page.tsx", "utf8");

test("Admin list routes are Admin-authorized and independent from the local write gate", () => {
  for (const page of [requestPage, ordersPage]) {
    assert.match(page, /await requireCurrentAdmin\(\)/);
    assert.doesNotMatch(page, /if \(!isLocalTransactionalRequestsEnabled\(\)\) notFound\(\)/);
  }

  for (const functionName of ["listPurchaseRequests", "listOrders"]) {
    const functionStart = adminData.indexOf(`export async function ${functionName}`);
    assert.notEqual(functionStart, -1, `${functionName} should exist`);
    const nextFunction = adminData.indexOf("\nexport async function ", functionStart + 1);
    const functionSource = adminData.slice(functionStart, nextFunction === -1 ? undefined : nextFunction);
    assert.doesNotMatch(functionSource, /isLocalTransactionalRequestsEnabled\(\)/);
    assert.match(functionSource, /callAdminRpc|createSupabaseServerClient/);
  }
  assert.match(adminData, /async function callAdminRpc[\s\S]*?createSupabaseServerClient\(\)[\s\S]*?client\.rpc\(/);
});

test("Admin layout protects visibility and all mutation entrypoints retain the local-only gate", () => {
  assert.match(adminLayout, /await requireCurrentAdmin\(\)/);
  assert.match(adminActions, /!isLocalTransactionalRequestsEnabled\(\)/);
  assert.match(adminData, /keyringFromEnvironment[\s\S]{0,200}isLocalTransactionalRequestsEnabled\(\)/);
  for (const detailPage of [requestDetail, orderDetail]) {
    assert.match(detailPage, /if \(!isLocalTransactionalRequestsEnabled\(\)\) notFound\(\)/);
    assert.match(detailPage, /await requireCurrentAdmin\(\)/);
  }
});

test("Admin section navigation links all three sections with keyboard focus and active-page semantics", () => {
  const navigation = readFileSync("src/components/layout/AdminSectionNavigation.tsx", "utf8");
  for (const href of ["/admin/productos", "/admin/solicitudes", "/admin/solicitudes/ordenes"]) {
    assert.ok(navigation.includes(href), `Admin navigation should include ${href}`);
  }
  assert.match(navigation, /aria-current=\{activeSection === id \? "page"/);
  assert.match(navigation, /focus-visible:ring/);
  assert.match(navigation, /flex-wrap/);
});
