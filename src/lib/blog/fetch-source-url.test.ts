import assert from "node:assert/strict";
import test from "node:test";
import { parsePublicHttpUrl } from "@/lib/blog/fetch-source-url";

test("accepts public https URLs", () => {
  const url = parsePublicHttpUrl("https://example.com/guide?x=1");
  assert.equal(url.hostname, "example.com");
});

test("rejects non-http schemes", () => {
  assert.throws(() => parsePublicHttpUrl("file:///etc/passwd"), /http and https/);
});

test("rejects localhost and private hosts", () => {
  assert.throws(() => parsePublicHttpUrl("http://localhost/admin"), /private/);
  assert.throws(() => parsePublicHttpUrl("http://127.0.0.1/"), /private/);
  assert.throws(() => parsePublicHttpUrl("http://192.168.1.10/"), /private/);
  assert.throws(() => parsePublicHttpUrl("http://10.0.0.5/"), /private/);
});
