import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

test("the sign-up Button uses only supported props and keeps its outline variant", async () => {
  const filePath = new URL("../src/app/iniciar-sesion/page.tsx", import.meta.url);
  const source = await readFile(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath.pathname,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const signUpButton = [];

  function visit(node) {
    if (
      ts.isJsxElement(node)
      && ts.isIdentifier(node.openingElement.tagName)
      && node.openingElement.tagName.text === "Button"
      && node.children.some((child) => ts.isJsxText(child) && child.getText(sourceFile).trim() === "Crear cuenta")
    ) {
      signUpButton.push(node.openingElement);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  assert.equal(signUpButton.length, 1, "the sign-up action should have one Button");

  const props = new Map(signUpButton[0].attributes.properties
    .filter(ts.isJsxAttribute)
    .map((attribute) => [attribute.name.getText(sourceFile), attribute.initializer?.getText(sourceFile)]));

  assert.equal(props.has("border-reva-border"), false, "a CSS token must not be forwarded as a DOM boolean prop");
  assert.equal(props.get("className"), '"w-full"');
  assert.equal(props.get("variant"), '"outline"');
});
