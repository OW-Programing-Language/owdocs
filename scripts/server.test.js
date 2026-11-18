const test = require("node:test");
const assert = require("node:assert/strict");
process.env.PORT = "0";
const server = require("../server");

async function ready() {
  if (server.listening) return;
  await new Promise((resolve) => server.once("listening", resolve));
}
async function get(path, method = "GET") {
  await ready();
  return fetch("http://127.0.0.1:" + server.address().port + path, {
    method, redirect: "manual"
  });
}

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("root redirects to canonical docs prefix", async () => {
  const response = await get("/");
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/owdocs/");
});

test("both languages and assets are actually served", async () => {
  const routes = [
    ["/owdocs/", "Learn OW"],
    ["/owdocs/index.html", "Getting started"],
    ["/owdocs/fr.html", "Présentation"],
    ["/owdocs/style.css", ".section"],
    ["/owdocs/docs.js", "applySearch"]
  ];
  for (const [route, needle] of routes) {
    const res = await get(route);
    assert.equal(res.status, 200, route);
    assert.ok((await res.text()).includes(needle), route + ": wrong body");
  }
});

test("dotfiles and encoded traversal are not exposed", async () => {
  for (const route of [
    "/owdocs/.github/workflows/docs.yml",
    "/owdocs/%2e%2e%2fREADME.md",
    "/owdocs/%2e%2e%2fserver.js",
    "/owdocs-evil"
  ]) {
    const res = await get(route);
    assert.equal(res.status, 404, route);
  }
});

test("HEAD and health endpoint work", async () => {
  const head = await get("/owdocs/fr.html", "HEAD");
  assert.equal(head.status, 200);
  assert.match(head.headers.get("content-type"), /text\/html/);
  assert.equal((await head.text()).length, 0);
  const health = await get("/health");
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true });
});
