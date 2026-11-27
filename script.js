/* =========================================================================
   SCRIPT
   Everything the site does lives in this one file.

   Table of contents
     1. SETTINGS you may want to change    <-- password, date, options
     2. TEXT: locked messages, wrong-password jokes, whispers
     3. TEXT: the 36 greetings (28 states + 8 union territories)
     4. Small helpers (safe storage, random pick, ...)
     5. Landing page: star field, glow, fireflies, orb
     6. OPEN button + date check (IST)
     7. Password window
     8. Unlock transition
     9. Envelope + hero
    10. Confetti
    11. Scratch cards
    12. Start-up
   ========================================================================= */
"use strict";


/* =========================================================================
   1. SETTINGS  (the only part you normally need to touch)
   ========================================================================= */
const CONFIG = {

  /* ---- UNLOCK DATE ------------------------------------------------------
     29 November 2026, 12:00 AM in India (IST = UTC+05:30).
     The "+05:30" at the end pins it to Indian time, so it does not matter
     which country or time zone the visitor is in. Do not remove it. */
  UNLOCK_AT: "2026-11-29T00:00:00+05:30",

  /* ---- PASSWORD ---------------------------------------------------------
     CHANGE THE PASSWORD HERE (one place only).
     Capital letters and extra spaces are ignored, so "Nikki29" works too.

     Reminder: this is a fun guessing game, NOT real security. Anyone who
     opens the browser's "View source" can read this file and see the word. */
  PASSWORD: "@foryounikki",

  /* ---- "OPENED" NOTIFICATION ---------------------------------------------
     When the surprise opens (by date OR by password) a short push message is
     sent to YOU through the free ntfy.sh service.
     Setup: install the free "ntfy" app, tap "+" and subscribe to the topic
     name below. Nothing else about her is sent, only the words
     "opened", how it was opened and the time.
     To turn this off, make it empty:  NOTIFY_TOPIC: "",
     (This name is like a password for your notifications. Keep it private.) */
  NOTIFY_TOPIC: "door-593abd2b31c2a5e9",

  /* ---- LOOK OF THE FIRST PAGE ------------------------------------------
     "space" = blue/violet night sky with a glowing OPEN orb
     "mind"  = psychology look: a cartoon brain with eyes that follow you,
     floating neurons and nerves with travelling signals.
     Change just this one word and save. */
  LANDING_THEME: "mind",

  /* ---- SCRATCH CARDS ----------------------------------------------------
     true  = the final message appears only after all 36 cards are revealed.
     false = the final message is available right away. */
  REQUIRE_ALL_SCRATCHED: true,

  /* How much of a card must be scratched before it opens by itself (0.5 = half) */
  SCRATCH_REVEAL_AT: 0.5,

  /* Prefix for the browser memory keys (leave as is) */
  STORAGE_PREFIX: "hd1_",
};


/* =========================================================================
   2. TEXT
   ========================================================================= */

/* Messages for the OPEN button before the unlock date, in this exact order.
   They repeat from the top after the fifth click. */
const LOCKED_MESSAGES = [
  "Bacha!!! Abhi open nahi hoga, thode time mein koshish kariyo.",
  "Abhi nahi hoga open",
  "Kitni bhi koshish kar le, abhi nahi khulega!",
  "Arey nahi hoga open, samajh nahi aata tujhe?",
  "Abki baar gaali de dunga, try kiya toh open karne ka!",
];

/* Jokes for a wrong password (one is picked at random) */
const WRONG_PASSWORD_MESSAGES = [
  "Galat! Itni aasani se khul jaata toh darwaza kyun lagate? 😏",
  "Close tha... jhooth bol raha hoon, bilkul close nahi tha. 😂",
  "Ye password tune guess kiya ya neend mein type kiya?",
  "Confident galti! Respect. Par khulega nahi. 👏",
  "Google bhi nahi bata payega, dimaag lagao.",
  "Dobara try kar. Chaabi tere paas hi hai, bas yaad nahi aa rahi.",
  "Access denied. Darwaze ne aankh maar ke mana kar diya. 😉",
  "Hint maangne ka plan hai? Wo bhi nahi milega!",
];

/* Little lines shown above the OPEN button. Nothing about the real secret! */
const WHISPERS = [
  "Shhh. Yahan koi nahi hai.",
  "Kuch toh hai... ya shayad nahi.",
  "Itna dhyaan se kya dekh rahi hai?",
  "Darwaza hai. Chaabi nahi hai.",
  "Sab shaant hai. Suspicious.",
  "Taare bhi soch rahe hain, ye bandi kaun hai.",
  "Button hi toh hai, dabane mein kya jaata hai?",
];

/* Lines shown when someone taps one of the tiny wandering lights */
const FIREFLY_LINES = [
  "Ye wala button nahi hai. 😜",
  "Pakad liya? Kuch nahi mila na?",
  "Garam hai ye toh, haath mat laga!",
  "Dhundhte reh, dhundhte reh.",
  "Ek aur try? Mazaa aa raha hai?",
];


/* Text for the psychology ("mind") look of the first page */
const MIND_TEXT = {
  tagLeft: "// neuro lab",
  tagRight: "subject: unknown",
  kicker: "// free association",
  title: "Pehla shabd kaunsa aaya?",
  whispers: [
    "Dimaag tujhe dekh raha hai. Tu bhi dekh.",
    "Itna overthink mat kar. Button hi toh dabana hai.",
    "Neurons soch rahe hain: ye kaun hai?",
    "Aankhein khuli rakh. Dimaag bhi.",
    "Pupils dilate ho rahe hain. Interesting.",
    "Sab normal hai. Shayad.",
    "Is dimaag mein kuch chal raha hai... shayad tu.",
    "Tera dimaag, tera darwaza.",
  ],
  fireflies: [
    "Ek neuron fire hua. Pakad liya tune!",
    "Synapse toot gaya. Ab kuch yaad nahi.",
    "Dopamine mil gaya? Ek aur try?",
    "Brain ne blink kiya. Tune dekha?",
    "Ye sirf ek vichaar tha. Ud gaya.",
  ],
};

/* The lines actually in use (set in applyLandingTheme) */
let activeWhispers = WHISPERS;
let activeFireflies = FIREFLY_LINES;


/* =========================================================================
   3. THE 36 GREETINGS
   28 states + 8 union territories. All written in English (Roman) letters.
   Each item:  name = region, kind = State / Union Territory,
               lang = language, text = greeting.
   To fix a spelling later, just edit the text between the quotes.
   ========================================================================= */
