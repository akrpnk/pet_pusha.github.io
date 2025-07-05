const API_BASE = "https://7058-81-215-218-49.ngrok-free.app";

// 2.  Telegram Web-Apps SDK boot-strap
const tg = window.Telegram.WebApp;
tg.ready();

tg.MainButton.setText("Pet 🐱");
tg.MainButton.show();

// 3.  DOM refs
const cat = document.getElementById("cat");
const bar = document.getElementById("happinessBar");

// 4.  Helpers
function updateBar(val) {
  bar.style.width = `${val}%`;
  bar.textContent = `Happiness ${val}%`;
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
  // quick visual feedback
  cat.classList.add("pet");
  setTimeout(() => cat.classList.remove("pet"), 600);

  try {
    const { happiness } = await post("/pet", { initData: tg.initData });
    updateBar(happiness);
  } catch (err) {
    tg.showPopup({ title: "Error", message: "Server unreachable 😿" });
  }
});
