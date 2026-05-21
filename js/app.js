document.getElementById('app').innerHTML = `
  <div class="container">

    <div class="card">

      <h1>Kasir PWA</h1>

      <input type="text" placeholder="Nama Barang">

      <input type="number" placeholder="Harga">

      <button>Tambah Barang</button>

    </div>

  </div>
`;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
}