const REGIONS = [
  /* ---------------- 28 STATES (alphabetical) ---------------- */
  { name: "Andhra Pradesh",    kind: "State", lang: "Telugu",       text: "Puttinaroju subhakankshalu" },
  { name: "Arunachal Pradesh", kind: "State", lang: "Hindi",        text: "Janamdin ki hardik shubhkamnayein" },
  { name: "Assam",             kind: "State", lang: "Assamese",     text: "Janmadinor shubhechha" },
  { name: "Bihar",             kind: "State", lang: "Maithili",     text: "Ahank janmadinak bahut bahut shubhkamna" },
  { name: "Chhattisgarh",      kind: "State", lang: "Chhattisgarhi",text: "Tor janamdin ke bahut bahut badhai" },
  { name: "Goa",               kind: "State", lang: "Konkani",      text: "Vaddhdivsachyo hardik shubhechha" },
  { name: "Gujarat",           kind: "State", lang: "Gujarati",     text: "Tane janmadivas ni khub khub shubhechchhao" },
  { name: "Haryana",           kind: "State", lang: "Haryanvi",     text: "Tanne janamdin ki bahut bahut badhai" },
  { name: "Himachal Pradesh",  kind: "State", lang: "Hindi",        text: "Janamdin mubarak ho, hamesha muskurati raho" },
  { name: "Jharkhand",         kind: "State", lang: "Hindi",        text: "Aapko janamdin ki dher saari badhai" },
  { name: "Karnataka",         kind: "State", lang: "Kannada",      text: "Huttuhabbada shubhashayagalu" },
  { name: "Kerala",            kind: "State", lang: "Malayalam",    text: "Ninakku janmadina ashamsakal" },
  { name: "Madhya Pradesh",    kind: "State", lang: "Hindi",        text: "Janamdin ki bahut bahut badhai ho" },
  { name: "Maharashtra",       kind: "State", lang: "Marathi",      text: "Tula vadhdivsachya khup khup shubhechha" },
  { name: "Manipur",           kind: "State", lang: "English",      text: "Happy Birthday Nikki – with love from Manipur ❤️" },
  { name: "Meghalaya",         kind: "State", lang: "English",      text: "Happy Birthday Nikki – from the Abode of Clouds ❤️" },
  { name: "Mizoram",           kind: "State", lang: "English",      text: "Happy Birthday Nikki – from the green hills of Mizoram ❤️" },
  { name: "Nagaland",          kind: "State", lang: "English",      text: "Happy Birthday Nikki – from the Land of Festivals ❤️" },
  { name: "Odisha",            kind: "State", lang: "Odia",         text: "Janmadinara hardika shubhechha" },
  { name: "Punjab",            kind: "State", lang: "Punjabi",      text: "Tenu janamdin di lakh lakh vadhaiyan" },
  { name: "Rajasthan",         kind: "State", lang: "Rajasthani",   text: "Thane janamdin ri ghani ghani badhai" },
  { name: "Sikkim",            kind: "State", lang: "Nepali",       text: "Janmadin ko hardik shubhakamana" },
  { name: "Tamil Nadu",        kind: "State", lang: "Tamil",        text: "Iniya pirandhanaal nalvaazhthukkal" },
  { name: "Telangana",         kind: "State", lang: "Telugu",       text: "Janmadina subhakankshalu" },
  { name: "Tripura",           kind: "State", lang: "Bengali",      text: "Shubho jonmodin, onek bhalobasha o shubhechha" },
  { name: "Uttar Pradesh",     kind: "State", lang: "Hindi",        text: "Janamdin ki dher saari shubhkamnayein" },
  { name: "Uttarakhand",       kind: "State", lang: "Hindi",        text: "Janamdin ki hardik badhai aur dher sara pyaar" },
  { name: "West Bengal",       kind: "State", lang: "Bengali",      text: "Tomake jonmodiner onek onek shubhechha" },

  /* ---------------- 8 UNION TERRITORIES (alphabetical) ---------------- */
  { name: "Andaman and Nicobar Islands", kind: "Union Territory", lang: "Hindi",    text: "Janamdin mubarak ho, samundar jaisa gehra pyaar" },
  { name: "Chandigarh",        kind: "Union Territory", lang: "Punjabi",  text: "Janam din diyan bahut bahut mubarakan" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", kind: "Union Territory", lang: "Gujarati", text: "Janmadivas ni hardik shubhkamnao" },
  { name: "Delhi",             kind: "Union Territory", lang: "English",  text: "Happy Birthday Nikki – From Delhi ❤️" },
  { name: "Jammu and Kashmir", kind: "Union Territory", lang: "Urdu",     text: "Saalgirah mubarak ho" },
  { name: "Ladakh",            kind: "Union Territory", lang: "Ladakhi greeting + English", text: "Julley, Nikki! Happy Birthday from the high Himalayas" },
  { name: "Lakshadweep",       kind: "Union Territory", lang: "Malayalam",text: "Pirannal ashamsakal" },
  { name: "Puducherry",        kind: "Union Territory", lang: "French",   text: "Joyeux anniversaire, Nikki" },
];


/* =========================================================================
   4. SMALL HELPERS
   ========================================================================= */
const $ = (id) => document.getElementById(id);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (a, b) => a + Math.random() * (b - a);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Safe memory: uses localStorage, and quietly falls back to a plain object
   if the browser blocks it (private mode, some in-app browsers). */
const store = (() => {
  const fallback = {};
  return {
    get(key, def) {
      const k = CONFIG.STORAGE_PREFIX + key;
      try {
        const v = window.localStorage.getItem(k);
        if (v !== null) return JSON.parse(v);
      } catch (e) { /* ignore */ }
      return k in fallback ? fallback[k] : def;
    },
    set(key, value) {
      const k = CONFIG.STORAGE_PREFIX + key;
      fallback[k] = value;
      try { window.localStorage.setItem(k, JSON.stringify(value)); } catch (e) { /* ignore */ }
    },
  };
})();

/* Scratch progress is kept only while this tab stays open (so an accidental
   refresh does not lose it), and starts fresh in every new visit. */
const tabStore = {
  get(key, def) {
    try { const v = window.sessionStorage.getItem(CONFIG.STORAGE_PREFIX + key); if (v !== null) return JSON.parse(v); } catch (e) { /* ignore */ }
    return def;
  },
  set(key, value) {
    try { window.sessionStorage.setItem(CONFIG.STORAGE_PREFIX + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  },
};

/* The unlock moment as an absolute point in time (independent of time zones) */
const UNLOCK_TIME = Date.parse(CONFIG.UNLOCK_AT);

/* ---- "OPENED" NOTIFICATION (see CONFIG.NOTIFY_TOPIC) ---------------------
   Sends one small message to ntfy.sh. It never blocks the surprise: if the
   internet is slow or ntfy.sh is down, nothing happens and nothing shows. */
function notifyOpened(how) {
  const topic = (CONFIG.NOTIFY_TOPIC || "").trim();
  if (!topic) return;
  try {
    const when = new Date(Date.now() + (clockOffset || 0)).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
    });
    fetch("https://ntfy.sh/" + encodeURIComponent(topic) + "?title=" + encodeURIComponent("Opened by her") + "&tags=tada", {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      body: "Nikki ne surprise khol diya (" + how + "). " + when + " IST",
    }).catch(() => {});
  } catch (e) { /* ignore */ }
}

/* ---- TRUSTED CLOCK ------------------------------------------------------
   The visitor's phone clock can be changed, so we do not trust it alone.
   GitHub tells us the real time in the "Date" header of every reply. We ask
   for it (a tiny request for this same page) and work out how far the phone
   clock is off. If that request fails (no internet, opened as a plain file,
   etc.) we simply fall back to the phone clock, so the site never gets stuck. */
let clockOffset = null;      /* real time minus phone time, in ms (null = unknown) */
let clockRequest = null;     /* the request that is running right now, if any */

function syncClock() {
  if (clockRequest) return clockRequest;
  clockRequest = new Promise((resolve) => {
    let finished = false;
    const done = (ok) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      clockRequest = null;
      resolve(ok);
    };
    const timer = setTimeout(() => done(false), 4000);
    const sent = Date.now();
    fetch(window.location.pathname + "?clock=" + sent, { method: "HEAD", cache: "no-store" })
      .then((res) => {
        const server = Date.parse(res.headers.get("Date") || "");
        if (isNaN(server)) { done(false); return; }
        const age = (Number(res.headers.get("Age")) || 0) * 1000;   /* time spent in a cache */
        const received = Date.now();
        /* the Date header was written about halfway through the round trip */
        clockOffset = server + age + (received - sent) / 2 - received;
        done(true);
      })
      .catch(() => done(false));
  });
  return clockRequest;
}

