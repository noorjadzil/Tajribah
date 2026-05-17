const glow = document.querySelector(".cursor-glow");

window.addEventListener("pointermove", (e) => {
  if(glow){
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }

  const x = (e.clientX / innerWidth - .5) * 2;
  const y = (e.clientY / innerHeight - .5) * 2;
  document.documentElement.style.setProperty("--mx", x.toFixed(3));
  document.documentElement.style.setProperty("--my", y.toFixed(3));
});

document.querySelectorAll(".magnetic").forEach(el => {
  el.addEventListener("pointermove", e => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * .14}px, ${y * .18}px) scale(1.02)`;
  });

  el.addEventListener("pointerleave", () => {
    el.style.transform = "";
  });

  el.addEventListener("click", e => {
    const ripple = document.createElement("span");
    const rect = el.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute;
      left:${e.clientX - rect.left}px;
      top:${e.clientY - rect.top}px;
      width:12px;
      height:12px;
      border-radius:50%;
      background:rgba(255,255,255,.55);
      transform:translate(-50%,-50%) scale(0);
      animation:ripple .65s ease-out forwards;
      pointer-events:none;
    `;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

const style = document.createElement("style");
style.textContent = `
@keyframes ripple{
  to{transform:translate(-50%,-50%) scale(28);opacity:0}
}
.reveal-in{opacity:1!important;transform:translateY(0)!important}
`;
document.head.appendChild(style);

const revealEls = document.querySelectorAll(".features article,.pricing,.section-title");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("reveal-in");
    }
  });
}, {threshold:.18});

revealEls.forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(36px)";
  el.style.transition = "900ms cubic-bezier(.2,.8,.2,1)";
  observer.observe(el);
});

document.querySelectorAll(".features article,.device").forEach(card => {
  card.addEventListener("pointermove", e => {
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - .5) * -9;
    const ry = ((e.clientX - rect.left) / rect.width - .5) * 9;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-7px)`;
  });
  card.addEventListener("pointerleave", () => card.style.transform = "");
});
