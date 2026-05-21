import test from "node:test";
import assert from "node:assert/strict";
import { buildStorageKey } from "../storageKeys.js";

test("buildStorageKey uses expected format", () => {
  const key = buildStorageKey("artwork", "releases", "abc123", "cover.jpg");
  assert.equal(key, "artwork/releases/abc123/cover.jpg");
});