/* "Now", corrected with the server's time when we have it */
function nowMs() {
  return Date.now() + (clockOffset || 0);
}

/* True once the (corrected) clock has passed 29 Nov 2026, 12:00 AM IST */
function isPastUnlockTime() {
  return nowMs() >= UNLOCK_TIME;
}

/* OPEN works only after the date. (A password entry never changes this,
   so testing the password does not make OPEN open early.) */
function isUnlocked() {
  return isPastUnlockTime();
}

/* DOM references */
const landing = $("landing");
const openBtn = $("openBtn");
const pwBtn = $("pwBtn");
const toastEl = $("toast");
const whisperEl = $("whisper");


/* =========================================================================
   5. LANDING PAGE: STAR FIELD, GLOW, FIREFLIES, ORB
   ========================================================================= */

/* ---- 5a. Background canvas ----
   "space": drifting stars, faint lines, tap sparks.
   "mind" : a nervous system. Nerves branch out from under the brain and
            little signals travel along them. */
const sky = (() => {
  const canvas = $("sky");
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1;
  let stars = [];
  let sparks = [];
  let pulses = [];
  let nerves = [];        /* mind: every nerve piece */
  let nervePaths = [];    /* mind: root-to-tip chains the signals follow */
  let raf = 0;
  let running = false;
  let lastPulse = 0;
  let mode = "space";
  let colA = "139,107,255", colB = "88,225,255", colS = "220,224,255";
  const pointer = { x: -999, y: -999, active: false };

  /* read the current theme colours from the CSS variables */
  function readColors() {
    const cs = getComputedStyle(document.body);
    colA = cs.getPropertyValue("--a").trim() || colA;
    colB = cs.getPropertyValue("--b").trim() || colB;
    colS = cs.getPropertyValue("--star").trim() || colS;
  }
  function setMode(m) { mode = m; readColors(); if (w) resize(); }

  /* mind: grow a branching nerve tree that starts under the brain */
  function buildNerves() {
    nerves = []; nervePaths = [];
    const cr = canvas.getBoundingClientRect();
    const ob = openBtn.getBoundingClientRect();
    const rx = ob.left + ob.width / 2 - cr.left;
    const ry = ob.bottom - cr.top - 4;
    const scale = w < 500 ? 0.85 : 1;

    function grow(x, y, ang, len, depth, path) {
      if (nerves.length > 300) return;
      const a2 = ang + rand(-0.3, 0.3);
      const x2 = x + Math.cos(a2) * len, y2 = y + Math.sin(a2) * len;
      if (x2 < -10 || x2 > w + 10 || y2 > h + 10 || y2 < 30) { if (path.length) nervePaths.push(path); return; }
      const side = rand(-9, 9);
      const seg = { x1: x, y1: y, cx: (x + x2) / 2 - Math.sin(a2) * side, cy: (y + y2) / 2 + Math.cos(a2) * side, x2, y2, depth, len };
      nerves.push(seg);
      const p = path.concat([seg]);
      if (depth >= 5 || len < 16) { nervePaths.push(p); return; }
      const kids = Math.random() < 0.75 ? 2 : 3;
      for (let k = 0; k < kids; k++) {
        grow(x2, y2, a2 + (k - (kids - 1) / 2) * rand(0.5, 0.9), len * rand(0.72, 0.85), depth + 1, p);
      }
    }
    [-1.25, -0.75, -0.28, 0.28, 0.75, 1.25].forEach((off) => {
      grow(rx, ry, Math.PI / 2 + off, rand(55, 80) * scale, 0, []);
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pulses = [];
    const mind = mode === "mind";
    /* fewer points on small screens keeps phones smooth */
    const count = mind
      ? Math.max(14, Math.min(34, Math.round((w * h) / 30000)))
      : Math.max(34, Math.min(88, Math.round((w * h) / 15000)));
    stars = Array.from({ length: count }, () => ({
      x: rand(0, w), y: rand(0, h),
      r: mind ? rand(0.8, 1.9) : rand(0.6, 1.7),
      z: rand(0.3, 1),           /* depth: deeper points move less */
      tw: rand(0, Math.PI * 2),  /* twinkle phase */
      vx: mind ? rand(-0.1, 0.1) : 0,
      vy: mind ? rand(-0.1, 0.1) : rand(0.02, 0.1),
    }));
    if (mind) buildNerves();
    if (!running) draw(0);
  }

  function burst(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(0.6, 3);
      sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, hue: Math.random() < 0.5 ? colB : colA });
    }
    if (sparks.length > 140) sparks.splice(0, sparks.length - 140);
    if (!running && !reducedMotion) start();
  }

  /* the "space" background */
  function drawSpace(t, px, py) {
    for (const s of stars) {
      s.x += s.vx; s.y += s.vy;
      if (s.y > h + 4) { s.y = -4; s.x = rand(0, w); }
      s.dx = s.x - px * 0.02 * s.z;
      s.dy = s.y - py * 0.02 * s.z;
    }
    ctx.lineWidth = 0.6;
    for (let i = 0; i < stars.length; i++) {
      const a = stars[i];
      for (let j = i + 1; j < stars.length; j++) {
        const b = stars[j];
        const dx = a.dx - b.dx, dy = a.dy - b.dy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9000) {
          ctx.strokeStyle = "rgba(" + colA + "," + (0.16 * (1 - d2 / 9000)).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(a.dx, a.dy); ctx.lineTo(b.dx, b.dy); ctx.stroke();
        }
      }
      /* stars near the finger / mouse connect to it */
      if (pointer.active) {
        const dx = a.dx - pointer.x, dy = a.dy - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22000) {
          ctx.strokeStyle = "rgba(" + colB + "," + (0.5 * (1 - d2 / 22000)).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(a.dx, a.dy); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
        }
      }
    }
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(t / 900 + s.tw);
      ctx.fillStyle = "rgba(" + colS + "," + (tw * (0.4 + 0.6 * s.z)).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(s.dx, s.dy, s.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* the "mind" background: nerves + travelling signals + a little dust */
  function drawMind(t, px, py) {
    ctx.lineCap = "round";
    for (const n of nerves) {
      const a = Math.max(0.12, 0.5 - n.depth * 0.06);
      ctx.strokeStyle = "rgba(" + colA + "," + a.toFixed(2) + ")";
      ctx.lineWidth = Math.max(0.9, 3.1 - n.depth * 0.45);
      ctx.beginPath(); ctx.moveTo(n.x1, n.y1); ctx.quadraticCurveTo(n.cx, n.cy, n.x2, n.y2); ctx.stroke();
      if (n.depth >= 5) {
        ctx.fillStyle = "rgba(" + colA + ",0.6)";
        ctx.beginPath(); ctx.arc(n.x2, n.y2, 1.7, 0, Math.PI * 2); ctx.fill();
      }
    }

    /* signals run along the nerves, piece by piece */
    if (!reducedMotion) {
      if (t - lastPulse > 420 && pulses.length < 8 && nervePaths.length) {
        lastPulse = t;
        pulses.push({ path: pick(nervePaths), k: 0, p: 0 });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const q = pulses[i];
        let seg = q.path[q.k];
        q.p += 3.4 / seg.len;
        if (q.p >= 1) {
          q.k++; q.p = 0;
          if (q.k >= q.path.length) { pulses.splice(i, 1); continue; }
          seg = q.path[q.k];
        }
        const u = q.p, v = 1 - u;
        const x = v * v * seg.x1 + 2 * v * u * seg.cx + u * u * seg.x2;
        const y = v * v * seg.y1 + 2 * v * u * seg.cy + u * u * seg.y2;
        ctx.fillStyle = "rgba(" + colB + ",0.24)";
        ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(" + colB + ",0.95)";
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
      }
    }

    for (const s of stars) {
      s.x += s.vx; s.y += s.vy;
      if (s.x < -6) s.x = w + 6; else if (s.x > w + 6) s.x = -6;
      if (s.y < -6) s.y = h + 6; else if (s.y > h + 6) s.y = -6;
      const tw = 0.5 + 0.5 * Math.sin(t / 900 + s.tw);
      ctx.fillStyle = "rgba(" + colS + "," + (tw * 0.55).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(s.x - px * 0.02 * s.z, s.y - py * 0.02 * s.z, s.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const px = pointer.active ? (pointer.x - w / 2) : 0;
    const py = pointer.active ? (pointer.y - h / 2) : 0;
    if (mode === "mind") drawMind(t, px, py); else drawSpace(t, px, py);

    /* sparks from taps */
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; p.life -= 0.02;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.fillStyle = "rgba(" + p.hue + "," + p.life.toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * p.life + 0.4, 0, Math.PI * 2); ctx.fill();
    }
  }

  function loop(t) {
    if (!running) return;
    draw(t);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function init() {
    readColors();
    resize();
    window.addEventListener("resize", resize);
    /* the layout can still shift a little after fonts load, so re-aim the nerves */
    setTimeout(() => { if (mode === "mind" && w) buildNerves(); }, 600);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else if (landing && !landing.hidden && !reducedMotion) start();
    });
    if (!reducedMotion) start();
  }

  return { init, stop, burst, pointer, setMode };
})();


