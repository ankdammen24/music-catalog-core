import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeFilename } from "../storageValidation.js";

test("sanitizeFilename strips traversal and separators", () => {
  const filename = sanitizeFilename("../..//evil?.wav");
  assert.equal(filename, ".-.-evil-.wav");
});
