/* =========================================================
   PeplaOS apps
   ========================================================= */
(() => {
  const D = window.PEPLA;
  const { $, el, sleep, rand, esc, sfx } = OS;

  const roastCaptions = [
    "peak peplapig behaviour", "certified 25 y/o", "aura: questionable", "this one's going in the group",
    "IIM Mumbai topper behaviour", "sommelier mode on", "the face of a Succession fan", "W photo", "L photo (still love you)",
    "seal energy", "ei nonta meetha khabi?", "evidence #25", "pecho matal in his natural habitat",
  ];

  /* ================= PHOTOS ================= */
  const albums = (() => {
    const src = window.PEPLA_ALBUMS || [];
    const byFile = new Map(OS.media.map((m) => [m.file, m]));
    const seen = new Set();
    const out = src.map((a) => ({
      ...a,
      items: a.items.filter((it) => byFile.has(it.file)).map((it) => { seen.add(it.file); return { ...byFile.get(it.file), caption: it.caption, album: a.title }; }),
    })).filter((a) => a.items.length);
    const rest = OS.media.filter((m) => !seen.has(m.file)).map((m) => ({ ...m, caption: rand(roastCaptions), album: "More memories" }));
    if (rest.length) out.push({ title: "More memories", subtitle: "fresh evidence", icon: "sparkles", items: rest });
    return out;
  })();
  const allItems = albums.flatMap((a) => a.items);
  OS.captionFor = (file) => (allItems.find((m) => m.file === file) || {}).caption || "";

  const thumb = (m, cls = "") => m.video
    ? `<video class="${cls}" src="${m.src}#t=0.8" muted preload="metadata" playsinline></video>`
    : `<img class="${cls}" src="${m.src}" loading="lazy" alt="${esc(m.caption || "")}" />`;
  const coverOf = (a) => a.items.find((m) => !m.video) || a.items[0];

  OS.register("photos", {
    name: "Photos", title: () => `Photos — 25 Years of ${OS.user}`, icon: "images", color: "linear-gradient(135deg,#ffd86b,#ff6fa1,#7a7cff)", dock: true, w: 940, h: 620,
    render(body) {
      body.innerHTML = `
        <div class="ph">
          <aside class="ph-side">
            <div class="ph-sec">Library</div>
            <button class="ph-nav on" data-view="home">${ico("sparkles")}<span>Memories</span></button>
            <button class="ph-nav" data-view="all">${ico("images")}<span>All Photos</span><small>${allItems.length}</small></button>
            <div class="ph-sec">Albums</div>
            ${albums.map((a, i) => `<button class="ph-nav" data-view="a${i}">${ico(a.icon || "folder")}<span>${esc(a.title)}</span><small>${a.items.length}</small></button>`).join("")}
          </aside>
          <main class="ph-main"></main>
        </div>`;
      const main = $(".ph-main", body);
      const navs = [...body.querySelectorAll(".ph-nav")];
      const go = (view) => {
        sfx("click");
        navs.forEach((n) => n.classList.toggle("on", n.dataset.view === view));
        main.scrollTop = 0;
        if (view === "home") return home();
        if (view === "all") return grid({ title: "All Photos", subtitle: `${allItems.length} memories, zero context`, items: allItems });
        grid(albums[+view.slice(1)]);
      };
      navs.forEach((n) => (n.onclick = () => go(n.dataset.view)));

      function home() {
        const hero = rand(allItems.filter((m) => !m.video));
        main.innerHTML = `
          <section class="ph-hero">
            <img src="${hero.src}" alt="" />
            <div class="ph-hero-txt">
              <small>Memories</small>
              <h2>25 Years of ${esc(OS.user)}</h2>
              <p>${allItems.length} memories · ${albums.length} albums · curated by the peplaz agency</p>
              <button class="ph-play">${ico("play")} Play Memories</button>
            </div>
          </section>
          <h3 class="ph-h3">Albums</h3>
          <div class="ph-albums">
            ${albums.map((a, i) => `
              <button class="ph-album" data-i="${i}">
                <div class="ph-cover">${thumb(coverOf(a))}</div>
                <b>${esc(a.title)}</b>
                <small>${esc(a.subtitle || "")} · ${a.items.length}</small>
              </button>`).join("")}
          </div>`;
        $(".ph-play", main).onclick = () => viewer(body, allItems.filter((m) => !m.video).sort(() => Math.random() - 0.5), 0, true);
        main.querySelectorAll(".ph-album").forEach((b) => (b.onclick = () => go("a" + b.dataset.i)));
      }

      function grid(a) {
        main.innerHTML = `
          <header class="ph-head">
            <div><h2>${ico(a.icon || "images")} ${esc(a.title)}</h2><p>${esc(a.subtitle || "")} · ${a.items.length} items</p></div>
            <div class="ph-actions">
              <button class="chip" data-shuffle>${ico("shuffle")} Shuffle</button>
              <button class="chip on" data-show>${ico("play")} Slideshow</button>
            </div>
          </header>
          <div class="ph-masonry"></div>`;
        const box = $(".ph-masonry", main);
        let items = a.items.slice();
        const draw = () => {
          box.innerHTML = "";
          items.forEach((m, i) => {
            const f = el("figure", "ph-tile", `${thumb(m)}${m.video ? `<span class="ph-vid">${ico("play")}</span>` : ""}<figcaption>${esc(m.caption || "")}</figcaption>`);
            f.onclick = () => { sfx("pop"); viewer(body, items, i, false); };
            box.appendChild(f);
          });
        };
        $("[data-shuffle]", main).onclick = () => { sfx("swap"); items.sort(() => Math.random() - 0.5); draw(); };
        $("[data-show]", main).onclick = () => { const p = items.filter((m) => !m.video); if (p.length) viewer(body, p, 0, true); };
        draw();
      }
      home();
    },
  });

  /* ================= CHULER JOTNO 101 ================= */
  const hairPick = (needle) => {
    const hair = (albums.find((a) => /hair/i.test(a.title)) || { items: [] }).items;
    return hair.find((m) => (m.caption || "").toLowerCase().includes(needle)) || hair.find((m) => !m.video) || allItems[0];
  };
  OS.register("chul", {
    name: "Chuler Jotno 101", title: "Chuler Jotno 101 — a masterclass", icon: "scissors", color: "linear-gradient(135deg,#c471f5,#fa71cd)", dock: true, w: 820, h: 600,
    render(body) {
      const lessons = [
        { t: "The Foundation", tip: "Shampoo twice a week, not daily. Your scalp has feelings, and they are expensive.", m: hairPick("fan club") },
        { t: "Conditioner Is Not Optional", tip: "Mid-length to ends only. Leave it for 3 minutes. Use that time to rewatch one Succession scene.", m: hairPick("before the transformation") },
        { t: "The Salon Commitment", tip: "Colour cap on, fear in eyes, results worth it. Never trust a friend with scissors (looking at the peplaz).", m: hairPick("fear in eyes") },
        { t: "Never Towel-Rub", tip: "Pat it dry. Rubbing causes frizz, and frizz causes 'woke up like this' photos.", m: hairPick("woke up") },
        { t: "Sleep Is Styling", tip: "Silk pillowcase recommended. Sleeping upright on a chair also works, apparently.", m: hairPick("sleep") },
        { t: "The Hair Flip", tip: "Chin down, swing, look up slowly. Practise in the mirror. Never in a moving auto.", m: hairPick("hair flip") },
      ];
      const quiz = [
        { q: "How often should you shampoo?", a: ["Every day", "Twice a week", "Whenever Gunnu complains"], ok: 1 },
        { q: "Who is allowed to touch the hair?", a: ["Anyone", "Only the salon", "Nobody. Not even the peplaz."], ok: 2 },
        { q: "The secret to Sou-level hair is…", a: ["An expensive serum", "Genetics (unfair)", "A glass of red wine"], ok: 1 },
      ];
      const done = new Set();
      body.innerHTML = `
        <div class="chul">
          <header class="chul-head">
            <div class="chul-badge">${ico("scissors")}</div>
            <div><h2>Chuler Jotno 101</h2><p>A masterclass by Prof. ${esc(OS.user)}, holder of the best hair in the peplaz agency</p></div>
            <div class="chul-prog"><span>0 / ${lessons.length} lessons</span><div><i></i></div></div>
          </header>
          <div class="chul-lessons">
            ${lessons.map((l, i) => `
              <article class="chul-card" data-i="${i}">
                <div class="chul-img">${l.m.video ? `<video src="${l.m.src}" muted loop playsinline preload="metadata"></video>` : `<img src="${l.m.src}" loading="lazy" alt="" />`}<span>Lesson ${i + 1}</span></div>
                <div class="chul-txt"><h3>${esc(l.t)}</h3><p>${esc(l.tip)}</p><button class="btn">${ico("check")} Mark as learnt</button></div>
              </article>`).join("")}
          </div>
          <section class="chul-quiz"></section>
        </div>`;
      const prog = () => {
        $(".chul-prog span", body).textContent = `${done.size} / ${lessons.length} lessons`;
        $(".chul-prog i", body).style.width = (done.size / lessons.length) * 100 + "%";
        if (done.size === lessons.length) startQuiz();
      };
      body.querySelectorAll(".chul-card").forEach((c) => {
        const i = +c.dataset.i, btn = $(".btn", c), vid = $("video", c);
        if (vid) { c.addEventListener("pointerenter", () => vid.play().catch(() => {})); c.addEventListener("pointerleave", () => vid.pause()); }
        btn.onclick = () => {
          if (done.has(i)) return;
          done.add(i); sfx("pop");
          c.classList.add("learnt"); btn.innerHTML = `${ico("check-check")} Learnt`;
          prog();
        };
      });
      let quizOn = false;
      function startQuiz() {
        if (quizOn) return; quizOn = true;
        sfx("unlock");
        const box = $(".chul-quiz", body);
        let qi = 0, score = 0;
        const ask = () => {
          if (qi >= quiz.length) return cert();
          const Q = quiz[qi];
          box.innerHTML = `<h3>${ico("graduation-cap")} Final exam · Question ${qi + 1} of ${quiz.length}</h3><p class="chul-q">${esc(Q.q)}</p><div class="chul-ans">${Q.a.map((a, k) => `<button class="chip" data-k="${k}">${esc(a)}</button>`).join("")}</div><p class="chul-fb"></p>`;
          box.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => {
            const right = +b.dataset.k === Q.ok;
            if (right) score++;
            sfx(right ? "magic" : "error");
            $(".chul-fb", box).textContent = right ? "Correct. The hair approves." : "Wrong. The hair is disappointed in you.";
            box.querySelectorAll("[data-k]").forEach((x) => (x.disabled = true));
            setTimeout(() => { qi++; ask(); }, 1100);
          }));
          box.scrollIntoView({ behavior: "smooth", block: "nearest" });
        };
        const cert = () => {
          box.innerHTML = `
            <div class="chul-cert">
              <small>peplaz agency · est. ${D.foundedYear}</small>
              <h3>Certificate of Chul Excellence</h3>
              <p>This certifies that <b>${esc(OS.user)}</b> has completed <b>Chuler Jotno 101</b><br/>with a score of ${score}/${quiz.length} (CGPA equivalent: ${D.cgpa}).</p>
              <div class="chul-sign">${ico("award")} signed, the peplaz</div>
            </div>`;
          OS.confetti(220, true);
        };
        ask();
      }
    },
  });

  function viewer(host, items, idx, auto) {
    sfx("open");
    const v = el("div", "viewer");
    let timer;
    const show = () => {
      const m = items[idx];
      v.innerHTML = `
        <div class="v-stage">${m.video ? `<video src="${m.src}" controls autoplay playsinline></video>` : `<img class="${auto ? "kb" : ""}" src="${m.src}" alt="" />`}</div>
        <div class="v-top"><span>${esc(m.album || "")}</span><span>${idx + 1} / ${items.length}</span><button class="vclose" aria-label="Close">${ico("x")}</button></div>
        <button class="vbtn prev" aria-label="Previous">${ico("chevron-left")}</button><button class="vbtn next" aria-label="Next">${ico("chevron-right")}</button>
        <div class="caption">${esc(m.caption || rand(roastCaptions))}</div>`;
      $(".prev", v).onclick = (e) => { e.stopPropagation(); go(-1); };
      $(".next", v).onclick = (e) => { e.stopPropagation(); go(1); };
      $(".vclose", v).onclick = close;
    };
    const go = (d) => { sfx("click"); idx = (idx + d + items.length) % items.length; show(); };
    const key = (e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); if (e.key === "Escape") close(); };
    const close = () => { sfx("close"); clearInterval(timer); document.removeEventListener("keydown", key); v.remove(); };
    let tx = null;
    v.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
    v.addEventListener("touchend", (e) => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); tx = null; });
    document.addEventListener("keydown", key);
    host.appendChild(v);
    show();
    if (auto) timer = setInterval(() => go(1), 3500);
  }

  /* ================= MESSAGES ================= */
  const autoReplies = [
    "ok boomer (you're 25 now)", "seen", "hyaa", "kadji", "setai", "wdym", "Pune Palta Punnu", "ghoti bekiye debo mona", "lol no",
    "tell that to Logan Roy", "ami ekhon ektu byasto achi nahole toke jhamtam", "-1000 aura", "ork ork", "happy birthday though",
    "aro matlami koro pecho",
  ];
  const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const avatar = (f) => `<span class="av" style="background:${f.color || "#8e8e93"}">${f.icon ? ico(f.icon) : esc(initials(f.name))}</span>`;
  const shownThreads = new Set();
  OS.register("messages", {
    name: "Messages", title: "Messages", icon: "message-circle", color: "linear-gradient(#5ff777,#12bf38)", dock: true, w: 720, h: 520,
    render(body) {
      body.innerHTML = `
        <div class="msgs">
          <div class="msgs-list"></div>
          <div class="msgs-chat">
            <div class="msgs-head"></div>
            <div class="msgs-body"></div>
            <form class="msgs-input"><input placeholder="iMessage (they will roast you)" /><button class="btn primary" style="flex:none">${ico("send")}</button></form>
          </div>
        </div>`;
      const list = $(".msgs-list", body), chat = $(".msgs-body", body), head = $(".msgs-head", body);
      let current = null, token = 0;

      D.friends.forEach((f, i) => {
        const last = f.messages[f.messages.length - 1];
        const b = el("button", "msgs-thread-btn", `${avatar(f)}<div><b>${esc(f.name)}</b><small>${esc(typeof last === "string" ? last.slice(0, 26) : "Voice message")}</small></div>`);
        b.onclick = () => { sfx("click"); openThread(i, b); };
        list.appendChild(b);
      });

      async function openThread(i, btn) {
        const my = ++token;
        current = D.friends[i];
        list.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === btn));
        head.innerHTML = `${avatar(current)} <span>${esc(current.name)}</span>`;
        chat.innerHTML = "";
        const instant = shownThreads.has(i);
        for (const m of current.messages) {
          if (!instant) {
            const t = el("div", "bubble typing", `${esc(current.name)} is typing…`);
            chat.appendChild(t); chat.scrollTop = 1e9;
            await sleep(typeof m === "string" ? Math.min(1800, 400 + m.length * 25) : 900);
            t.remove();
            if (my !== token) return;
            sfx("pop");
          }
          chat.appendChild(bubble(m));
          chat.scrollTop = 1e9;
        }
        shownThreads.add(i);
      }

      $("form", body).onsubmit = async (e) => {
        e.preventDefault();
        const inp = $("input", body);
        const txt = inp.value.trim();
        if (!txt || !current) return;
        inp.value = "";
        sfx("send");
        chat.appendChild(el("div", "bubble me", esc(txt)));
        chat.scrollTop = 1e9;
        const t = el("div", "bubble typing", `${esc(current.name)} is typing…`);
        await sleep(700); chat.appendChild(t); chat.scrollTop = 1e9;
        await sleep(1200); t.remove();
        sfx("pop");
        chat.appendChild(el("div", "bubble", esc(rand(autoReplies))));
        chat.scrollTop = 1e9;
      };

      const first = list.querySelector("button");
      if (first) openThread(0, first);
    },
  });

  function bubble(m) {
    if (typeof m === "string") return el("div", "bubble", esc(m));
    if (m.image) return el("div", "bubble", `<img src="${esc(m.image)}" alt="" />`);
    if (m.voice) {
      const b = el("div", "bubble voice");
      const bars = Array.from({ length: 28 }, () => `<i style="height:${20 + Math.random() * 80}%"></i>`).join("");
      b.innerHTML = `<button aria-label="Play">${ico("play")}</button><div class="wave">${bars}</div>`;
      const btn = $("button", b), is = b.querySelectorAll(".wave i");
      btn.onclick = () => {
        const a = OS.play(m.voice);
        if (!a) return;
        btn.innerHTML = ico("pause");
        const tick = () => {
          const p = a.duration ? a.currentTime / a.duration : 0;
          is.forEach((x, k) => x.classList.toggle("played", k / is.length < p));
          if (!a.paused && !a.ended) requestAnimationFrame(tick);
          else btn.innerHTML = ico("play");
        };
        requestAnimationFrame(tick);
      };
      return b;
    }
    return el("div", "bubble", "?");
  }

  /* ================= SOUNDBOARD ================= */
  const sbColors = ["#ff5fa2", "#ffb000", "#06d6a0", "#118ab2", "#9d6bff", "#ef476f", "#2ec4b6", "#ff7f11"];
  OS.register("soundboard", {
    name: "Peplaz Soundboard", title: "Peplaz Soundboard", icon: "audio-lines", color: "linear-gradient(#ff8a5b,#ff3d71)", dock: true, w: 560, h: 420,
    render(body) {
      body.innerHTML = `<div class="sb"></div>`;
      const g = $(".sb", body);
      D.sounds.forEach((s, i) => {
        const b = el("button", "sb-btn", `<span class="e">${ico(s.icon || "mic")}</span>${esc(s.label)}`);
        b.style.background = sbColors[i % sbColors.length];
        b.onclick = () => {
          const a = OS.play(s.id);
          g.querySelectorAll(".sb-btn").forEach((x) => x.classList.remove("playing"));
          b.classList.add("playing");
          if (a) a.onended = () => b.classList.remove("playing");
          else setTimeout(() => b.classList.remove("playing"), 400);
        };
        g.appendChild(b);
      });
    },
  });

  /* ================= MISHTI ================= */
  let mishtiDone = false;
  OS.register("mishti", {
    name: "Mishti.app", title: "Mishti Bhandar", icon: "candy", color: "linear-gradient(#ffe29a,#ff9a62)", dock: true, w: 460, h: 440,
    render(body) {
      let n = 0, flip = false;
      body.innerHTML = `
        <div class="mishti">
          <div class="shop">${ico("store")}</div>
          <h2>Welcome to Mishti Bhandar</h2>
          <div class="q"></div>
          <div class="row"></div>
          <div class="count"></div>
        </div>`;
      const q = $(".q", body), row = $(".row", body), cnt = $(".count", body);
      const draw = () => {
        q.textContent = flip ? "ei meetha nonta khabi?" : "ei nonta meetha khabi?";
        row.innerHTML = "";
        const a = el("button", "nonta", `${ico("cookie")} Nonta`), b = el("button", "meetha", `${ico("candy")} Meetha`);
        (flip ? [b, a] : [a, b]).forEach((x) => { x.onclick = pick; row.appendChild(x); });
        cnt.textContent = `Decisions made: ${n} · Sweets received: 0`;
      };
      const pick = () => {
        n++; flip = !flip;
        if (n >= 6) {
          mishtiDone = true;
          sfx("error");
          OS.sys("error");
          q.innerHTML = `<span style="color:#c1121f">ghoti bekiye debo mona</span>`;
          row.innerHTML = "";
          cnt.textContent = "Fine. You get both. Nonta-meetha. Happy birthday.";
          setTimeout(() => { OS.confetti(120); row.innerHTML = `<div class="mishti-prize">${ico("cookie")}${ico("candy")}</div>`; }, 600);
          return;
        }
        sfx("swap");
        draw();
      };
      draw();
    },
    onClose() {
      if (mishtiDone) return true;
      mishtiDone = true;
      OS.sys("error");
      OS.dialog({ icon: "angry", title: "ghoti bekiye debo mona", text: "You walked out of the mishti shop without choosing? Choose next time.", buttons: [{ label: "Sorry", primary: true }] });
      return false;
    },
  });

  /* ================= CAKE ================= */
  OS.register("cake", {
    name: "cake.exe", title: "cake.exe — make a wish", icon: "cake", color: "linear-gradient(#ffb3c6,#ff5fa2)", dock: true, w: 480, h: 500,
    render(body, win) {
      body.innerHTML = `
        <div class="cake-app">
          <h2 style="margin:0">Happy ${D.age}th, ${esc(OS.user)}!</h2>
          <div class="cake">
            <div class="candles">${'<div class="candle"><div class="flame"></div></div>'.repeat(5)}</div>
            <div class="drip"></div>
            <div class="layer l2"></div>
            <div class="layer l1"><div class="num">${D.age}</div></div>
            <div class="plate"></div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
            <button class="btn primary" data-mic>${ico("mic")} Blow into the mic</button>
            <button class="btn" data-relight>${ico("flame")} Relight</button>
          </div>
          <div class="hint">or tap the candles. (blowing works best, like everything else you do)</div>
        </div>`;
      const candles = [...body.querySelectorAll(".candle")];
      let celebrated = false;
      const check = () => {
        if (!celebrated && candles.every((c) => c.classList.contains("out"))) {
          celebrated = true;
          stopMic();
          OS.confetti(260, true);
          OS.sys("celebrate");
          setTimeout(() => OS.notify("sparkles", "Wish received", "Processing… estimated delivery: when Kendall wins.", 6000), 800);
        }
      };
      const out = (c) => { if (!c.classList.contains("out")) { sfx("blow"); c.classList.add("out"); check(); } };
      candles.forEach((c) => (c.onclick = () => out(c)));
      $("[data-relight]", body).onclick = () => { sfx("magic"); celebrated = false; candles.forEach((c) => c.classList.remove("out")); };

      let stream, ctx, rafId;
      const stopMic = () => { cancelAnimationFrame(rafId); stream && stream.getTracks().forEach((t) => t.stop()); ctx && ctx.close(); stream = ctx = null; };
      win._stopMic = stopMic;
      $("[data-mic]", body).onclick = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          const an = ctx.createAnalyser();
          an.fftSize = 512;
          ctx.createMediaStreamSource(stream).connect(an);
          const data = new Uint8Array(an.fftSize);
          let loud = 0;
          OS.notify("mic", "Mic on", "Blow! Hard! Like you're cooling a glass of mulled wine!");
          const loop = () => {
            an.getByteTimeDomainData(data);
            let sum = 0;
            for (const v of data) sum += ((v - 128) / 128) ** 2;
            const rms = Math.sqrt(sum / data.length);
            loud = rms > 0.12 ? loud + 1 : Math.max(0, loud - 1);
            if (loud > 6) {
              loud = 0;
              const lit = candles.filter((c) => !c.classList.contains("out"));
              if (lit.length) out(rand(lit));
            }
            if (stream) rafId = requestAnimationFrame(loop);
          };
          loop();
        } catch {
          OS.notify("mic-off", "No mic", "Mic blocked. Just tap the candles, you lazy peplapig.");
        }
      };
    },
    onClose(win) { win._stopMic && win._stopMic(); return true; },
  });

  /* ================= FUTURE ================= */
  OS.register("future", {
    name: "Bhoboshyot.exe", title: "Bhoboshyot.exe — AI Fortune Teller", icon: "eye", color: "linear-gradient(#b48cff,#4b148f)", dock: true, w: 500, h: 520,
    render(body) {
      body.innerHTML = `
        <div class="future">
          <div class="orb">${ico("eye")}</div>
          <h2>What does year 25 hold?</h2>
          <div class="log"></div>
          <div class="out"></div>
          <button class="btn-glow">${ico("sparkles")} Scan my future</button>
        </div>`;
      const btn = $(".btn-glow", body), log = $(".log", body), out = $(".out", body), orb = $(".orb", body);
      btn.onclick = async () => {
        btn.disabled = true; btn.style.opacity = .4;
        log.textContent = ""; out.innerHTML = "";
        orb.classList.add("scan");
        orb.innerHTML = ico("scan-face");
        const steps = [
          "> scanning face............ done",
          "> reading palm............. sticky (beer?)",
          "> Succession watch hours... concerning",
          "> wine palate.............. refined (self-certified)",
          "> CGPA..................... 9.17, he will mention it",
          "> aura reading............. +9000 (seal-boosted)",
          "> consulting tralalero tralala...",
          "> consulting the peplaz agency (est. 2019)...",
          "> prophecy generated.",
        ];
        for (const s of steps) { sfx("key"); log.textContent += s + "\n"; await sleep(520); }
        orb.classList.remove("scan");
        orb.innerHTML = ico("star");
        sfx("magic");
        out.innerHTML = `<div class="verdict">"${esc(D.prophecy)}"</div><div style="opacity:.7;font-size:12px;margin-top:6px">Accuracy: 100%. Refunds: 0%.</div>`;
        setTimeout(() => OS.confetti(90), 500);
        btn.disabled = false; btn.style.opacity = 1; btn.innerHTML = `${ico("sparkles")} Scan again (same answer)`;
      };
    },
  });

  /* ================= SEALTUBE ================= */
  OS.register("sealtube", {
    name: "SealTube", title: "SealTube", icon: "seal", color: "linear-gradient(#bfe9ff,#3a8dde)", dock: true, w: 760, h: 600,
    render(body) {
      body.innerHTML = `
        <div class="sealtube">
          <div class="st-top"><span class="logo">${ico("play")}</span> SealTube <span style="font-weight:400;font-size:12px;color:#aaa;margin-left:auto">recommended for: ${esc(OS.user)}</span></div>
          <div class="st-player"></div>
          <div class="st-list"></div>
        </div>`;
      const player = $(".st-player", body), list = $(".st-list", body);
      const play = (i) => {
        const v = D.sealVideos[i];
        player.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="${esc(v.title)}"></iframe>`;
        list.querySelectorAll(".st-item").forEach((x, k) => x.classList.toggle("on", k === i));
      };
      D.sealVideos.forEach((v, i) => {
        const b = el("button", "st-item", `<img src="https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/mqdefault.jpg" alt="" /><div><b>${esc(v.title)}</b><small>SealTube · 25M views · ${ico("badge-check")} verified seal</small></div>`);
        b.onclick = () => { sfx("click"); play(i); };
        list.appendChild(b);
      });
      if (D.sealVideos.length) play(0);
    },
  });

  /* ================= PEPLAFLIX ================= */
  OS.register("flix", {
    name: "PeplaFlix", title: "PeplaFlix", icon: "clapperboard", color: "linear-gradient(#333,#000)", dock: true, w: 760, h: 520,
    render(body) {
      const card = (title, bg, meta, prog, act) => `<button class="flix-card" data-act="${act}"><div class="poster" style="background:${bg}">${title}</div><div class="prog"><i style="width:${prog}%"></i></div><div class="meta">${meta}</div></button>`;
      body.innerHTML = `
        <div class="flix">
          <div class="brand">PEPLAFLIX</div>
          <h3>Continue watching for ${esc(OS.user)}</h3>
          <div class="flix-row">
            ${card("SUCCESSION", "linear-gradient(135deg,#1c1c1c,#5b4a2e)", "Rewatch #14 · S4:E10", 98, "succ")}
            ${card("Schitt's Creek", "linear-gradient(135deg,#f6d365,#fda085)", "Rewatch #9 · respectable", 60, "schitt")}
            ${card("PEPLAZ: The Documentary", "linear-gradient(135deg,#ff5fa2,#7a7cff)", "Starring all 4 idiots", 25, "doc")}
          </div>
          <h3>Because you watched Succession</h3>
          <div class="flix-row">
            ${card("Succession (again)", "linear-gradient(135deg,#222,#444)", "You've seen this", 100, "succ")}
            ${card("Succession — Bangla Dub", "linear-gradient(135deg,#0a3d2a,#1f7a4d)", "\"Logan Roy da, ghoti bekiye debo\"", 0, "dub")}
            ${card("Seal Planet", "linear-gradient(135deg,#a1c4fd,#c2e9fb)", "Nature documentary", 40, "seal")}
          </div>
        </div>`;
      body.querySelectorAll(".flix-card").forEach((b) => (b.onclick = () => {
        sfx("click");
        const a = b.dataset.act;
        if (a === "succ") OS.dialog({ icon: "tv", title: "Are you still watching Succession?", text: "This is rewatch #14. The peplaz have been notified. An intervention is scheduled.",
          buttons: [{ label: "Yes, sadly", primary: true, onClick: () => OS.notify("thumbs-down", "PeplaFlix", "-200 aura. Gunnu has been informed.") }, { label: "Watch Schitt's Creek", onClick: () => OS.notify("thumbs-up", "PeplaFlix", "+500 aura. Good choice.") }] });
        if (a === "schitt") OS.notify("flower", "Schitt's Creek", "Respectable taste detected. The only thing we won't roast.");
        if (a === "doc") OS.open("photos");
        if (a === "dub") OS.notify("mic", "Coming soon", "Dubbing artist is busy. ami ekhon ektu byasto achi…");
        if (a === "seal") OS.open("sealtube");
      }));
    },
  });

  /* ================= ACTIVITY MONITOR ================= */
  OS.register("activity", {
    name: "Activity Monitor", title: "Activity Monitor — Punnu.local", icon: "activity", color: "linear-gradient(#5a5a66,#1c1c22)", dock: true, w: 620, h: 440,
    render(body, win) {
      const procs = [
        ["succession_rewatch", 96.8, "tv"], ["wine_cellar_index", 74.2, "wine"], ["seal_thoughts", 51.0, "fish"],
        ["iim_casestudy.xlsx", 44.4, "graduation-cap"],
        ["peplaz_groupchat", 38.7, "message-circle"], ["hangover_daemon", 33.1, "frown"], ["aura_farming", 21.6, "sparkles"],
        ["nonta_meetha_resolver", 12.8, "candy"], ["brain.exe", 0.5, "brain"], ["responsibility", 0.0, "clipboard"],
      ];
      body.innerHTML = `
        <div class="am" style="display:flex;flex-direction:column;height:100%">
          <div style="flex:1;overflow:auto"><table><thead><tr><th>Process</th><th>% CPU</th><th>Status</th></tr></thead><tbody></tbody></table></div>
          <div class="am-foot">
            <span>Glasses poured: <b class="am-wine">${OS.wine}</b></span>
            <span style="display:flex;gap:8px">
              <button class="btn" data-kill>Force Quit succession_rewatch</button>
              <button class="btn primary" data-drink>${ico("wine")} Open a bottle</button>
            </span>
          </div>
        </div>`;
      const tb = $("tbody", body);
      const rows = procs.map(([n, , ic]) => {
        const tr = el("tr", "", `<td>${ico(ic)} ${n}</td><td><span class="bar"><i></i></span><span class="v"></span></td><td class="st"></td>`);
        tb.appendChild(tr);
        return tr;
      });
      const draw = () => {
        procs.forEach(([n, c], i) => {
          const v = Math.max(0, Math.min(100, c + (c > 1 ? (Math.random() - 0.5) * 6 : 0)));
          const hot = v > 70;
          const st = n === "brain.exe" ? "Not Responding" : n === "responsibility" ? "Suspended" : hot ? "On fire" : "Running";
          const r = rows[i];
          $(".bar i", r).style.width = v + "%";
          $(".v", r).textContent = v.toFixed(1);
          r.children[1].className = hot ? "hot" : "";
          const s = $(".st", r); s.textContent = st; s.className = "st" + (st !== "Running" ? " hot" : "");
        });
      };
      draw();
      win._iv = setInterval(draw, 1500);
      $("[data-kill]", body).onclick = () => OS.dialog({ icon: "tv", title: "Cannot quit succession_rewatch", text: "This process is protected by the user. Even the peplaz agency couldn't stop it." });
      $("[data-drink]", body).onclick = () => OS.dialog({
        icon: "wine", title: "Open a bottle?", text: `${OS.otherName()} found a bottle of red in the cellar. Uncork it?`, sound: "pop",
        buttons: [
          { label: "Obviously", primary: true, onClick: () => { OS.pourWine(); $(".am-wine", body).textContent = OS.wine; } },
          { label: "No", runaway: true },
        ],
      });
    },
    onClose(win) { clearInterval(win._iv); return true; },
  });

  /* ================= BRAINROT CARDS ================= */
  OS.register("brainrot", {
    name: "Brainrot.app", title: "Brainrot Trading Cards — Peplaz Edition", icon: "brain", color: "linear-gradient(#ffe259,#ffa751)", dock: true, w: 760, h: 560,
    render(body) {
      body.innerHTML = `<div class="cards"></div>`;
      const g = $(".cards", body);
      D.cards.forEach((c) => {
        const stats = Object.entries(c.stats).map(([k, v]) => `<div class="stat"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
        const art = (Array.isArray(c.art) ? c.art : [c.art]).map((a) => ico(a)).join("");
        const card = el("div", "card", `
          <div class="card-in">
            <div class="card-f"><div class="art">${art}</div><div class="nm">${esc(c.name)}</div><div class="rar">${esc(c.rarity)}</div><div class="muted" style="font-size:11px;margin-top:8px">tap to flip</div></div>
            <div class="card-b"><b>${esc(c.name)}</b><span class="muted">a.k.a. ${esc(c.who)}</span>${stats}<div style="margin-top:auto;font-size:12px">${ico("zap")} ${esc(c.move)}</div></div>
          </div>`);
        card.onclick = () => { sfx("swap"); card.classList.toggle("flip"); };
        g.appendChild(card);
      });
    },
  });

  /* ================= TERMINAL ================= */
  // Every command, with its description — used by `help` and the Help app.
  const TERM_HELP = [
    ["help", "show this list (help <command> for one command)"],
    ["whoami", "who you are (all of your names)"],
    ["ls", "list files in your home folder"],
    ["cat <file>", "read a file, e.g. cat secrets.txt"],
    ["neofetch", "system info about you"],
    ["age", "your age (real and mental)"],
    ["cgpa", "your IIM Mumbai CGPA (you'll love this)"],
    ["wine", "pour a glass, get tasting notes"],
    ["peplaz", "info about the group"],
    ["sudo make-a-wish", "make a birthday wish (needs sudo)"],
    ["ghoti-bekai", "bend the ghoti (the window will feel it)"],
    ["succession", "try it. we dare you"],
    ["seal", "open SealTube"],
    ["nonta / meetha", "the eternal question"],
    ["rm -rf succession", "try to delete Succession (good luck)"],
    ["open <app>", "open an app, e.g. open cake"],
    ["apps", "list app names you can open"],
    ["mute / unmute", "turn sound effects off / on"],
    ["credits", "who built this (and who to blame)"],
    ["clear", "clear the screen"],
    ["exit", "close Terminal"],
  ];
  OS.TERM_HELP = TERM_HELP;

  OS.register("terminal", {
    name: "Terminal", title: () => `${OS.user.replace(/\s/g, "").toLowerCase()}@PeplaOS — zsh`, icon: "square-terminal", color: "linear-gradient(#444,#111)", dock: true, sepBefore: true, w: 640, h: 420,
    render(body) {
      const u = OS.user.replace(/\s/g, "").toLowerCase();
      body.innerHTML = `<div class="term"></div>`;
      const t = $(".term", body);
      const print = (html, cls = "") => { const l = el("div", "line " + cls, html); t.insertBefore(l, t.lastChild); t.scrollTop = 1e9; };
      const promptLine = el("div", "line", `<span class="prompt">${esc(u)}@PeplaOS ~ %</span> <input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal input" />`);
      t.appendChild(promptLine);
      const inp = $("input", promptLine);
      t.onclick = () => inp.focus();
      setTimeout(() => inp.focus(), 50);
      print(`Last login: today, on your 25th birthday\nType <span class="yel">help</span> to see all commands.`);

      const pad = (s, n) => s + " ".repeat(Math.max(1, n - s.length));
      const helpText = (one) => {
        if (one) {
          const h = TERM_HELP.find(([c]) => c.split(/[ /<]/)[0] === one || c === one);
          return h ? `<span class="cyn">${esc(h[0])}</span>  ${esc(h[1])}` : `<span class="err">no help for "${esc(one)}"</span>`;
        }
        return `<span class="yel">PeplaOS Terminal — commands</span>\n` +
          TERM_HELP.map(([c, d]) => `  <span class="cyn">${esc(pad(c, 18))}</span>${esc(d)}`).join("\n") +
          `\n\n<span class="muted">tip: there are hidden commands too. try being polite.</span>`;
      };

      const cmds = {
        whoami: () => `${esc(OS.user)} (also known as: ${D.nicknames.map((n) => esc(n.name)).join(", ")})`,
        ls: () => `secrets.txt   wine_list.txt   succession_s1-s4/   seal_pics/   peplaz_lore.md   wish.txt`,
        neofetch: () => `<span class="cyn">  PeplaOS 25  </span>   ${esc(u)}@PeplaOS\n                 OS: PeplaOS 25 "Sealoma"\n                 Uptime: 25 years\n                 Shell: peplaz-sh (ds³ edition)\n                 CPU: 0.5 brain cells\n                 Memory: Succession quotes (100%)\n                 Education: IIM Mumbai, CGPA ${D.cgpa}\n                 Palate: Sommelier (self-certified)`,
        age: () => `${D.age}. ${D.age} years. Physically. Mentally: 12.`,
        cgpa: () => { sfx("magic"); return `<span class="yel">${D.cgpa}</span> (IIM Mumbai). Yes, we know. You told us. Sob milie ${D.cgpa}.`; },
        wine: () => { OS.pourWine(); return `uncorking... glass #${OS.wine}\n<span class="cyn">${esc(OS.wineNote())}</span>`; },
        peplaz: () => `peplaz agency / ds³ / peplapigs\nfounded: ${D.foundedYear} (${new Date().getFullYear() - D.foundedYear} years of chaos)\nmembers: ${D.members.join(", ")}\nshared brain cells: 1\nstatus: love you, idiot`,
        "sudo make-a-wish": () => { OS.confetti(200, true); return `<span class="yel">[sudo] password for ${esc(u)}:</span> ********\nWish granted (terms and conditions apply, peplaz may bully you anyway)`; },
        "make-a-wish": () => `<span class="err">permission denied. try sudo, coward.</span>`,
        "ghoti-bekai": () => {
          const w = OS.windows.get("terminal");
          if (w) { w.classList.remove("shake"); void w.offsetWidth; w.classList.add("shake"); }
          sfx("error"); OS.sys("error");
          return `bending ghoti...\n<span class="yel">   ___         ___\n  /   \\       /   \\__\n |     |  -->  |      /\n  \\___/       \\____/</span>\n<span class="err">ghoti bekiye dilam mona.</span>`;
        },
        succession: () => { sfx("error"); return `<span class="err">Error 418: you've watched this 14 times. Seek help.</span>`; },
        seal: () => { sfx("seal"); setTimeout(() => OS.open("sealtube"), 400); return "opening SealTube… ork ork"; },
        nonta: () => `ei meetha nonta khabi?`,
        meetha: () => `ei nonta meetha khabi?`,
        "nonta / meetha": () => `pick one. (you can't)`,
        "rm -rf succession": () => { sfx("error"); return `<span class="err">rm: succession: Permission denied. The user has protected this file with his life.</span>`; },
        apps: () => Object.values(OS.apps).filter((a) => a.dock || a.desk).map((a) => `  <span class="cyn">${esc(a.id)}</span>  ${esc(a.name)}`).join("\n"),
        mute: () => { if (!SFX.muted) SFX.toggle(); return "sound effects off"; },
        unmute: () => { if (SFX.muted) SFX.toggle(); sfx("pop"); return "sound effects on"; },
        credits: () => `PeplaOS 25, built with love by <span class="yel">${esc(D.author)}</span>\nfor the peplaz agency (est. ${D.foundedYear})\n<span class="cyn">bugs khoma korben.</span>`,
        please: () => `<span class="yel">aww. hidden commands: </span>love, gunnu, pecho`,
        love: () => `peplaz love you. (this message will self-destruct)`,
        gunnu: () => `Drinking is injurious to health. — Srihorir Thakuma Ganjeri Gunnu`,
        pecho: () => `Tumi aro matlami koro pecho.`,
        exit: () => { setTimeout(() => OS.close("terminal"), 300); return "bye (you can't escape the peplaz)"; },
      };
      const files = {
        "secrets.txt": "1. He cried during the Schitt's Creek finale.\n2. He has a seal plushie (probably).\n3. The peplaz love him. Don't tell him.",
        "wish.txt": "Happy 25th from the peplaz — now go open the Top Secret folder.",
        "peplaz_lore.md": "# peplaz lore\n- a professional agency. est. 2019\n- 4 pigs\n- 1 brain cell\n- infinite group chat messages\n- 0 completed plans",
        "wine_list.txt": "1. Red, bold, expensive\n2. Red, bold, slightly less expensive\n3. Whatever the peplaz bring (he'll judge it)",
      };
      const history = []; let hi = 0;
      inp.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") { if (history.length) { hi = Math.max(0, hi - 1); inp.value = history[hi]; } e.preventDefault(); return; }
        if (e.key === "ArrowDown") { hi = Math.min(history.length, hi + 1); inp.value = history[hi] || ""; e.preventDefault(); return; }
        if (e.key !== "Enter") { if (e.key.length === 1 || e.key === "Backspace") sfx("key"); return; }
        const raw = inp.value.trim();
        inp.value = "";
        print(`<span class="prompt">${esc(u)}@PeplaOS ~ %</span> ${esc(raw)}`);
        if (!raw) return;
        history.push(raw); hi = history.length;
        sfx("click");
        const low = raw.toLowerCase();
        if (low === "clear") { [...t.querySelectorAll(".line")].forEach((l) => l !== promptLine && l.remove()); return; }
        if (low === "help" || low.startsWith("help ")) return print(helpText(low.slice(5).trim()));
        if (low.startsWith("cat ")) { const f = raw.slice(4).trim(); return print(files[f] ? (files[f].includes("<span") ? files[f] : esc(files[f])) : `<span class="err">cat: ${esc(f)}: No such file. Like your plans.</span>`); }
        if (low.startsWith("open ")) { const a = low.slice(5).trim(); const id = Object.keys(OS.apps).find((k) => k === a || OS.apps[k].name.toLowerCase().startsWith(a)); if (id) { OS.open(id); return print(`opening ${esc(OS.apps[id].name)}…`); } return print(`<span class="err">no app called ${esc(a)}. type apps to see them.</span>`); }
        const fn = cmds[low];
        if (!fn) sfx("error");
        print(fn ? fn() : `<span class="err">zsh: command not found: ${esc(raw)}</span>\n<span class="muted">(-50 aura. type help)</span>`);
      });
    },
  });

  /* ================= HELP ================= */
  OS.register("help", {
    name: "PeplaOS Help", title: "PeplaOS Help", icon: "circle-help", noCount: true, w: 560, h: 560,
    render(body) {
      body.innerHTML = `
        <div class="help pad">
          <h2 class="app-h">${ico("circle-help")} PeplaOS Help</h2>
          <p class="muted">Everything you can do on this computer, ${esc(OS.user)}.</p>
          <h3>Getting around</h3>
          <ul>
            <li>Open apps from the <b>dock</b> at the bottom. Double-click (or tap) icons on the desktop.</li>
            <li>Drag windows by their title bar. Red = close, yellow = minimise, green = full screen.</li>
            <li>The <b>TOP SECRET</b> folder unlocks after you open ${D.appsToUnlock} different apps.</li>
            <li>Click the seal. Always click the seal.</li>
            <li>The speaker icon in the menu bar turns sound effects on and off.</li>
          </ul>
          <h3>Terminal commands</h3>
          <table class="help-table">${OS.TERM_HELP.map(([c, d]) => `<tr><td><code>${esc(c)}</code></td><td>${esc(d)}</td></tr>`).join("")}</table>
          <p style="margin-top:14px"><button class="btn primary" data-term>${ico("square-terminal")} Open Terminal</button></p>
          <p class="credit">${ico("bug")} Found a bug? PeplaOS was built by ${esc(D.author)}. Bugs khoma korben.</p>
        </div>`;
      $("[data-term]", body).onclick = () => OS.open("terminal");
    },
  });

  /* ================= ABOUT ================= */
  OS.register("about", {
    name: "About This Punnu", title: "About This Punnu", icon: "seal", noCount: true, w: 420, h: 460,
    render(body) {
      body.innerHTML = `
        <div class="about">
          <div class="big">${ico("seal")}</div>
          <h2>PeplaOS 25</h2>
          <div class="muted">"Sealoma" · Version 25.0</div>
          <table>
            <tr><td>Model</td><td>${esc(D.birthdayBoy)} (${new Date().getFullYear() - D.age} edition)</td></tr>
            <tr><td>Chip</td><td>Peplapig M1 (0.5 brain cells)</td></tr>
            <tr><td>Memory</td><td>100% Succession quotes</td></tr>
            <tr><td>Graphics</td><td>Beer Goggles Pro</td></tr>
            <tr><td>Education</td><td>IIM Mumbai, CGPA ${D.cgpa} (topper)</td></tr>
            <tr><td>Palate</td><td>Wine connoisseur (self-certified)</td></tr>
            <tr><td>Support</td><td>peplaz agency, since ${D.foundedYear}</td></tr>
            <tr><td>Serial</td><td>PEPLA-PIG-DS3-0025</td></tr>
            <tr><td>Warranty</td><td>Expired. Peplaz offer lifetime support anyway.</td></tr>
          </table>
          <p class="credit">${ico("bug")} Built by ${esc(D.author)}. Bugs khoma korben.</p>
        </div>`;
    },
  });

  /* ================= TRASH ================= */
  OS.register("trash", {
    name: "Trash", title: "Trash — deleted_embarrassing/", icon: "trash-2", desk: true, deskName: "Trash", w: 640, h: 460,
    render(body) {
      const pics = OS.photos.slice().sort(() => Math.random() - 0.5).slice(0, 12);
      body.innerHTML = `
        <div class="trash-top"><span>${pics.length} items you thought you deleted</span><button class="btn">Empty Trash</button></div>
        <div class="grid">${pics.map((p) => `<div class="cell"><img src="${p.src}" loading="lazy" alt="" /></div>`).join("") || '<div class="pad muted">empty… for now</div>'}</div>`;
      body.querySelectorAll(".cell").forEach((c, i) => (c.onclick = () => viewer(body, pics, i, false)));
      $(".trash-top .btn", body).onclick = () => {
        OS.sys("trash");
        OS.dialog({ icon: "trash-2", title: "Empty Trash?", text: "These photos will be permanently uploaded to the peplaz group chat instead.",
          buttons: [{ label: "Cancel", primary: true }, { label: "Empty", runaway: true, onClick: () => { sfx("minimize"); OS.notify("upload", "Uploaded", "Sent to peplaz. Too late now."); } }] });
      };
    },
  });

  /* ================= DO NOT OPEN ================= */
  OS.register("donotopen", {
    name: "TextEdit", title: "DO_NOT_OPEN.txt", icon: "file-warning", desk: true, deskName: "DO_NOT_OPEN.txt", w: 440, h: 300,
    locked() { return !this._ok; },
    onLocked() {
      const self = this;
      OS.dialog({ icon: "triangle-alert", title: "Are you sure?", text: "This file is not for you.",
        buttons: [{ label: "Cancel" }, { label: "Open", primary: true, onClick: () =>
          OS.dialog({ icon: "octagon-x", title: "Really sure?", text: "Like, really really?",
            buttons: [{ label: "No", primary: true }, { label: "YES", onClick: () => { self._ok = true; OS.open("donotopen"); } }] }) }] });
    },
    render(body) {
      body.innerHTML = `<div class="pad" style="font-family:var(--mono);font-size:14px;line-height:1.7">you have zero self control.<br/>this is why you're on rewatch #14.<br/><br/>happy birthday anyway.<br/>— the peplaz</div>`;
    },
  });

  /* ================= TOP SECRET ================= */
  OS.register("secret", {
    name: "Top Secret", title: "Top Secret — For Punnu's Eyes Only", icon: "lock", desk: true, deskName: "TOP SECRET", noCount: true, w: 640, h: 620,
    deskIcon: () => (OS.unlocked() ? "folder-open" : "lock"),
    locked: () => !OS.unlocked(),
    onLocked() {
      OS.sys("busy");
      OS.dialog({ icon: "lock", title: "Folder encrypted", text: `ami ekhon ektu byasto achi nahole toke jhamtam. Explore ${D.appsToUnlock - OS.openedCount()} more app(s) first.`, buttons: [{ label: "Fine", primary: true }] });
    },
    render(body) {
      body.innerHTML = `<div class="letter-wrap"><div class="envelope"><span class="seal">${ico("heart")}</span><small>tap to open</small></div></div>`;
      $(".envelope", body).onclick = () => {
        const L = D.letter;
        const pics = OS.photos.slice().sort(() => Math.random() - 0.5).slice(0, 4);
        $(".letter-wrap", body).innerHTML = `
          <div class="paper">
            <h2>${esc(L.title)}</h2>
            ${L.body.map((p) => `<p>${esc(p)}</p>`).join("")}
            <div class="sign">${esc(L.signoff)}</div>
            <div class="polaroids">${pics.map((p) => `<img src="${p.src}" alt="" />`).join("")}</div>
          </div>`;
        $(".letter-wrap", body).style.alignItems = "flex-start";
        sfx("unlock");
        OS.confetti(300, true);
        OS.sys("celebrate");
      };
    },
  });
})();