/* ---- 5a-2. "mind" look: cartoon brain, neurons and watching eyes ---- */

/* The brain that is also the OPEN button.
   One half is written once and used twice (the second copy is mirrored). */
const BRAIN_HALF =
  '<path fill="url(#brGrad)" stroke="#c24f74" stroke-width="3" stroke-linejoin="round" d="M108 30C100 16 80 12 68 22C54 14 34 22 34 40C18 42 8 60 18 76C6 88 12 110 30 114C28 130 44 146 62 140C70 156 96 158 106 142C108 138 108 134 108 130Z"/>' +
  ["M52 44C64 40 72 50 66 60", "M30 62C42 56 54 64 48 76", "M24 94C36 90 46 98 40 108",
   "M52 112C62 104 74 110 70 122", "M84 38C92 34 100 40 98 50", "M82 130C90 122 100 126 98 136"]
    .map((d) => '<path fill="none" stroke="#df7b9b" stroke-width="3.2" stroke-linecap="round" d="' + d + '"/>').join("");

const BRAIN_SVG = '<svg class="brain" viewBox="0 0 220 190" aria-hidden="true" focusable="false">' +
  '<defs><radialGradient id="brGrad" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="#ffc9d7"/><stop offset="1" stop-color="#f3809f"/></radialGradient></defs>' +
  '<g>' + BRAIN_HALF + '</g>' +
  '<g transform="translate(220 0) scale(-1 1)">' + BRAIN_HALF + '</g>' +
  '<path class="brow" d="M62 70Q78 60 98 64"/>' +
  '<path class="brow" d="M122 64Q142 60 158 70"/>' +
  '<g class="eye" data-max="8"><ellipse class="eyeball" cx="82" cy="90" rx="19" ry="21"/><g class="pupil"><circle class="pupil-dot" cx="82" cy="90" r="9"/><circle class="shine" cx="78.5" cy="86" r="3"/></g></g>' +
  '<g class="eye" data-max="8"><ellipse class="eyeball" cx="138" cy="90" rx="19" ry="21"/><g class="pupil"><circle class="pupil-dot" cx="138" cy="90" r="9"/><circle class="shine" cx="134.5" cy="86" r="3"/></g></g>' +
  '<path class="smile" d="M98 124Q110 134 122 124"/>' +
  '<ellipse class="blush" cx="58" cy="114" rx="9" ry="5.5"/>' +
  '<ellipse class="blush" cx="162" cy="114" rx="9" ry="5.5"/>' +
  '</svg>';

