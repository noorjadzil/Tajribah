const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const particles = [];
const pointer = { x: null, y: null };

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function createParticles() {
  particles.length = 0;
  const count = Math.min(120, Math.floor(window.innerWidth / 11));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      alpha: Math.random() * 0.55 + 0.15
    });
  }
}

function drawLine(a, b, distance) {
  const opacity = Math.max(0, 1 - distance / 150) * 0.22;
  ctx.strokeStyle = `rgba(125, 211, 252, ${opacity})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function animateParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

    if (pointer.x !== null) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 130) {
        p.x += dx / distance * 0.22;
        p.y += dy / distance * 0.22;
      }
    }

    ctx.fillStyle = `rgba(186, 247, 255, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    for (let j = index + 1; j < particles.length; j++) {
      const other = particles[j];
      const dx = p.x - other.x;
      const dy = p.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) drawLine(p, other, distance);
    }
  });

  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});

window.addEventListener('mousemove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

window.addEventListener('mouseleave', () => {
  pointer.x = null;
  pointer.y = null;
});

resizeCanvas();
createParticles();
animateParticles();
