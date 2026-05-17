// living-effects.js - efek tambahan agar halaman terasa hidup, bukan statis
(function(){
  const root = document.body;

  // Intro cinematic singkat
  const intro = document.createElement('div');
  intro.className = 'cinematic-intro';
  intro.innerHTML = '<div class="intro-text">Aplikasi Modern Siap Dipakai</div>';
  root.prepend(intro);
  setTimeout(() => intro.remove(), 3200);

  // Aurora, grid, dan streak otomatis tanpa perlu edit HTML manual
  const aurora = document.createElement('div');
  aurora.className = 'liquid-aurora';
  aurora.innerHTML = '<span></span><span></span><span></span><span></span>';
  root.prepend(aurora);

  const grid = document.createElement('div');
  grid.className = 'depth-grid';
  root.prepend(grid);

  const streaks = document.createElement('div');
  streaks.className = 'light-streaks';
  streaks.innerHTML = '<i></i><i></i><i></i><i></i>';
  root.prepend(streaks);

  // Orbit di belakang dashboard hero
  const heroVisual = document.querySelector('.hero-visual');
  if(heroVisual){
    const orbit = document.createElement('div');
    orbit.className = 'orbit-system';
    orbit.innerHTML = `
      <div class="orbit-ring"><span class="orbit-dot"></span></div>
      <div class="orbit-ring"><span class="orbit-dot"></span></div>
      <div class="orbit-ring"><span class="orbit-dot"></span></div>
    `;
    heroVisual.prepend(orbit);
  }

  // Efek teks mengetik pada judul utama
  const heroTitle = document.querySelector('.hero-copy h1');
  if(heroTitle){
    const original = heroTitle.innerHTML;
    const plain = heroTitle.textContent.trim().replace(/\s+/g,' ');
    heroTitle.innerHTML = '';
    heroTitle.classList.add('type-cursor');
    let i = 0;
    const type = () => {
      if(i <= plain.length){
        heroTitle.textContent = plain.slice(0,i);
        i++;
        setTimeout(type, i < 12 ? 34 : 18);
      }else{
        heroTitle.classList.remove('type-cursor');
        heroTitle.innerHTML = original;
      }
    };
    setTimeout(type, 700);
  }

  // Live pill di area hero
  const heroDesc = document.querySelector('.hero-desc');
  if(heroDesc){
    const live = document.createElement('div');
    live.className = 'live-pill';
    live.innerHTML = '<i></i> Animasi premium aktif • responsif di HP';
    heroDesc.after(live);
  }

  // Data dashboard terasa hidup
  document.querySelectorAll('.metric strong, .list-card b').forEach(el => el.classList.add('pulse-data'));

  // Counter animasi untuk angka yang dikenali
  const counters = [
    {selector:'.dashboard-grid .metric:nth-child(2) strong', end:64, prefix:'', suffix:''},
    {selector:'.dashboard-grid .metric:nth-child(3) strong', end:128, prefix:'', suffix:''},
    {selector:'.list-card div:first-child b', end:32, prefix:'', suffix:''}
  ];
  counters.forEach(({selector,end,prefix,suffix})=>{
    const el = document.querySelector(selector);
    if(!el) return;
    let start = 0;
    const duration = 1200;
    const begin = performance.now();
    function frame(now){
      const progress = Math.min((now-begin)/duration,1);
      const eased = 1 - Math.pow(1-progress,3);
      el.textContent = prefix + Math.round(start + (end-start)*eased) + suffix;
      if(progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  // Parallax lebih terasa saat mouse bergerak
  window.addEventListener('mousemove', (e)=>{
    const x = (e.clientX / innerWidth - .5);
    const y = (e.clientY / innerHeight - .5);
    document.querySelectorAll('.floating-chip').forEach((chip,idx)=>{
      const power = 18 + idx * 7;
      chip.style.translate = `${x * power}px ${y * power}px`;
    });
    const holo = document.querySelector('.holo-card');
    if(holo && !holo.matches(':hover')){
      holo.style.rotate = `${y * -2.2}deg ${x * 2.8}deg`;
    }
  });

  // Ripple tombol dan kartu saat klik
  document.querySelectorAll('.btn,.header-cta,.feature-card,.price-card').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const rect = el.getBoundingClientRect();
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      const size = Math.max(rect.width, rect.height);
      wave.style.width = wave.style.height = size + 'px';
      wave.style.left = (e.clientX - rect.left) + 'px';
      wave.style.top = (e.clientY - rect.top) + 'px';
      el.appendChild(wave);
      setTimeout(()=>wave.remove(), 720);
    });
  });

  // Tilt premium pakai glare dinamis
  document.querySelectorAll('.card-tilt').forEach(card=>{
    let glare = card.querySelector('.dynamic-glare');
    if(!glare){
      glare = document.createElement('span');
      glare.className = 'dynamic-glare';
      glare.style.cssText = 'position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.20),transparent 38%);opacity:0;transition:opacity .25s;mix-blend-mode:screen;';
      card.appendChild(glare);
    }
    card.addEventListener('mousemove', e=>{
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left)/rect.width)*100;
      const y = ((e.clientY - rect.top)/rect.height)*100;
      glare.style.opacity = '.65';
      glare.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,.24), transparent 36%)`;
    });
    card.addEventListener('mouseleave', ()=>{glare.style.opacity='0'});
  });
})();
