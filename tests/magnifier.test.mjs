import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateMagnifierPlacement,
  canActivateMagnifier,
  initialMagnifierState,
  transitionMagnifier,
} from "../src/features/catalog/magnifier.ts";

test("activates only for a mouse pointer when fine hover is available", () => {
  assert.equal(canActivateMagnifier("mouse", true), true);
  assert.equal(canActivateMagnifier("touch", true), false);
  assert.equal(canActivateMagnifier("pen", true), false);
  assert.equal(canActivateMagnifier("mouse", false), false);
});

test("pointer entry activates and movement updates the stored pointer without UI state", () => {
  const entered = transitionMagnifier(initialMagnifierState, {
    type: "pointer-enter", pointerType: "mouse", clientX: 120, clientY: 240, source: "/photo-a.webp",
  }, true);
  assert.equal(entered.active, true);
  assert.deepEqual(entered.pointer, { clientX: 120, clientY: 240 });

  const moved = transitionMagnifier(entered, {
    type: "pointer-move", pointerType: "mouse", clientX: 150, clientY: 260, source: "/photo-a.webp",
  }, true);
  assert.deepEqual(moved.pointer, { clientX: 150, clientY: 260 });
});

test("lens coordinates stay inside the photograph and show a centered 2x crop", () => {
  const placement = calculateMagnifierPlacement({
    frame: { left: 10, top: 20, width: 400, height: 500 },
    image: { left: 10, top: 20, width: 400, height: 500 },
    lensSize: 160,
    naturalHeight: 1000,
    naturalWidth: 800,
    pointer: { clientX: 10, clientY: 20 },
    source: "/photo.webp",
  });

  assert.ok(placement);
  assert.equal(placement.left, 0);
  assert.equal(placement.top, 0);
  assert.equal(placement.width, 160);
  assert.equal(placement.backgroundSizeWidth, 800);
  assert.equal(placement.backgroundSizeHeight, 1000);

  const oppositeEdge = calculateMagnifierPlacement({
    frame: { left: 10, top: 20, width: 400, height: 500 },
    image: { left: 10, top: 20, width: 400, height: 500 },
    lensSize: 160,
    naturalHeight: 1000,
    naturalWidth: 800,
    pointer: { clientX: 410, clientY: 520 },
    source: "/photo.webp",
  });
  assert.equal(oppositeEdge?.left, 240);
  assert.equal(oppositeEdge?.top, 340);
});

test("does not place a lens in letterboxing outside the actual photo", () => {
  const placement = calculateMagnifierPlacement({
    frame: { left: 0, top: 0, width: 500, height: 500 },
    image: { left: 0, top: 0, width: 500, height: 500 },
    lensSize: 160,
    naturalHeight: 500,
    naturalWidth: 1000,
    pointer: { clientX: 25, clientY: 25 },
    source: "/wide-photo.webp",
  });
  assert.equal(placement, null);
});

test("leaving hides the lens and changing images resets it to the new source", () => {
  const entered = transitionMagnifier(initialMagnifierState, {
    type: "pointer-enter", pointerType: "mouse", clientX: 100, clientY: 100, source: "/photo-a.webp",
  }, true);
  const left = transitionMagnifier(entered, { type: "pointer-leave" }, true);
  assert.equal(left.active, false);
  assert.equal(left.pointer, null);

  const switched = transitionMagnifier(entered, { type: "image-change", source: "/photo-b.webp" }, true);
  assert.equal(switched.active, false);
  assert.equal(switched.source, "/photo-b.webp");

  const movedOverNewPhoto = transitionMagnifier(switched, {
    type: "pointer-move", pointerType: "mouse", clientX: 210, clientY: 180, source: "/photo-b.webp",
  }, true);
  assert.equal(movedOverNewPhoto.active, true);
  assert.equal(movedOverNewPhoto.source, "/photo-b.webp");
});

test("touch-only interaction never activates hover magnification", () => {
  const state = transitionMagnifier(initialMagnifierState, {
    type: "pointer-enter", pointerType: "touch", clientX: 100, clientY: 100, source: "/photo.webp",
  }, false);
  assert.equal(state.active, false);
  assert.equal(state.pointer, null);
});
