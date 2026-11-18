// Static documentation consistency checks. No external packages required.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const languages = [
  { name: "English", path: "index.html", lang: "en" },
  { name: "French", path: "fr.html", lang: "fr" }
];

const parse = ({ name, path: filename, lang }) => {
  const html = read(filename);
  assert.match(html, /<!doctype html>/i, name + ": missing doctype");
  assert.ok(html.includes('<html lang="' + lang + '">'), name + ": wrong lang");
  assert.match(html, /<title>.+<\/title>/, name + ": no title");
  assert.ok(html.includes('src="docs.js"'), name + ": navigation JS missing");
  assert.ok(html.includes('href="style.css"'), name + ": stylesheet missing");
  assert.ok(html.includes('id="docs-search"'), name + ": search missing");

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, name + ": duplicate HTML ids");

  const sectionIds = [...html.matchAll(/<section class="section" id="([^"]+)"/g)]
    .map((m) => m[1]);
  assert.equal(sectionIds.length, 45, name + ": expected the complete 45-topic bilingual reference");
  for (const topic of [
    "module-advanced", "owunit-assertions", "text-utils", "numbers-time",
    "ui-input", "runtime-spi", "web-production", "native-details",
    "owler-workflow", "project-cookbook", "flow", "night"
  ]) {
    assert.ok(sectionIds.includes(topic), name + ": missing expanded chapter #" + topic);
  }

  const links = [...html.matchAll(/\bhref="#([^"]+)"/g)].map((m) => m[1]);
  for (const anchor of links) {
    assert.ok(ids.includes(anchor), name + ": dead anchor #" + anchor);
  }
  for (const id of sectionIds) {
    assert.ok(html.includes('<a href="#' + id + '">'),
      name + ": topic not present in navigation: " + id);
  }

  assert.ok(html.includes("OWUnit"), name + ": missing OWUnit");
  assert.ok(html.includes("dependencies.yml"), name + ": missing dependencies");
  assert.ok(html.includes("mixed_map"), name + ": missing native maps");
  assert.ok(html.includes("module_type"), name + ": missing module calculus");
  assert.ok(html.includes("returns:"), name + ": missing YAML signatures");
  assert.ok(!html.includes('href="downloads/OwIDE.jar"'),
    name + ": stale download link");

  const refs = [...html.matchAll(/href="(?!https?:|#|mailto:)([^"]+)"/g)]
    .map((m) => m[1].split("#")[0]);
  for (const ref of refs) {
    if (!ref) continue;
    assert.ok(fs.existsSync(path.join(root, ref)), name + ": missing local link " + ref);
  }
  return sectionIds;
};
const en = parse(languages[0]);
const fr = parse(languages[1]);
assert.deepEqual(fr, en, "EN/FR topics and ordering must match");
assert.doesNotMatch(read("index.html"), /No arrays, dicts, or objects yet/i,
  "Old documentation is still present");
console.log("Docs validated: " + en.length + " bilingual topics, links, anchors and assets.");