/* A neuron: cell body, branching dendrites, a long insulated axon and a signal */
function neuronSVG(cls) {
  const axon = "M58 60C90 60 110 52 140 60C158 65 170 60 186 60";
  return '<svg class="deco-neuron ' + cls + '" viewBox="0 0 200 120" aria-hidden="true" focusable="false">' +
    '<g class="dend">' +
      '<path d="M40 54C28 44 22 36 12 34"/><path d="M26 42C22 30 24 24 20 16"/>' +
      '<path d="M38 66C28 74 20 84 10 88"/><path d="M24 80C26 92 22 98 24 106"/>' +
      '<path d="M44 50C42 38 40 28 42 14"/><path d="M44 70C44 82 42 94 46 108"/>' +
      '<path d="M186 60C192 52 196 46 198 38"/><path d="M186 60L199 60"/><path d="M186 60C192 68 196 74 198 82"/>' +
    '</g>' +
    '<path class="myelin" d="' + axon + '"/>' +
    '<path class="dend" d="' + axon + '"/>' +
    '<circle class="soma" cx="48" cy="60" r="11"/><circle class="nucleus" cx="48" cy="60" r="4"/>' +
    '<circle class="bulb" cx="198" cy="38" r="2.6"/><circle class="bulb" cx="199" cy="60" r="2.6"/><circle class="bulb" cx="198" cy="82" r="2.6"/>' +
    '<circle class="halo" r="8"><animateMotion dur="2.8s" repeatCount="indefinite" path="' + axon + '"/></circle>' +
    '<circle class="pulse" r="3.4"><animateMotion dur="2.8s" repeatCount="indefinite" path="' + axon + '"/></circle>' +
  '</svg>';
}

/* A pair of eyes peeking out of the dark */
function peekSVG(cls) {
  const eye = (cx) => '<g class="eye" data-max="5"><ellipse class="eyeball" cx="' + cx + '" cy="16" rx="14" ry="13"/>' +
    '<g class="pupil"><circle class="pupil-dot" cx="' + cx + '" cy="16" r="6.5"/><circle class="shine" cx="' + (cx - 2.5) + '" cy="13" r="2"/></g></g>';
  return '<svg class="peek ' + cls + '" viewBox="0 0 72 32" aria-hidden="true" focusable="false">' + eye(18) + eye(54) + '</svg>';
}

/* Every eye looks at the finger / mouse. When nobody touches the screen
   for a while, they wander around by themselves. */
const eyes = (() => {
  let timer = 0, lastInput = 0;
  function look(x, y, auto) {
    if (!auto) lastInput = Date.now();
    document.querySelectorAll(".eye").forEach((eye) => {
      const pupil = eye.querySelector(".pupil");
      if (!pupil) return;
      const r = eye.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const max = Number(eye.dataset.max) || 6;
      const k = Math.min(1, dist / 160);
      pupil.style.transform = "translate(" + (dx / dist * max * k).toFixed(2) + "px," + (dy / dist * max * k).toFixed(2) + "px)";
    });
  }
  function wander() {
    if (document.hidden || Date.now() - lastInput < 2500) return;
    const a = rand(0, Math.PI * 2);
    look(window.innerWidth / 2 + Math.cos(a) * 320, window.innerHeight / 2 + Math.sin(a) * 320, true);
  }
  function start() { if (!timer && !reducedMotion) timer = setInterval(wander, 1900); }
  function stop() { clearInterval(timer); timer = 0; }
  return { look, start, stop };
})();

/* The brain gets dizzy when OPEN is tried too early */
function brainReact() {
  const b = document.querySelector(".brain");
  if (!b) return;
  b.classList.remove("dizzy");
  b.getBoundingClientRect();
  b.classList.add("dizzy");
  setTimeout(() => b.classList.remove("dizzy"), 950);
}

/* Put the brain, neurons and eyes on the page (mind look only) */
function buildMindArt() {
  document.querySelector(".orb-core").insertAdjacentHTML("afterbegin", BRAIN_SVG);
  const holder = $("shapes");
  holder.insertAdjacentHTML("afterbegin",
    neuronSVG("n1") + neuronSVG("n2") + neuronSVG("n3") + peekSVG("p1") + peekSVG("p2") + peekSVG("p3"));
}


/* ---- 5a-3. Pick the look of the first page (CONFIG.LANDING_THEME) ---- */
let landingTheme = "space";
function applyLandingTheme() {
  landingTheme = CONFIG.LANDING_THEME === "mind" ? "mind" : "space";
  document.body.dataset.landing = landingTheme;
  if (landingTheme === "mind") {
    activeWhispers = MIND_TEXT.whispers;
    activeFireflies = MIND_TEXT.fireflies;
    $("tagLeft").textContent = MIND_TEXT.tagLeft;
    $("tagRight").textContent = MIND_TEXT.tagRight;
    $("pwKicker").textContent = MIND_TEXT.kicker;
    $("pwTitle").textContent = MIND_TEXT.title;
    whisperEl.textContent = activeWhispers[0];
    buildMindArt();
  }
  sky.setMode(landingTheme);
}


/* ---- 5b. Glow that follows the pointer, tap sparks, magnetic orb ---- */
function initLandingPointer() {
  const glow = $("cursorGlow");
  let gx = 0, gy = 0, pending = false;

  function moveGlow() {
    pending = false;
    glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
  }

  landing.addEventListener("pointermove", (e) => {
    sky.pointer.x = e.clientX;
    sky.pointer.y = e.clientY;
    sky.pointer.active = true;
    gx = e.clientX; gy = e.clientY;
    if (landingTheme === "mind") eyes.look(e.clientX, e.clientY);
    glow.classList.add("on");
    if (!pending) { pending = true; requestAnimationFrame(moveGlow); }
  });
  landing.addEventListener("pointerleave", () => {
    sky.pointer.active = false;
    glow.classList.remove("on");
  });

  /* tap on empty space -> little sparks + maybe a new whisper */
  landing.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, input, form, .modal")) return;
    sky.burst(e.clientX, e.clientY, 14);
    if (landingTheme === "mind") eyes.look(e.clientX, e.clientY);
    if (Math.random() < 0.4) nextWhisper();
  });

  /* magnetic orb (mouse only) */
  openBtn.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = openBtn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    openBtn.style.setProperty("--tx", (dx * 16).toFixed(1) + "px");
    openBtn.style.setProperty("--ty", (dy * 16).toFixed(1) + "px");
  });
  openBtn.addEventListener("pointerleave", () => {
    openBtn.style.setProperty("--tx", "0px");
    openBtn.style.setProperty("--ty", "0px");
  });
}


