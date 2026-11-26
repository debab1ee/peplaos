/* =========================================================
   Icons: Lucide (https://lucide.dev) + a few custom ones.
   ico("camera") -> HTML string. Lucide <i> tags are swapped
   for SVGs automatically whenever they appear in the page.
   ========================================================= */
(() => {
  const custom = {
    seal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ico-svg">
      <path d="M2.5 18.5c0-5 4-9 9-9h1c1.5 0 2.5-1 2.5-2.5V6a3.5 3.5 0 0 1 7 0v2c0 2-1 3-1 5 0 3.5-2.5 6.5-6.5 6.5H4.5a2 2 0 0 1-2-1z"/>
      <path d="M9 19.5c-.5 1.5-2 2.5-3.5 2.5"/><path d="M14 19.5c.5 1.5 2 2.5 3.5 2.5"/>
      <circle cx="18.5" cy="5.8" r=".6" fill="currentColor"/><path d="M20.5 8.5l2 .5M20.5 9.5l2 1"/></svg>`,
  };

  window.ico = (name, cls = "") =>
    custom[name]
      ? custom[name].replace('class="ico-svg"', `class="ico-svg ${cls}"`)
      : `<i data-lucide="${name}" class="ico-svg ${cls}"></i>`;

  let queued = false;
  const swap = () => {
    queued = false;
    if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 2 } });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(swap); } };
  new MutationObserver((muts) => {
    for (const m of muts) for (const n of m.addedNodes)
      if (n.nodeType === 1 && (n.matches?.("i[data-lucide]") || n.querySelector?.("i[data-lucide]"))) return queue();
  }).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("load", queue);
})();
