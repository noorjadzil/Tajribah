import { getAll } from './db.js';
import { formatRp } from './wa.js';

export async function renderLaporan() {
  const page = document.getElementById('page');
  const transaksi = (await getAll('transaksi')).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const total = transaksi.reduce((sum, trx) => sum + Number(trx.total || 0), 0);
  page.innerHTML = `
    <section class="card">
      <h2>Laporan</h2>
      <p class="total">${formatRp(total)}</p>
      <p class="muted">Total dari ${transaksi.length} transaksi.</p>
    </section>
    <section class="card">
      <h2>Riwayat Transaksi</h2>
      ${transaksi.length ? transaksi.map(trx => `
        <div class="card">
          <b>${new Date(trx.tanggal).toLocaleString('id-ID')}</b>
          <p>${trx.items.map(i => `${i.nama} x${i.qty}`).join(', ')}</p>
          <div class="right"><b>${formatRp(trx.total)}</b></div>
        </div>
      `).join('') : '<p class="muted">Belum ada transaksi.</p>'}
    </section>
  `;
}
