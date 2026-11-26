/* =========================================================
   PeplaOS — EDIT THIS FILE to customise everything.
   (images are listed automatically in js/images.js —
    run `node scripts/list-images.js` after adding photos)
   ========================================================= */

window.PEPLA = {
  birthdayBoy: "Punnu",
  author: "Debabideb",   // shown in credits: "bugs khoma korben"
  age: 25,
  cgpa: "9.17",        // IIM Mumbai, as announced in the group chat
  foundedYear: 2019,   // peplaz agency, est.

  // Login screen "user accounts" — all his names. Whichever he picks,
  // the OS calls him that. The rest get sprinkled around randomly.
  nicknames: [
    { name: "Punnu",          icon: "seal" },
    { name: "Souhardya",      icon: "crown" },
    { name: "Sou",            icon: "glasses" },
    { name: "Soda",           icon: "cup-soda" },
    { name: "Srihorir Baap",  icon: "baby" },
    { name: "Pecho Matal",    icon: "beer" },
  ],

  groupName: "peplaz",
  groupAliases: ["ds³", "peplapigs"],
  members: ["punnu", "gunnu", "munnu", "chullu"],

  // ---- Voice notes (files in /audio) -------------------------------
  // Rename the labels to what's actually said in each one.
  sounds: [
    { id: "vm1", file: "audio/vm1.mp3", label: "VM 1",  icon: "mic" },
    { id: "vm2", file: "audio/vm2.mp3", label: "VM 2",  icon: "flame" },
    { id: "vm3", file: "audio/vm3.mp3", label: "VM 3",  icon: "skull" },
    { id: "vm4", file: "audio/vm4.mp3", label: "VM 4",  icon: "megaphone" },
  ],
  // Which voice note plays for system events (use an id from above, or null)
  systemSounds: {
    login: null,          // no sound at startup
    celebrate: "vm1",     // cake candles out / letter opened
    error: "vm2",
    busy:  "vm3",
    trash: "vm4",
  },

  // ---- Messages.app ---------------------------------------------------
  // One thread per friend (color = avatar colour). Each item is text, or { voice: "vmX" } for a
  // voice bubble, or { image: "images/whatever.jpeg" }.
  friends: [
    {
      name: "Sri Bish", color: "#ff9f0a",
      messages: [
        "Tumi aro matlami koro pecho",
        "Tomr haga jeno kokhono pan e na lage আশীর্বাদ korlm",
        "Tomr ghuru ghuru korar jeno sob somoy taka thake",
      ],
    },
    {
      name: "Srihorir Thakuma Ganjeri Gunnu", color: "#30d158",
      messages: [
        "Drinking is injurious to health",
      ],
    },
    {
      name: "Debabiee", color: "#ff375f",
      messages: [
        "bhalo kore kaj kor ar amar dayitto ne",
        "aro 25 bochhor amake call kore fupiye fupiye kaand",
      ],
    },
    {
      name: "peplaz (voice notes)", color: "#5e5ce6", icon: "mic",
      messages: [
        { voice: "vm1" },
        { voice: "vm2" },
        { voice: "vm3" },
        { voice: "vm4" },
      ],
    },
  ],

  // ---- The final letter (unlocks in the Top Secret folder) ------------
  letter: {
    title: "Dear Punnu,",
    body: [
      "If you're reading this, you clicked through an entire fake operating system for us. That's the most effort you've put into anything since your last Succession rewatch.",
      "We roast you because we love you. Mostly the second part. Sometimes the first.",
      "25 years of chaos, seals, fine wine and a 9.17 CGPA, and somehow still humble enough to hang out with us. The peplaz agency has been running since 2019 and you are still our best client. Thank you for being our peplapig.",
      "Happy birthday. Ghoti bekiye debo if you cry.",
    ],
    signoff: "— gunnu, munnu, chullu (peplaz / ds³ / peplapigs)",
  },

  // ---- SealTube ---------------------------------------------------------
  // YouTube video IDs (the part after watch?v=). First one plays first.
  sealVideos: [
    { id: "268CLEqR1b0", title: "The official birthday seal" },
    { id: "7Frz3J25ZRw", title: "Baby seal tries to talk (it's you)" },
    { id: "xwfFwSKs1io", title: "Seal yawns, smiles, sleeps (you after one glass of red)" },
    { id: "sRlbTwmifd4", title: "Seal gets up close and personal" },
  ],

  // ---- Bhoboshyot.exe (fortune teller) ----------------------------------
  prophecy: "tumi onek boro rendi hobe baba",

  // ---- Brainrot.app trading cards ---------------------------------------
  cards: [
    { name: "Punnurino Sealini", art: ["seal", "beer"], rarity: "BIRTHDAY LEGENDARY", who: "punnu",
      stats: { Aura: "9000", CGPA: "9.17", "Wine palate": "Sommelier", Rizz: "??" },
      move: "Pune Palta Punnu — flips the whole room. 100% crit." },
    { name: "Tung Tung Tung Gunnu", art: ["tree-pine", "hammer"], rarity: "RARE", who: "gunnu",
      stats: { Aura: "6900", Bullying: "MAX", Sleep: "0", Rizz: "mid" },
      move: "Ghoti Bekai — bends the ghoti. Nobody asked." },
    { name: "Munnuccino Assassino", art: ["coffee", "swords"], rarity: "EPIC", who: "munnu",
      stats: { Aura: "7200", Chaos: "99", "Nonta/Meetha": "both", Rizz: "low" },
      move: "Nonta Meetha Loop — confuses enemy forever." },
    { name: "Chullulero Chullala", art: ["fish", "zap"], rarity: "RARE", who: "chullu",
      stats: { Aura: "6500", Roasts: "∞", Punctuality: "0", Rizz: "crine" },
      move: "Jhamtam — is busy, otherwise would jhamtam you." },
    { name: "Peplapig Supremo", art: ["piggy-bank", "crown"], rarity: "MYTHIC (ds³)", who: "peplaz agency, est. 2019",
      stats: { Founded: "2019", Members: "4", Brain: "1 (shared)", Love: "too much" },
      move: "Good Morning Beautiful Peplaz — daily, without fail." },
  ],

  // How many different apps he must open before Top Secret unlocks
  appsToUnlock: 6,
};
