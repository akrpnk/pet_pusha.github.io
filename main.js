// 0. Bring SDK into a handy variable
const tg = window.Telegram.WebApp;

// 1. Tell Telegram you are ready (shows the UI instantly)
tg.ready();

// 2. Configure the MainButton
tg.MainButton.setText('Pet 🐱');
tg.MainButton.show();

// 3. Element refs
const cat   = document.getElementById('cat');
const bar   = document.getElementById('happinessBar');

// 4. Handle tap on MainButton
tg.MainButton.onClick(async () => {
  // a) simple visual feedback
  cat.classList.add('pet');
  setTimeout(() => cat.classList.remove('pet'), 600);

  // b) call your back-end
  try {
    const res = await fetch('/pet', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ initData: tg.initData })
    });
    const data = await res.json();        // {newHappiness: 87}

    updateBar(data.newHappiness);
  } catch (e) {
    tg.showPopup({title:'Error', message:'Server unreachable 😿'});
  }
});

// 5. On first load ask for current state
(async () => {
  const res = await fetch('/state', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ initData: tg.initData })
  });
  const {happiness} = await res.json();
  updateBar(happiness);
})();

function updateBar(val){
  bar.style.width = `${val}%`;
  bar.textContent = `Happiness ${val}%`;
}
