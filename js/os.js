/* =========================================================
   PeplaOS core: boot, login, window manager, dock, helpers
   ========================================================= */
(() => {
  const D = window.PEPLA;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sfx = (n) => window.SFX && SFX.play(n);

  const media = (window.PEPLA_IMAGES || []).map((f) => ({
    file: f,
    src: "images/" + encodeURIComponent(f),
    video: /\.(mp4|webm|mov)$/i.test(f),
  }));

  const OS = {
    $, el, sleep, rand, esc, sfx,
    apps: {},
    user: D.birthdayBoy,
    media,
    photos: media.filter((m) => !m.video),
    videos: media.filter((m) => m.video),
    opened: new Set(),
    windows: new Map(),
    z: 100,
    wine: 0,
  };
  window.OS = OS;

  OS.register = (id, app) => { OS.apps[id] = { id, ...app }; };
  OS.otherName = () => {
    const others = D.nicknames.map((n) => n.name).filter((n) => n !== OS.user);
    return others.length ? rand(others) : OS.user;
  };
  OS.isMobile = () => window.innerWidth <= 700;

  /* ---------- voice notes ---------- */
  const audioCache = {};
  let currentAudio = null;
  OS.play = (id, { exclusive = true } = {}) => {
    if (window.SFX && SFX.muted) return null;
    const s = D.sounds.find((x) => x.id === id);
    if (!s) return null;
    if (exclusive && currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
    const a = audioCache[id] || (audioCache[id] = new Audio(s.file));
    a.currentTime = 0;
    a.play().catch(() => {});
    currentAudio = a;
    return a;
  };
  OS.sys = (event) => { const id = D.systemSounds[event]; if (id) return OS.play(id); };

  /* ---------- notifications ---------- */
  OS.notify = (icon, title, text, ms = 4500) => {
    sfx("notify");
    const n = el("div", "notif", `<div class="n-ico">${ico(icon)}</div><div><b>${esc(title)}</b><p>${esc(text)}</p></div>`);
    $("#notifications").appendChild(n);
    const kill = () => { n.classList.add("out"); setTimeout(() => n.remove(), 300); };
    n.onclick = kill;
    setTimeout(kill, ms);
  };

  /* ---------- dialogs ---------- */
  OS.dialog = ({ icon = "triangle-alert", title, text = "", buttons = [{ label: "OK", primary: true }], sound = "error" }) => {
    sfx(sound);
    const wrap = el("div", "dialog-wrap");
    const d = el("div", "dialog", `<div class="d-ico">${ico(icon)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>`);
    const row = el("div", "d-btns");
    buttons.forEach((b) => {
      const btn = el("button", "btn" + (b.primary ? " primary" : "") + (b.runaway ? " runaway" : ""), esc(b.label));
      if (b.runaway) {
        let tries = 0;
        const flee = () => {
          if (tries++ > 6) return;
          sfx("boop");
          const x = (Math.random() - 0.5) * 180, y = (Math.random() - 0.5) * 120;
          btn.style.transform = `translate(${x}px, ${y}px)`;
        };
        btn.addEventListener("pointerenter", flee);
        btn.addEventListener("touchstart", (e) => { if (tries < 6) { e.preventDefault(); flee(); } }, { passive: false });
      }
      btn.onclick = () => { sfx("click"); wrap.remove(); b.onClick && b.onClick(); };
      row.appendChild(btn);
    });
    d.appendChild(row);
    wrap.appendChild(d);
    $("#desktop").appendChild(wrap);
    return wrap;
  };

  OS.busy = () => {
    sfx("error");
    OS.sys("busy");
    OS.notify("hand", "PeplaOS is busy", "ami ekhon ektu byasto achi nahole toke jhamtam", 5000);
  };

  const tastingNotes = [
    "Notes of blackcurrant, oak and IIM-level arrogance.",
    "A bold red. Pairs well with a Succession rewatch.",
    "Crisp, dry, slightly judgemental. Like Sou.",
    "Swirled for 4 minutes before the first sip. Classic.",
    "Vintage 2019, the year the peplaz agency was founded.",
    "Smells like ambition and a 9.17 CGPA.",
  ];
  OS.wineNote = () => rand(tastingNotes);
  // After a couple of glasses he starts announcing his love for the peplaz.
  // (lines straight from the group chat)
  const loveAnnouncements = [
    "I love you all so so much",
    "Guys. Guys. Listen. I love you guys.",
    "reiterating je we love you",
    "peplaz is the best agency in the world. since 2019. I'm serious.",
    "Good night. We love you",
    "no but seriously I love you guys so much hyaaa",
  ];
  let loveIdx = 0;
  OS.pourWine = () => {
    sfx("pour");
    OS.wine++;
    const n = OS.wine;
    setTimeout(() => OS.notify("wine", `Glass #${n} poured`, OS.wineNote()), 500);
    if (n >= 2) {
      const line = loveAnnouncements[loveIdx++ % loveAnnouncements.length];
      setTimeout(() => OS.notify("heart", `${OS.user} (${n} glasses in)`, line, 6000), 2200);
    }
    if (n === 4) {
      setTimeout(() => OS.dialog({
        icon: "megaphone", title: "Public announcement", sound: "notify",
        text: `${OS.user} would like everyone to know that he loves the peplaz very, very much. He will now say it 11 more times.`,
        buttons: [{ label: "We love you too", primary: true, onClick: () => OS.confetti(160) }],
      }), 4200);
    }
  };

  /* ---------- confetti ---------- */
  const cv = $("#confetti"), cx = cv.getContext("2d");
  let parts = [], raf = null;
  OS.confetti = (n = 220, extra = false) => {
    sfx("party");
    cv.width = innerWidth; cv.height = innerHeight;
    const colors = ["#ff5fa2", "#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#ffffff", "#9d6bff"];
    for (let i = 0; i < n; i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.6,
        vx: (Math.random() - 0.5) * 18, vy: -Math.random() * 20 - 8,
        r: Math.random() * 6 + 4, c: rand(colors), a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3,
        shape: extra && Math.random() < 0.15 ? "25" : Math.random() < 0.3 ? "circle" : "rect", life: 0,
      });
    }
    if (!raf) tick();
  };
  function tick() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => {
      p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life++;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c;
      if (p.shape === "25") { cx.font = "800 22px Inter, sans-serif"; cx.fillText("25", -12, 8); }
      else if (p.shape === "circle") { cx.beginPath(); cx.arc(0, 0, p.r / 1.5, 0, 7); cx.fill(); }
      else cx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2);
      cx.restore();
    });
    parts = parts.filter((p) => p.y < cv.height + 40 && p.life < 400);
    raf = parts.length ? requestAnimationFrame(tick) : (cx.clearRect(0, 0, cv.width, cv.height), null);
  }

  /* ---------- window manager ---------- */
  let cascade = 0;
  OS.open = (id) => {
    const app = OS.apps[id];
    if (!app) return;
    if (app.locked && app.locked()) return app.onLocked ? app.onLocked() : OS.busy();
    if (OS.windows.has(id)) {
      const w = OS.windows.get(id);
      if (w.classList.contains("hidden")) sfx("open");
      w.classList.remove("hidden");
      focus(w, app);
      return w;
    }
    sfx("open");
    OS.opened.add(id);
    const w = el("div", "win");
    const vw = innerWidth, vh = innerHeight;
    const W = Math.min(app.w || 640, vw - 40), H = Math.min(app.h || 460, vh - 140);
    const left = Math.max(10, (vw - W) / 2 + (cascade % 5) * 26 - 50);
    const top = Math.max(36, (vh - H) / 2 - 40 + (cascade % 5) * 22);
    cascade++;
    Object.assign(w.style, { width: W + "px", height: H + "px", left: left + "px", top: top + "px" });
    w.innerHTML = `
      <div class="win-bar">
        <div class="lights">
          <button class="light red" aria-label="Close"></button>
          <button class="light yellow" aria-label="Minimise"></button>
          <button class="light green" aria-label="Zoom"></button>
        </div>
        <div class="win-title">${esc(typeof app.title === "function" ? app.title() : app.title)}</div>
      </div>
      <div class="win-body"></div>`;
    $("#windows").appendChild(w);
    OS.windows.set(id, w);
    const body = $(".win-body", w);
    $(".red", w).onclick = (e) => { e.stopPropagation(); OS.close(id); };
    $(".yellow", w).onclick = (e) => { e.stopPropagation(); sfx("minimize"); w.classList.add("hidden"); };
    $(".green", w).onclick = (e) => { e.stopPropagation(); sfx("click"); w.classList.toggle("max"); };
    w.addEventListener("pointerdown", () => focus(w, app));
    drag(w, $(".win-bar", w));
    focus(w, app);
    try { app.render(body, w); } catch (err) { console.error(err); body.innerHTML = `<div class="pad">This app has crashed (like you at 2am).</div>`; }
    updateDock();
    checkUnlock();
    return w;
  };
  OS.close = (id) => {
    const w = OS.windows.get(id);
    if (!w) return;
    const app = OS.apps[id];
    if (app.onClose && app.onClose(w) === false) return;
    sfx("close");
    OS.windows.delete(id);
    w.classList.add("closing");
    setTimeout(() => w.remove(), 160);
    updateDock();
  };

  function focus(w, app) {
    w.style.zIndex = ++OS.z;
    $("#mb-app").textContent = app.name;
  }
  function drag(w, handle) {
    let sx, sy, ox, oy, on = false;
    handle.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".lights") || OS.isMobile() || w.classList.contains("max")) return;
      on = true; sx = e.clientX; sy = e.clientY; ox = w.offsetLeft; oy = w.offsetTop;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!on) return;
      w.style.left = Math.min(innerWidth - 80, Math.max(-w.offsetWidth + 80, ox + e.clientX - sx)) + "px";
      w.style.top = Math.min(innerHeight - 60, Math.max(28, oy + e.clientY - sy)) + "px";
    });
    handle.addEventListener("pointerup", () => (on = false));
    handle.addEventListener("dblclick", (e) => { if (!e.target.closest(".lights")) w.classList.toggle("max"); });
  }

  /* ---------- unlock tracking ---------- */
  let unlockedShown = false;
  OS.openedCount = () => [...OS.opened].filter((id) => OS.apps[id] && !OS.apps[id].noCount).length;
  OS.unlocked = () => OS.openedCount() >= D.appsToUnlock;
  function checkUnlock() {
    if (!unlockedShown && OS.unlocked()) {
      unlockedShown = true;
      setTimeout(() => {
        sfx("unlock");
        OS.notify("lock-open", "Top Secret folder decrypted", "Something on the desktop just unlocked. Go look.", 7000);
        const ic = document.querySelector('[data-desk="secret"] .ico');
        if (ic) ic.innerHTML = ico("folder-open");
      }, 1200);
    }
  }

  /* ---------- dock ---------- */
  let clickTimes = [];
  function buildDock() {
    const dock = $("#dock");
    dock.innerHTML = "";
    Object.values(OS.apps).filter((a) => a.dock).forEach((a) => {
      if (a.sepBefore) dock.appendChild(el("div", "dock-sep"));
      const b = el("button", "dock-item", `<div class="ico" style="background:${a.color || "#fff"}">${ico(a.icon)}</div><div class="tip">${esc(a.name)}</div>`);
      b.dataset.app = a.id;
      b.onclick = () => {
        const now = Date.now();
        clickTimes = clickTimes.filter((t) => now - t < 2500).concat(now);
        if (clickTimes.length >= 7) { clickTimes = []; return OS.busy(); }
        sfx("click");
        b.classList.remove("bounce"); void b.offsetWidth;
        if (!OS.windows.has(a.id)) b.classList.add("bounce");
        OS.open(a.id);
      };
      dock.appendChild(b);
    });
  }
  function updateDock() {
    document.querySelectorAll(".dock-item").forEach((b) => b.classList.toggle("running", OS.windows.has(b.dataset.app)));
  }

  /* ---------- desktop extras ---------- */
  function buildDesktop() {
    const icons = $("#desk-icons");
    icons.innerHTML = "";
    Object.values(OS.apps).filter((a) => a.desk).forEach((a) => {
      const b = el("button", "desk-icon", `<div class="ico">${ico(a.deskIcon ? a.deskIcon() : a.icon)}</div><span>${esc(a.deskName || a.name)}</span>`);
      b.dataset.desk = a.id;
      b.ondblclick = () => OS.open(a.id);
      b.onclick = () => { sfx("click"); if (OS.isMobile() || matchMedia("(pointer:coarse)").matches) OS.open(a.id); };
      icons.appendChild(b);
    });

    // Photo widget
    if (OS.photos.length) {
      const w = el("div", "widget", `<img alt="" /><div class="w-cap">${ico("camera")} Photo of the minute</div>`);
      const img = $("img", w);
      const swap = () => { img.style.opacity = 0; setTimeout(() => { img.src = rand(OS.photos).src; img.style.opacity = 1; }, 400); };
      img.src = rand(OS.photos).src;
      setInterval(swap, 8000);
      w.onclick = () => OS.open("photos");
      $("#desktop").appendChild(w);
    }
    // Stats widget
    const c = el("div", "countdown-w", `
      <div>${ico("cake")} Age</div><b>${D.age}</b>
      <div style="margin-top:8px">${ico("graduation-cap")} CGPA (IIM Mumbai)</div><b>${D.cgpa}</b>
      <div style="margin-top:8px">${ico("tv")} Succession rewatches</div><b>∞</b>`);
    $("#desktop").appendChild(c);

    // Waddling seal
    const seal = el("div", "desk-seal", ico("seal"));
    seal.style.left = "40%";
    $("#desktop").appendChild(seal);
    setInterval(() => {
      const x = 10 + Math.random() * (innerWidth - 120);
      const cur = parseFloat(seal.style.left) || 0;
      seal.classList.toggle("flipx", x < cur);
      seal.style.left = x + "px";
    }, 7000);
    seal.onclick = () => {
      sfx("seal");
      OS.notify("fish", "ORK ORK", rand(["seal says happy birthday", "seal has more aura than you", "seal is also 25 (in seal years)", "seal would also watch Succession, tbh"]));
    };
  }

  /* ---------- menubar ---------- */
  function clock() {
    const d = new Date();
    const t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const day = d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
    $("#mb-clock").textContent = `${day} ${t}`;
    $("#login-clock").textContent = t.replace(/\s?[AP]M/i, "");
    $("#login-date").textContent = d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  }
  function menus() {
    $("#mb-logo").innerHTML = ico("seal");
    $("#mb-cgpa").innerHTML = `${ico("graduation-cap")} CGPA ${D.cgpa}`;
    $("#mb-wifi").innerHTML = `${ico("wifi")} peplaz-wifi`;
    const mute = $("#mb-mute");
    const drawMute = () => (mute.innerHTML = ico(window.SFX && SFX.muted ? "volume-x" : "volume-2"));
    drawMute();
    mute.onclick = (e) => { e.stopPropagation(); SFX.toggle(); drawMute(); sfx("click"); };

    const m = $("#apple-menu");
    $("#mb-logo").onclick = (e) => { e.stopPropagation(); sfx("click"); m.classList.toggle("hidden"); };
    document.addEventListener("click", () => m.classList.add("hidden"));
    m.addEventListener("click", (e) => {
      const it = e.target.closest(".dd-item");
      if (!it) return;
      sfx("click");
      if (it.dataset.open) OS.open(it.dataset.open);
      if (it.dataset.action === "sleep") {
        const s = el("div", "sleep-overlay", `${ico("moon")} zzz… (click to wake up)`);
        s.onclick = () => s.remove();
        document.body.appendChild(s);
      }
      if (it.dataset.action === "restart") location.reload();
      if (it.dataset.action === "bugs") OS.dialog({ icon: "bug", title: "Bugs khoma korben", text: `PeplaOS was hand-built by ${D.author} for your birthday. If something breaks, it's a feature. If it's really broken, bugs khoma korben.`, sound: "pop", buttons: [{ label: "Khoma korlam", primary: true }] });
      if (it.dataset.action === "logout") {
        OS.dialog({
          icon: "door-open", title: "Log out?", text: "You can't leave your own birthday party.",
          buttons: [{ label: "Stay", primary: true }, { label: "Leave", runaway: true, onClick: () => location.reload() }],
        });
      }
    });
    document.querySelectorAll(".mb-item").forEach((it) =>
      it.addEventListener("click", () => {
        if (it.dataset.open) { sfx("click"); return OS.open(it.dataset.open); }
        OS.notify("brain", it.textContent, rand([
          "This menu is under construction since 2001.",
          "-500 aura for clicking this.",
          `${OS.otherName()} has disabled this menu.`,
          "Error: brain not found. Have you tried Frutiger Aero yams?",
        ]));
      })
    );
  }

  /* ---------- screensaver ---------- */
  let idleT, saver = null;
  function resetIdle() {
    clearTimeout(idleT);
    if (saver) { saver.remove(); saver = null; }
    idleT = setTimeout(startSaver, 75000);
  }
  function startSaver() {
    if (!OS.photos.length || OS.windows.has("sealtube")) return;
    saver = el("div", "sleep-overlay");
    saver.style.cssText += "background:#000;overflow:hidden";
    const img = el("img");
    img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transition:opacity 1s, transform 6s linear";
    const cap = el("div", "", "Memories");
    cap.style.cssText = "position:absolute;bottom:30px;width:100%;text-align:center;color:#fff;font-family:var(--hand);font-size:34px;text-shadow:0 2px 8px #000";
    saver.append(img, cap);
    document.body.appendChild(saver);
    const step = () => {
      if (!saver) return;
      img.style.opacity = 0;
      setTimeout(() => { img.src = rand(OS.photos).src; img.style.transform = "scale(1)"; img.style.opacity = 1; requestAnimationFrame(() => (img.style.transform = "scale(1.08)")); }, 600);
      setTimeout(step, 5500);
    };
    step();
  }

  /* ---------- boot sequence (silent) ---------- */
  let skip = false;
  async function boot() {
    const log = $("#boot-log");
    const lines = [
      ["PeplaBIOS v25.0  (c) peplaz industries / ds³ labs", ""],
      ["CPU: 1x Punnu @ 0.5 brain cells", ""],
      ["Memory test: 640K of which 600K is Schitt's Creek quotes", "ok"],
      ["Checking friendship levels.............", "ok"],
      ["Connecting to peplaz agency (est. 2019)", "ok"],
      ["Detecting peplapigs: punnu, gunnu, munnu, chullu", "ok"],
      ["Uncorking /dev/wine ...................", "ok", "VINTAGE"],
      ["Loading IIM Mumbai topper module ......", "ok", "CGPA 9.17"],
      ["Loading Succession_rewatch_#14.mkv ....", "bad", "WHY"],
      ["Calibrating aura farming module .......", "ok"],
      ["Installing tralalero_tralala.dll ......", "ok"],
      ["Ghoti bending service ..................", "ok"],
      ["Searching for seals nearby .............", "ok", "FOUND"],
      ["Turning 25 ..............................", "ok", "DONE (no refunds)"],
      ["", ""],
      [`Built by ${D.author}. Bugs khoma korben.`, "warn", "NO WARRANTY"],
      ["Booting PeplaOS…", ""],
    ];
    for (const [t, cls, tag] of lines) {
      const tagTxt = cls ? ` [<span class="${cls}">${tag || (cls === "ok" ? " OK " : cls.toUpperCase())}</span>]` : "";
      log.innerHTML += esc(t) + tagTxt + "\n";
      if (!skip) await sleep(cls === "bad" ? 650 : 170 + Math.random() * 160);
    }
    if (!skip) await sleep(400);
    $("#boot").classList.add("hidden");
    await splash();
  }
  async function splash() {
    const s = $("#splash");
    $(".splash-logo", s).innerHTML = ico("seal");
    s.classList.remove("hidden");
    const msgs = ["Loading 25 years of chaos…", "Defragmenting memories…", "Removing embarrassing photos… failed", "Almost there (like his career)…", "Done!"];
    for (let i = 0; i <= 4; i++) {
      $("#splash-fill").style.width = (i + 1) * 20 + "%";
      $("#splash-text").textContent = msgs[i];
      await sleep(skip ? 80 : 550);
    }
    s.classList.add("hidden");
    login();
  }
  function login() {
    const L = $("#login");
    L.classList.add("wallpaper");
    L.classList.remove("hidden");
    $("#login-hint").innerHTML = `${ico("volume-2")} sound on. trust us.`;
    const box = $("#login-users");
    box.innerHTML = "";
    D.nicknames.forEach((n) => {
      const b = el("button", "login-user", `<div class="avatar">${ico(n.icon)}</div><span>${esc(n.name)}</span>`);
      b.onclick = () => enter(n.name);
      box.appendChild(b);
    });
  }
  function enter(name) {
    OS.user = name;
    $("#login").classList.add("hidden");
    const desk = $("#desktop");
    desk.classList.add("wallpaper");
    desk.classList.remove("hidden");
    $("#mb-user").innerHTML = `${ico("user")} ${esc(name)}`;
    $("#dd-user").textContent = name;
    buildDock();
    buildDesktop();
    OS.confetti(160, true);
    setTimeout(() => OS.notify("cake", `Welcome, ${name}`, `Happy ${D.age}th birthday! Open apps from the dock. Something on the desktop is locked…`, 7000), 700);
    setTimeout(() => OS.notify("message-circle", "Sri Bish", "Good morning beautiful peplaz. Especially the birthday one.", 6000), 4000);
    setTimeout(() => OS.notify("message-circle", "Messages", `You have ${D.friends.length} unread chats from the peplaz`, 6000), 6500);
    setTimeout(() => OS.notify("circle-help", "Tip", "Stuck? Open Help in the menu bar, or type help in Terminal.", 6000), 9000);
    ["pointerdown", "keydown", "pointermove"].forEach((ev) => document.addEventListener(ev, resetIdle, { passive: true }));
    resetIdle();
  }

  window.addEventListener("load", () => {
    clock();
    setInterval(clock, 10000);
    menus();
    const sk = () => (skip = true);
    $("#boot").addEventListener("click", sk);
    document.addEventListener("keydown", sk, { once: true });
    if (/[?&]smoke\b/.test(location.search)) {
      skip = true;
      const s = document.createElement("script");
      s.src = "tests/smoke.js";
      document.body.appendChild(s);
    }
    boot();
  });
})();
