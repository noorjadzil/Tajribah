import { getAll, put, remove } from './db.js';
import { formatRp } from './wa.js';

export async function renderProduk() {
  const page = document.getElementById('page');
  const produk = await getAll('produk');
  page.innerHTML = `
    <section class="card">
      <h2>Tambah Produk</h2>
      <div class="grid grid-2">
        <div><label>Nama</label><input id="nama" placeholder="Contoh: Es Teh"></div>
        <div><label>Kategori</label><input id="kategori" placeholder="Minuman"></div>
        <div><label>Harga Modal</label><input id="modal" type="number" value="0"></div>
        <div><label>Harga Jual</label><input id="jual" type="number" value="0"></div>
        <div><label>Stok</label><input id="stok" type="number" value="0"></div>
      </div>
      <br>
      <button class="btn" id="saveProduk">Simpan Produk</button>
    </section>
    <section class="card">
      <h2>Daftar Produk</h2>
      <div id="produkList"></div>
    </section>
  `;
  document.getElementById('saveProduk').onclick = saveProduk;
  drawProduk(produk);
}

function drawProduk(produk) {
  const el = document.getElementById('produkList');
  el.innerHTML = produk.length ? `
    <table>
      <thead><tr><th>Nama</th><th>Stok</th><th class="right">Jual</th><th></th></tr></thead>
      <tbody>${produk.map(p => `
        <tr>
          <td><b>${p.nama}</b><br><span class="muted">${p.kategori || '-'}</span></td>
          <td>${p.stok}</td>
          <td class="right">${formatRp(p.hargaJual)}</td>
          <td class="right"><button class="btn danger" data-del="${p.id}">Hapus</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  ` : '<p class="muted">Belum ada produk.</p>';
  el.querySelectorAll('[data-del]').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Hapus produk ini?')) {
        await remove('produk', btn.dataset.del);
        renderProduk();
      }
    };
  });
}

async function saveProduk() {
  const item = {
    id: crypto.randomUUID(),
    nama: document.getElementById('nama').value.trim(),
    kategori: document.getElementById('kategori').value.trim(),
    hargaModal: Number(document.getElementById('modal').value || 0),
    hargaJual: Number(document.getElementById('jual').value || 0),
    stok: Number(document.getElementById('stok').value || 0)
  };
  if (!item.nama) return alert('Nama produk wajib diisi');
  await put('produk', item);
  renderProduk();
}
