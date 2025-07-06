const API_BASE = "https://7058-81-215-218-49.ngrok-free.app";

// 2.  Telegram Web-Apps SDK boot-strap
const tg = window.Telegram.WebApp;
tg.ready();

tg.MainButton.setText("Pet 🐱");
tg.MainButton.show();

const CAT_SPRITES = {
  angry:  "assets/angry_cat.png",
  neutral:"assets/neutral_cat.png",
  happy:  "assets/happy_cat.png",
};

Object.values(CAT_SPRITES).forEach(src => new Image().src = src);

// ────────────  AUDIO preload  ────────────
const purrAudio = new Audio("assets/purr.mp3");
purrAudio.preload = "auto";          // download as early as possible
purrAudio.volume  = 0.8;             // slightly softer than full volume

const tapAudio  = new Audio("assets/tap.mp3");
tapAudio.preload = "auto";
tapAudio.volume  = 0.4;

// ────────────  HAPTIC helper  ────────────
function haptic(type = "light") {
  /* Available types: 'selection', 'impact', 'rigid', 'soft', or
     notificationOccurred('success' | 'error' | 'warning')       */
  const hf = window.Telegram?.WebApp?.HapticFeedback;
  if (!hf) return;                           // desktop browser
  try {
    if (type === "light") hf.impactOccurred("light");
    else if (type === "success") hf.notificationOccurred("success");
  } catch { /* silently ignore unsupported devices */ }
}

// 3.  DOM refs
const cat = document.getElementById("cat");
const bar = document.getElementById("happinessBar");

// 4.  Helpers
function updateBar(val) {
  bar.style.width = `${val}%`;
  bar.textContent = `Happiness ${val}%`;

  let src;
  if (val < 30)            src = CAT_SPRITES.angry;
  else if (val > 60)       src = CAT_SPRITES.happy;
  else                     src = CAT_SPRITES.neutral;

  if (cat.src.endsWith(src)) return;

  cat.style.opacity = "0";
  setTimeout(() => {
    /* Wait until the new image is loaded
       so we don’t show a blank frame */
    const img = new Image();
    img.src = src;
    img.onload = () => {
      cat.src = src;          // swap
      cat.style.opacity = "1";    // fade-in
    };
  }, 200);
}

// 5.  Ajax helpers – keep the fetch boilerplate in one place
async function post(path, bodyObj) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// 6.  Initial state load
(async () => {
  try {
    const { happiness } = await post("/state", { initData: tg.initData });
    updateBar(happiness);
  } catch (err) {
    tg.showPopup({ title: "Error", message: "Server unreachable 😿" });
  }
})();

// 7.  MainButton handler
tg.MainButton.onClick(async () => {
  /* 1. local feedback as *soon* as user taps */
  tapAudio.currentTime = 0;
  tapAudio.play().catch(() => {/* ignore auto-play blocks */});
  haptic("light");

  /* 2. wiggle the cat (existing) */
  cat.classList.add("pet");
  setTimeout(() => cat.classList.remove("pet"), 600);

  /* 3. call backend */
  try {
    const { happiness } = await post("/pet", { initData: tg.initData });
    updateBar(happiness);

    /* 4. happy-path sound & haptic */
    purrAudio.currentTime = 0;
    purrAudio.play().catch(() => {});
    haptic("success");

  } catch (err) {
    tg.showPopup({ title: "Error", message: "Server unreachable 😿" });
  }
});