/* ---- 5c. Rotating whispers ---- */
let whisperIndex = 0;
function nextWhisper(text) {
  whisperEl.classList.add("swap");
  setTimeout(() => {
    if (text) {
      whisperEl.textContent = text;
    } else {
      /* pick a different line than the current one */
      let i;
      do { i = Math.floor(Math.random() * activeWhispers.length); } while (i === whisperIndex && activeWhispers.length > 1);
      whisperIndex = i;
      whisperEl.textContent = activeWhispers[i];
    }
    whisperEl.classList.remove("swap");
  }, 380);
}
let whisperTimer = 0;
function startWhispers() {
  whisperTimer = setInterval(() => { if (!document.hidden) nextWhisper(); }, 7500);
}


/* ---- 5d. Tiny wandering lights ---- */
function createFireflies() {
  const holder = $("shapes");
  for (let i = 0; i < 4; i++) {
    const f = document.createElement("button");
    f.type = "button";
    f.className = "firefly";
    f.tabIndex = -1;
    f.setAttribute("aria-hidden", "true");
    f.style.left = rand(10, 90).toFixed(1) + "%";
    f.style.top = rand(14, 78).toFixed(1) + "%";
    f.style.animationDelay = (-rand(0, 10)).toFixed(1) + "s";
    f.style.pointerEvents = "auto";
    f.addEventListener("click", () => {
      const r = f.getBoundingClientRect();
      sky.burst(r.left + r.width / 2, r.top + r.height / 2, 26);
      nextWhisper(pick(activeFireflies));
      /* the light hops somewhere else */
      f.style.left = rand(10, 90).toFixed(1) + "%";
      f.style.top = rand(14, 78).toFixed(1) + "%";
    });
    holder.appendChild(f);
  }
}


/* =========================================================================
   6. OPEN BUTTON + DATE CHECK
   ========================================================================= */
let toastTimer = 0;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("show");
  void toastEl.offsetWidth;            /* restart the animation */
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3800);
}

function shakeOrb() {
  openBtn.classList.remove("nope");
  void openBtn.offsetWidth;
  openBtn.classList.add("nope");
}

/* The click counter is saved in the browser, so a refresh does not reset it */
async function onOpenClick() {
  /* Ask for the real time on every try, so changing the phone clock
     after the page has loaded does not help either. */
  await syncClock();
  if (isUnlocked()) {
    startBirthday(openBtn);
    return;
  }
  const count = store.get("clicks", 0) + 1;
  store.set("clicks", count);

  const message = LOCKED_MESSAGES[(count - 1) % LOCKED_MESSAGES.length];
  showToast(message);
  shakeOrb();
  const r = openBtn.getBoundingClientRect();
  sky.burst(r.left + r.width / 2, r.top + r.height / 2, 18);
  if (landingTheme === "mind") brainReact();     /* the brain gets dizzy */
}


/* =========================================================================
   7. PASSWORD WINDOW
   ========================================================================= */
const pwModal = $("pwModal");
const pwForm = $("pwForm");
const pwInput = $("pwInput");
const pwError = $("pwError");
const pwToggle = $("pwToggle");
let lastWrong = -1;

function openPasswordWindow() {
  pwModal.hidden = false;
  pwError.textContent = "";
  pwInput.value = "";
  setTimeout(() => pwInput.focus(), 60);
}
function closePasswordWindow() {
  pwModal.hidden = true;
  pwBtn.focus({ preventScroll: true });
}

function showPasswordError(text) {
  pwError.textContent = text;
  pwError.classList.remove("pop");
  void pwError.offsetWidth;
  pwError.classList.add("pop");
  const panel = pwForm;
  panel.classList.remove("shake");
  void panel.offsetWidth;
  panel.classList.add("shake");
}

function onPasswordSubmit(e) {
  e.preventDefault();
  const typed = pwInput.value.trim().toLowerCase();
  if (!typed) {
    showPasswordError("Kuch toh type kar, khaali kya bhej raha hai? 😅");
    return;
  }
  if (typed === CONFIG.PASSWORD.trim().toLowerCase()) {
    pwModal.hidden = true;
    startBirthday(pwBtn);
  } else {
    /* pick a joke, never the same one twice in a row */
    let i;
    do { i = Math.floor(Math.random() * WRONG_PASSWORD_MESSAGES.length); } while (i === lastWrong);
    lastWrong = i;
    showPasswordError(WRONG_PASSWORD_MESSAGES[i]);
    pwInput.select();
  }
}

function initPasswordWindow() {
  pwBtn.addEventListener("click", openPasswordWindow);
  pwForm.addEventListener("submit", onPasswordSubmit);
  pwModal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closePasswordWindow(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pwModal.hidden) closePasswordWindow(); });
  pwToggle.addEventListener("click", () => {
    const show = pwInput.type === "password";
    pwInput.type = show ? "text" : "password";
    pwToggle.setAttribute("aria-pressed", String(show));
    pwToggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    pwInput.focus();
  });
}


/* =========================================================================
   8. UNLOCK TRANSITION  (landing page  ->  envelope)
   ========================================================================= */
let started = false;

function startBirthday(originEl) {
  if (started) return;
  started = true;
  notifyOpened(originEl === pwBtn ? "password" : "OPEN button");

  const iris = $("iris");
  const r = originEl.getBoundingClientRect();
  iris.style.setProperty("--x", (r.left + r.width / 2) + "px");
  iris.style.setProperty("--y", (r.top + r.height / 2) + "px");
  void iris.offsetWidth;
  iris.classList.add("go");                 /* warm circle grows over the dark page */

  setTimeout(() => {
    /* swap worlds while the screen is fully covered */
    clearInterval(whisperTimer);
    sky.stop();
    eyes.stop();
    landing.hidden = true;
    document.body.classList.remove("mode-landing");
    document.body.classList.add("mode-birthday");
    $("birthday").hidden = false;
    window.scrollTo(0, 0);
    initScratch();
    initEnvelope();
    iris.classList.add("out");              /* then fade the circle away */
    setTimeout(() => { iris.hidden = true; }, 1000);
  }, reducedMotion ? 50 : 1050);
}


/* =========================================================================
   9. ENVELOPE + HERO
   ========================================================================= */
