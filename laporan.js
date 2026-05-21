import { getAll, put } from './db.js';
import { formatRp, makeNotaText, openWhatsApp } from './wa.js';

let cart = [];

export async function renderKasir() {
  const page = document.getElementById('page');
  const produk = await getAll('produk');
  page.innerHTML = `
    <section class="card">
      <h2>Transaksi</h2>
      <div class="grid grid-2">
        <div>
          <label>Pilih Produk</label>
          <select id="produkSelect">
            ${produk.map(p => `<option value="${p.id}">${p.nama} - ${formatRp(p.hargaJual)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Jumlah</label>
          <input id="qtyInput" type="number" min="1" value="1" />
        </div>
      </div>
      <br>
      <button class="btn" id="addCartBtn">Tambah ke Keranjang</button>
    </section>
    <section class="card">
      <h2>Keranjang</h2>
      <div id="cartArea"></div>
      <hr>
      <div class="row">
        <div class="grow total" id="totalArea">Total: Rp 0</div>
        <button class="btn success" id="saveBtn">Simpan</button>
        <button class="btn" id="waBtn">WA Nota</button>
        <button class="btn danger" id="clearBtn">Kosongkan</button>
      </div>
    </section>
  `;

  document.getElementById('addCartBtn').onclick = () => addToCart(produk);
  document.getElementById('saveBtn').onclick = saveTransaction;
  document.getElementById('clearBtn').onclick = () => { cart = []; drawCart(); };
  document.getElementById('waBtn').onclick = () => openWhatsApp(makeNotaText(cart));
  drawCart();
}

function addToCart(produk) {
  const id = document.getElementById('produkSelect').value;
  const qty = Number(document.getElementById('qtyInput').value || 1);
  const item = produk.find(p => p.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id: item.id, nama: item.nama, harga: Number(item.hargaJual), qty });
  drawCart();
}

function drawCart() {
  const area = document.getElementById('cartArea');
  if (!area) return;
  const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
  area.innerHTML = cart.length ? `
    <table>
      <thead><tr><th>Produk</th><th>Qty</th><th class="right">Subtotal</th></tr></thead>
      <tbody>${cart.map(item => `<tr><td>${item.nama}</td><td>${item.qty}</td><td class="right">${formatRp(item.harga * item.qty)}</td></tr>`).join('')}</tbody>
    </table>
  ` : '<p class="muted">Keranjang masih kosong.</p>';
  document.getElementById('totalArea').textContent = `Total: ${formatRp(total)}`;
}

async function saveTransaction() {
  if (!cart.length) return alert('Keranjang masih kosong');
  const trx = {
    id: Date.now().toString(),
    tanggal: new Date().toISOString(),
    items: cart,
    total: cart.reduce((sum, item) => sum + item.harga * item.qty, 0),
    statusSync: 'local'
  };
  await put('transaksi', trx);
  alert('Transaksi tersimpan');
  cart = [];
  drawCart();
}
