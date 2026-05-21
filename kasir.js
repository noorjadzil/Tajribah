import { renderKasir } from './kasir.js';
import { renderProduk } from './produk.js';
import { renderLaporan } from './laporan.js';
import { renderSetting } from './setting.js';

const routes = {
  kasir: renderKasir,
  produk: renderProduk,
  laporan: renderLaporan,
  setting: renderSetting
};

export function navigate(page = 'kasir') {
  location.hash = page;
  document.querySelectorAll('.nav button').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
  routes[page]?.();
}

export function initRouter() {
  window.addEventListener('hashchange', () => navigate(location.hash.replace('#', '') || 'kasir'));
  navigate(location.hash.replace('#', '') || 'kasir');
}
