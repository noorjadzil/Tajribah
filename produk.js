import { APP_CONFIG } from './config.js';
import { seedProduk } from './db.js';
import { initRouter, navigate } from './router.js';

const app = document.getElementById('app');
app.innerHTML = `
  <header class="header">
    <h1>${APP_CONFIG.appName}</h1>
    <p>Kasir offline, laporan, stok, dan nota WhatsApp</p>
  </header>
  <nav class="nav">
    <button data-page="kasir">Kasir</button>
    <button data-page="produk">Produk</button>
    <button data-page="laporan">Laporan</button>
    <button data-page="setting">Setting</button>
  </nav>
  <main id="page" class="container"></main>
`;

document.querySelectorAll('.nav button').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.page));
});

await seedProduk();
initRouter();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(console.error);
}