function initEnvelope() {
  const envelope = $("envelope");
  envelope.addEventListener("click", async () => {
    $("envHint").classList.add("gone");
    envelope.classList.add("open");          /* flap lifts */
    await wait(750);
    envelope.classList.add("rise");          /* letter slides out */
    await wait(1900);
    $("envStage").classList.add("leave");    /* envelope fades */
    await wait(700);
    $("envStage").hidden = true;
    const hero = $("hero");
    hero.hidden = false;
    void hero.offsetWidth;
    hero.classList.add("in");                /* words appear */
    window.scrollTo(0, 0);
    confetti.show();
    setTimeout(() => confetti.burst(0.5, 0.35, 120, 12), 350);
    setTimeout(() => confetti.burst(0.08, 0.7, 60, 11, -0.6), 900);
    setTimeout(() => confetti.burst(0.92, 0.7, 60, 11, 0.6), 1100);
  }, { once: true });

  $("toScratch").addEventListener("click", showScratch);

  $("toFinal").addEventListener("click", () => {
    $("finalSection").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  });
  $("toTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
}


/* =========================================================================
   10. CONFETTI  (one canvas, light on phones)
   ========================================================================= */
const confetti = (() => {
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  const COLORS = ["#f4dcab", "#d8a74f", "#f0698f", "#ffd9df", "#fff4ec", "#ff9db5", "#e9b8ff"];
  let parts = [];
  let raf = 0;
  let running = false;
  let w = 0, h = 0, dpr = 1;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function show() { if (!running || !w) size(); }

  /* fx/fy = start point (0..1 of screen), count, power, tilt = sideways push */
  function burst(fx, fy, count, power, tilt) {
    if (!w) size();
    if (reducedMotion) count = Math.round(count / 4);
    /* fewer pieces on small screens */
    if (w < 520) count = Math.round(count * 0.65);
    for (let i = 0; i < count; i++) {
      const a = rand(-Math.PI, 0) + (tilt || 0);          /* mostly upward */
      const s = rand(power * 0.4, power);
      parts.push({
        x: fx * w, y: fy * h,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        w: rand(5, 10), h: rand(3, 6),
        rot: rand(0, 6.28), vr: rand(-0.25, 0.25),
        c: pick(COLORS), life: rand(150, 260),
        round: Math.random() < 0.25,
      });
    }
    if (!running) { running = true; raf = requestAnimationFrame(tick); }
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += 0.22; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      if (p.life <= 0 || p.y > h + 20) { parts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.h * 0.7, 0, 6.28); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, w, h); }
  }

  window.addEventListener("resize", () => { if (!running) size(); });
  return { show, burst };
})();


/* =========================================================================
   11. SCRATCH CARDS
   ========================================================================= */
const TOTAL = REGIONS.length;                  /* 36 */
let revealed = new Set(tabStore.get("revealed", []));
let pages = [];                                /* [{ kind, label, ids: [...] }] */
let currentPage = 0;
let finalShown = false;

/* Split the 36 regions into pages: states in groups of 6, territories in groups of 4 */
function buildPages() {
  const result = [];
  const states = [], uts = [];
  REGIONS.forEach((r, i) => (r.kind === "State" ? states : uts).push(i));
  for (let i = 0; i < states.length; i += 6) result.push({ kind: "State", ids: states.slice(i, i + 6) });
  for (let i = 0; i < uts.length; i += 4) result.push({ kind: "Union Territory", ids: uts.slice(i, i + 4) });
  /* label each page: "States 1 of 5", "Union Territories 2 of 2" */
  const counts = { "State": result.filter((p) => p.kind === "State").length, "Union Territory": result.filter((p) => p.kind !== "State").length };
  const seen = { "State": 0, "Union Territory": 0 };
  result.forEach((p) => {
    seen[p.kind]++;
    p.n = seen[p.kind];
    p.of = counts[p.kind];
    p.label = (p.kind === "State" ? "States" : "Union Territories") + " · " + p.n + " of " + p.of;
  });
  return result;
}

function initScratch() {
  pages = buildPages();

  /* page buttons, grouped */
  const pager = $("pager");
  pager.innerHTML = "";
  ["State", "Union Territory"].forEach((kind) => {
    const group = document.createElement("div");
    group.className = "pager-group";
    const label = document.createElement("span");
    label.className = "pager-label";
    label.textContent = kind === "State" ? "States" : "UTs";
    group.appendChild(label);
    pages.forEach((p, idx) => {
      if (p.kind !== kind) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pill";
      b.textContent = String(p.n);
      b.dataset.page = String(idx);
      b.setAttribute("aria-label", p.label);
      b.addEventListener("click", () => goToPage(idx));
      group.appendChild(b);
    });
    pager.appendChild(group);
  });

  $("prevPage").addEventListener("click", () => goToPage(currentPage - 1));
  $("nextPage").addEventListener("click", () => goToPage(currentPage + 1));

  /* The cards are drawn later, when the section becomes visible (see showScratch) */
}

let scratchShown = false;
function showScratch() {
  const section = $("scratchSection");
  section.hidden = false;
  if (!scratchShown) {
    scratchShown = true;
    /* open on the first page that still has something to scratch */
    const firstOpen = pages.findIndex((p) => p.ids.some((id) => !revealed.has(id)));
    goToPage(firstOpen === -1 ? 0 : firstOpen, true);
    updateProgress(true);
  }
  section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}

function goToPage(idx, instant) {
  if (idx < 0 || idx >= pages.length) return;
  currentPage = idx;
  renderPage();
  $("prevPage").disabled = idx === 0;
  $("nextPage").disabled = idx === pages.length - 1;
  document.querySelectorAll("#pager .pill").forEach((b) => {
    b.setAttribute("aria-current", b.dataset.page === String(idx) ? "true" : "false");
  });
  updatePills();
  if (!instant) {
    const top = $("pager").getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  }
}

function renderPage() {
  const page = pages[currentPage];
  $("pageTitle").textContent = page.label;
  const grid = $("grid");
  grid.innerHTML = "";
  grid.dataset.count = String(page.ids.length);
  /* restart the fade-in animation */
  grid.style.animation = "none"; void grid.offsetWidth; grid.style.animation = "";

  page.ids.forEach((id) => grid.appendChild(buildCard(id)));

  /* foil needs real sizes, so paint it after layout */
  requestAnimationFrame(() => {
    grid.querySelectorAll(".card:not(.revealed) .foil").forEach((c) => setupFoil(c));
  });
}

function buildCard(id) {
  const r = REGIONS[id];
  const card = document.createElement("article");
  card.className = "card" + (revealed.has(id) ? " revealed" : "");
  card.dataset.id = String(id);
  card.innerHTML =
    '<header class="card-head"><h4 class="card-name"></h4><span class="card-type"></span></header>' +
    '<div class="card-body">' +
      '<div class="msg"><p class="msg-lang"></p><p class="msg-text"></p></div>' +
      '<canvas class="foil" tabindex="0" role="button"></canvas>' +
    '</div>';
  card.querySelector(".card-name").textContent = r.name;
  card.querySelector(".card-type").textContent = r.kind;
  card.querySelector(".msg-lang").textContent = r.lang;
  card.querySelector(".msg-text").textContent = r.text;
  const foil = card.querySelector(".foil");
  foil.setAttribute("aria-label", "Scratch card for " + r.name + ". Press Enter to reveal.");
  return card;
}

