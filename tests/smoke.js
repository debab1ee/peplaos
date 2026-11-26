// In-browser smoke test. Open the site with ?smoke (e.g. http://localhost:5525/?smoke)
// It skips the boot, logs in, opens every app and checks the results.
// Results appear in the console and in window.SMOKE_RESULT.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const results = [];
  const check = (name, ok, info = "") => results.push({ name, ok: !!ok, info });
  const until = async (fn, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { if (fn()) return true; await sleep(100); } return false; };

  check("boot reaches login screen", await until(() => document.querySelector(".login-user")));
  document.querySelector(".login-user")?.click();
  await sleep(200);
  const pw = document.querySelector(".login-pw");
  check("password screen shows hint from the start", pw && /tomar firstborn/.test(pw.textContent) && pw.querySelector(".pw-reveal").classList.contains("hidden"));
  const pin = pw.querySelector("input"), submit = () => pw.querySelector(".pw-row").requestSubmit();
  pin.value = "wrong"; submit();
  await sleep(100);
  check("wrong password reveals it", document.querySelector("#desktop").classList.contains("hidden") && /srihori/.test(pw.querySelector(".pw-reveal").textContent));
  pin.value = "Srihori "; submit();
  check("desktop shows after login", await until(() => !document.querySelector("#desktop").classList.contains("hidden")));

  const crashed = [];
  for (const id of Object.keys(OS.apps)) {
    if (id === "secret" || id === "donotopen") continue;
    try { OS.open(id); } catch (e) { crashed.push(id + ": " + e.message); }
  }
  await sleep(1500);
  document.querySelectorAll(".win-body").forEach((b) => { if (b.textContent.includes("has crashed")) crashed.push(b.closest(".win").querySelector(".win-title").textContent); });
  check("every app opens without crashing", !crashed.length, crashed.join(", "));

  await sleep(1200); // let late notifications render their icons
  const unrendered = [...new Set([...document.querySelectorAll("i[data-lucide]")].map((i) => i.dataset.lucide))];
  check("every icon renders", !unrendered.length, unrendered.join(", "));

  check("photos: albums render (trash album hidden)", document.querySelectorAll(".ph-album").length === (window.PEPLA_ALBUMS || []).filter((a) => !a.trash).length);
  check("trash shows only the embarrassing album", document.querySelectorAll(".trash-grid .ph-tile").length === OS.trashItems.length && OS.trashItems.length > 0 && !OS.photos.some((p) => OS.trashItems.some((t) => t.file === p.file)));
  check("top secret unlocked after exploring", OS.unlocked());

  const inp = document.querySelector(".term input");
  const run = (c) => { inp.value = c; inp.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })); };
  ["help", "ghoti-bekai", "cgpa", "credits"].forEach(run);
  await sleep(200);
  const term = document.querySelector(".term").innerText;
  check("terminal: help lists commands", term.includes("ghoti-bekai") && term.includes("credits"));
  check("terminal: ghoti-bekai works", term.includes("ghoti bekiye dilam mona"));
  check("terminal: credits", /bugs khoma korben/i.test(term));

  const before = document.querySelectorAll(".notif").length;
  OS.pourWine(); OS.pourWine();
  await sleep(2600);
  check("love announcement after 2 glasses", [...document.querySelectorAll(".notif")].some((n) => /love/i.test(n.textContent)), `notifs before=${before}`);

  // cake: blow out every candle -> the birthday seal appears
  const cakeWin = OS.windows.get("cake");
  cakeWin.querySelectorAll(".candle").forEach((c) => c.click());
  await sleep(1800);
  const sr = cakeWin.querySelector(".seal-reveal");
  check("cake: seal photo appears after candles", sr.classList.contains("show") && sr.querySelector("img").complete && sr.querySelector("img").naturalWidth > 0);

  // mishti game: starts, items fall, score changes when catching
  const mw = OS.windows.get("mishti");
  mw.querySelector(".mb-go").click();
  await sleep(2500);
  check("mishti: game running with a timer", mw._playing && +mw.querySelector(".mb-time span").textContent < 75);
  check("mishti: start screen hidden", !mw.querySelector(".mb-start"));

  check("no horizontal page scroll", document.documentElement.scrollWidth <= innerWidth);

  const failed = results.filter((r) => !r.ok);
  console.table(results);
  window.SMOKE_RESULT = { passed: results.length - failed.length, failed: failed.length, results };
})();
