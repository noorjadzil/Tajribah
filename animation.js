// animation.js
// Efek premium: mouse glow, parallax, reveal, particle, tilt card

const glow = document.createElement("div");
glow.style.cssText = `
  position:fixed;
  width:420px;
  height:420px;
  border-radius:50%;
  pointer-events:none;
  z-index:999;
  background:radial-gradient(circle, rgba(34,211,238,.25), transparent 65%);
  filter:blur(25px);
  transform:translate(-50%,-50%);
  mix-blend-mode:screen;
`;
document.body.appendChild(glow);

window.addEventListener("mousemove", e => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

const canvas = document.createElement("canvas");
canvas.style.cssText = `
  position:fixed;
  inset:0;
  width:100%;
  height:100%;
  pointer-events:none;
  z-index:-1;
`;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
let particles = [];

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

for(let i=0;i<90;i++){
  particles.push({
    x:Math.random()*innerWidth,
    y:Math.random()*innerHeight,
    r:Math.random()*2+0.5,
    vx:(Math.random()-.5)*0.25,
    vy:(Math.random()-.5)*0.25,
    a:Math.random()*0.6+0.2
  });
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  particles.forEach(p=>{
    p.x += p.vx;
    p.y += p.vy;

    if(p.x<0) p.x=innerWidth;
    if(p.x>innerWidth) p.x=0;
    if(p.y<0) p.y=innerHeight;
    if(p.y>innerHeight) p.y=0;

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(125, 211, 252, ${p.a})`;
    ctx.fill();
  });

  requestAnimationFrame(draw);
}
draw();

document.querySelectorAll(".card,.stat,.phone,.cta").forEach(el=>{
  el.addEventListener("mousemove", e=>{
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - .5) * -10;
    const ry = ((x / rect.width) - .5) * 10;

    el.style.transform = `
      perspective(900px)
      rotateX(${rx}deg)
      rotateY(${ry}deg)
      translateY(-6px)
    `;
  });

  el.addEventListener("mouseleave", ()=>{
    el.style.transform = "";
  });
});

const revealEls = document.querySelectorAll(".card,.cta,.section h2");

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
},{threshold:.2});

revealEls.forEach(el=>{
  el.style.opacity = "0";
  el.style.transform = "translateY(35px)";
  el.style.transition = "1s cubic-bezier(.2,.8,.2,1)";
  observer.observe(el);
});

window.addEventListener("scroll", ()=>{
  const y = window.scrollY;

  document.querySelectorAll(".orb").forEach((orb,i)=>{
    orb.style.transform = `translateY(${y * (0.08 + i * 0.04)}px)`;
  });

  const phone = document.querySelector(".phone");
  if(phone){
    phone.style.marginTop = `${y * 0.04}px`;
  }
});

const title = document.querySelector("h1");
if(title){
  title.style.backgroundSize = "250% auto";
  title.animate(
    [
      { backgroundPosition:"0% center" },
      { backgroundPosition:"100% center" },
      { backgroundPosition:"0% center" }
    ],
    {
      duration:6000,
      iterations:Infinity,
      easing:"ease-in-out"
    }
  );
}

const buttons = document.querySelectorAll(".btn,.nav-btn");
buttons.forEach(btn=>{
  btn.addEventListener("mouseenter",()=>{
    btn.animate(
      [
        { transform:"scale(1)" },
        { transform:"scale(1.06)" },
        { transform:"scale(1)" }
      ],
      {
        duration:350,
        easing:"ease-out"
      }
    );
  });
});
