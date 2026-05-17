const replayBtn = document.getElementById("replay");
const stage = document.querySelector(".stage");

replayBtn?.addEventListener("click", () => {
  stage.classList.add("restart");
  void stage.offsetWidth;
  stage.classList.remove("restart");
});

const impactSound = (() => {
  let audioCtx;
  return function(freq = 90, time = .11){
    try{
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.045, audioCtx.currentTime + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + time);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + time + .02);
    }catch(e){}
  }
})();

let cycle = 0;
setInterval(() => {
  cycle++;
  setTimeout(() => impactSound(95, .10), 1400);
  setTimeout(() => impactSound(125, .08), 2550);
  setTimeout(() => impactSound(180, .07), 3450);
  setTimeout(() => impactSound(420, .18), 5600);
}, 7800);
