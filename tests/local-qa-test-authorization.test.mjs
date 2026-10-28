import assert from "node:assert/strict";
import test from "node:test";

import {
  requireLocalQaIntegrationOptIn,
  requireLocalQaMutationOptIn,
} from "../scripts/local-qa-test-authorization.mjs";

test("local integration scripts refuse to run without explicit opt-in", () => {
  assert.throws(
    () => requireLocalQaIntegrationOptIn([]),
    /--run-local-qa-integration/,
  );
});

test("local integration scripts accept the explicit opt-in", () => {
  assert.doesNotThrow(() =>
    requireLocalQaIntegrationOptIn(["--run-local-qa-integration"]),
  );
});

test("local data-mutating scripts require a separate mutation opt-in", () => {
  assert.throws(
    () =>
      requireLocalQaMutationOptIn([
        "--run-local-qa-integration",
      ]),
    /--allow-local-qa-mutations/,
  );

  assert.doesNotThrow(() =>
    requireLocalQaMutationOptIn([
      "--run-local-qa-integration",
      "--allow-local-qa-mutations",
    ]),
  );
});
