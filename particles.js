const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d");
let w, h, dpr, stars;

function resizeCanvas(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.width = Math.floor(innerWidth * dpr);
  h = canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";

  stars = Array.from({length: Math.floor(Math.min(160, innerWidth / 7))}, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: (Math.random() * 1.8 + .4) * dpr,
    vx: (Math.random() - .5) * .16 * dpr,
    vy: (Math.random() * .22 + .06) * dpr,
    a: Math.random() * .7 + .18
  }));
}

function draw(){
  ctx.clearRect(0,0,w,h);
  ctx.globalCompositeOperation = "lighter";

  for(const s of stars){
    s.x += s.vx;
    s.y += s.vy;

    if(s.y > h) { s.y = -10; s.x = Math.random() * w; }
    if(s.x < 0) s.x = w;
    if(s.x > w) s.x = 0;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(130, 220, 255, ${s.a})`;
    ctx.fill();
  }

  for(let i=0;i<stars.length;i++){
    for(let j=i+1;j<stars.length;j++){
      const a = stars[i], b = stars[j];
      const dx = a.x-b.x, dy=a.y-b.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < 105*dpr){
        ctx.strokeStyle = `rgba(80, 190, 255, ${(1-dist/(105*dpr))*0.12})`;
        ctx.lineWidth = 1*dpr;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
draw();