/* Colour recipes for the foil, so the cards do not all look identical */
const FOILS = [
  ["#f7e3b0", "#d9a850", "#fbefc9", "#c9923a"],   /* gold */
  ["#f6cdd0", "#d98a95", "#fbe2e2", "#c4727f"],   /* rose gold */
  ["#e8e4ee", "#a9a3b8", "#f6f3fa", "#8f89a2"],   /* pearl silver */
  ["#f2d6b8", "#c99466", "#f9e6cf", "#b47c4f"],   /* copper */
];

function paintFoil(ctx, w, h, id) {
  const c = FOILS[id % FOILS.length];
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, c[0]); g.addColorStop(0.35, c[1]); g.addColorStop(0.6, c[2]); g.addColorStop(1, c[3]);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  /* fine diagonal grain */
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  for (let x = -h; x < w; x += 9) {
    ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke();
  }
  /* sparkles */
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = "rgba(255,255,255," + rand(0.25, 0.7).toFixed(2) + ")";
    ctx.beginPath(); ctx.arc(rand(0, w), rand(0, h), rand(0.6, 1.6), 0, 6.28); ctx.fill();
  }
  /* label */
  ctx.fillStyle = "rgba(70,30,40,0.62)";
  ctx.font = "600 " + Math.max(11, Math.min(14, w / 12)) + "px Jost, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S C R A T C H", w / 2, h / 2 - 7);
  ctx.font = "400 " + Math.max(10, Math.min(12, w / 14)) + "px Jost, system-ui, sans-serif";
  ctx.fillStyle = "rgba(70,30,40,0.45)";
  ctx.fillText("ghis ke dekho", w / 2, h / 2 + 11);
}

/* Make one canvas scratchable with mouse, finger or pen */
function setupFoil(canvas) {
  const card = canvas.closest(".card");
  const id = Number(card.dataset.id);
  const area = canvas.parentElement;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let w = 0, h = 0, dpr = 1;
  let drawing = false;
  let last = null;
  let moves = 0;
  let done = false;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = area.clientWidth; h = area.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintFoil(ctx, w, h, id);
  }
  size();

  /* If the card width changes (rotating a phone), repaint. Height-only changes
     (phone address bar) are ignored so scratching is never lost. */
  let lastW = w;
  const ro = "ResizeObserver" in window ? new ResizeObserver(() => {
    if (done) return;
    if (Math.abs(area.clientWidth - lastW) > 2) { lastW = area.clientWidth; size(); }
  }) : null;
  if (ro) ro.observe(area);

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function scratch(from, to) {
    /* "destination-out" erases in proportion to the stroke's opacity, so the
       stroke colour must be fully opaque or the foil only fades a little. */
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(24, Math.min(40, w * 0.17));
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x + 0.01, to.y + 0.01);
    ctx.stroke();
  }

  /* How much of the foil is gone? Sample every 8th pixel for speed. */
  function clearedShare() {
    const cw = canvas.width, ch = canvas.height;
    let data;
    try { data = ctx.getImageData(0, 0, cw, ch).data; } catch (err) { return 0; }
    let total = 0, clear = 0;
    const step = 8;
    for (let y = 0; y < ch; y += step) {
      for (let x = 0; x < cw; x += step) {
        total++;
        if (data[(y * cw + x) * 4 + 3] < 40) clear++;
      }
    }
    return total ? clear / total : 0;
  }

  function check() {
    if (done) return;
    if (clearedShare() >= CONFIG.SCRATCH_REVEAL_AT) finish();
  }

  function finish() {
    if (done) return;
    done = true;
    if (ro) ro.disconnect();
    revealCard(id, card);
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (done) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    drawing = true;
    last = pos(e);
    scratch(last, last);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing || done) return;
    const p = pos(e);
    scratch(last, p);
    last = p;
    if (++moves % 12 === 0) check();
  });
  const end = () => { if (drawing) { drawing = false; check(); } };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  /* keyboard: Enter or Space reveals the card */
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(); }
  });
}

function revealCard(id, card) {
  if (revealed.has(id)) return;
  revealed.add(id);
  tabStore.set("revealed", Array.from(revealed));
  card.classList.add("revealed");
  const foil = card.querySelector(".foil");
  if (foil) { foil.tabIndex = -1; foil.setAttribute("aria-hidden", "true"); }

  /* small sparkle burst from the card */
  const rect = card.getBoundingClientRect();
  confetti.show();
  confetti.burst((rect.left + rect.width / 2) / window.innerWidth, (rect.top + rect.height / 2) / window.innerHeight, 22, 7);

  updateProgress(false);
  updatePills();
}

function updatePills() {
  document.querySelectorAll("#pager .pill").forEach((b) => {
    const p = pages[Number(b.dataset.page)];
    b.classList.toggle("done", p.ids.every((id) => revealed.has(id)));
  });
}

function updateProgress(silent) {
  const n = revealed.size;
  $("progCount").textContent = String(n);
  $("progBar").style.width = ((n / TOTAL) * 100).toFixed(1) + "%";
  $("progBarWrap").setAttribute("aria-valuenow", String(n));
  const left = TOTAL - n;
  $("progLeft").textContent = left > 0 ? left + " baaki" : "sab khul gaye";

  const allDone = n >= TOTAL;
  const canShowFinal = CONFIG.REQUIRE_ALL_SCRATCHED ? allDone : true;

  $("finalHint").textContent = canShowFinal
    ? (allDone ? "Saare 36 khul gaye. Neeche ek aakhri baat hai." : "")
    : "Aakhri message tab khulega jab saare 36 reveal ho jaayein.";

  if (canShowFinal) {
    $("finalSection").hidden = false;
    $("toFinal").hidden = false;
    if (allDone && !finalShown && !silent) {
      /* the big moment: all 36 are open */
      confetti.burst(0.5, 0.5, 140, 13);
      setTimeout(() => confetti.burst(0.15, 0.6, 70, 11, -0.5), 400);
      setTimeout(() => confetti.burst(0.85, 0.6, 70, 11, 0.5), 650);
    }
    if (allDone) finalShown = true;
  }
}


/* =========================================================================
   12. START-UP
   ========================================================================= */
function init() {
  document.body.classList.add("mode-landing");
  applyLandingTheme();
  sky.init();
  if (landingTheme === "mind") eyes.start();
  initLandingPointer();
  initPasswordWindow();
  createFireflies();
  startWhispers();
  syncClock();                                   /* learn the real time early */
  openBtn.addEventListener("click", onOpenClick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
