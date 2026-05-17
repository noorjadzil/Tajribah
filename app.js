const loader = document.getElementById('loader');
const cursorGlow = document.getElementById('cursorGlow');

window.addEventListener('load', () => {
  setTimeout(() => loader.classList.add('hide'), 450);
});

window.addEventListener('mousemove', (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = event.clientX + 'px';
  cursorGlow.style.top = event.clientY + 'px';
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

function setTilt(element, event) {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -6;
  const rotateY = ((x - centerX) / centerX) * 6;

  element.style.transform = `perspective(950px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
}

document.querySelectorAll('.card-tilt').forEach((card) => {
  card.addEventListener('mousemove', (event) => setTilt(card, event));
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

document.querySelectorAll('.magnetic').forEach((button) => {
  button.addEventListener('mousemove', (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = '';
  });
});

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('.ambient').forEach((orb, index) => {
    orb.style.translate = `0 ${y * (0.04 + index * 0.018)}px`;
  });
});
