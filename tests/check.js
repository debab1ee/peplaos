// Static checks — run:  node tests/check.js
// No dependencies. Exits with code 1 if anything fails.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const rel = (...p) => path.join(root, ...p);
let failed = 0, passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log("  ok  " + name); }
  catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
};
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

// Load the data files the way the browser does (into a fake window)
const window = {};
const ctx = vm.createContext({ window });
for (const f of ["js/data.js", "js/images.js", "js/gallery.js"]) vm.runInContext(fs.readFileSync(rel(f), "utf8"), ctx, { filename: f });
const D = window.PEPLA, IMAGES = window.PEPLA_IMAGES, ALBUMS = window.PEPLA_ALBUMS;

console.log("PeplaOS static checks\n");

test("every JS file parses", () => {
  for (const f of fs.readdirSync(rel("js")).filter((f) => f.endsWith(".js")))
    new vm.Script(fs.readFileSync(rel("js", f), "utf8"), { filename: f });
});

test("index.html loads every script in js/", () => {
  const html = fs.readFileSync(rel("index.html"), "utf8");
  for (const f of fs.readdirSync(rel("js")).filter((f) => f.endsWith(".js")))
    assert(html.includes(`js/${f}`), `index.html does not load js/${f}`);
});

test("images.js matches the images/ folder", () => {
  const onDisk = fs.readdirSync(rel("images")).filter((f) => /\.(jpe?g|png|gif|webp|avif|mp4|webm|mov)$/i.test(f)).sort();
  const listed = IMAGES.slice().sort();
  const missing = onDisk.filter((f) => !listed.includes(f));
  const ghost = listed.filter((f) => !onDisk.includes(f));
  assert(!missing.length, `not listed (run node scripts/list-images.js): ${missing.join(", ")}`);
  assert(!ghost.length, `listed but missing on disk: ${ghost.join(", ")}`);
});

test("every album photo exists and has a caption", () => {
  for (const a of ALBUMS) for (const it of a.items) {
    assert(fs.existsSync(rel("images", it.file)), `${a.title}: missing ${it.file}`);
    assert(it.caption && it.caption.trim(), `${a.title}: ${it.file} has no caption`);
  }
});

test("no photo is in two albums", () => {
  const seen = new Map();
  for (const a of ALBUMS) for (const it of a.items) {
    assert(!seen.has(it.file), `${it.file} is in both "${seen.get(it.file)}" and "${a.title}"`);
    seen.set(it.file, a.title);
  }
});

test("voice note files exist and are referenced correctly", () => {
  const ids = new Set(D.sounds.map((s) => s.id));
  for (const s of D.sounds) assert(fs.existsSync(rel(s.file)), `missing ${s.file}`);
  for (const [ev, id] of Object.entries(D.systemSounds)) assert(id === null || ids.has(id), `systemSounds.${ev} -> unknown "${id}"`);
  for (const f of D.friends) for (const m of f.messages)
    if (m && m.voice) assert(ids.has(m.voice), `${f.name}: unknown voice "${m.voice}"`);
});

test("no sound plays at startup", () => assert(!D.systemSounds.login, "systemSounds.login should be null"));

test("seal videos have valid YouTube ids", () => {
  assert(D.sealVideos.length > 0, "no seal videos");
  for (const v of D.sealVideos) assert(/^[A-Za-z0-9_-]{11}$/.test(v.id), `bad id "${v.id}"`);
});

test("nicknames all have an icon", () => {
  for (const n of D.nicknames) assert(n.name && n.icon, `nickname missing name/icon: ${JSON.stringify(n)}`);
});

test("banned words are gone (liver, council, dhele)", () => {
  const files = ["index.html", ...fs.readdirSync(rel("js")).map((f) => "js/" + f)];
  for (const f of files) {
    const t = fs.readFileSync(rel(f), "utf8");
    const m = t.match(/\b(liver|council|dhele[- ]?dei)\b/i);
    assert(!m, `${f} still contains "${m && m[0]}"`);
  }
});

test("credits mention bugs khoma korben", () => {
  const t = fs.readFileSync(rel("js/apps.js"), "utf8") + fs.readFileSync(rel("js/os.js"), "utf8");
  assert(/bugs khoma korben/i.test(t) && D.author, "credit line missing");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
