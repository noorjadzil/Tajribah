const DB_NAME = "maqshof_offline_db";
const DB_VERSION = 1;
let db;

const defaultItems = [
  { nama: "Es Teh", harga: 2700 },
  { nama: "Es Jeruk", harga: 3700 },
  { nama: "Es Blewah", harga: 3700 },
  { nama: "Es Coklat", harga: 4500 },
  { nama: "Jus Alpukat", harga: 6000 },
  { nama: "Es Sari Kedelai", harga: 3700 },
  { nama: "Aneka Snack", harga: 2700 },
  { nama: "Terang Bulan", harga: 6500 }
];

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e)=>{
      db = e.target.result;
      if(!db.objectStoreNames.contains("items")){
        db.createObjectStore("items", { keyPath:"id", autoIncrement:true });
      }
      if(!db.objectStoreNames.contains("laporan")){
        db.createObjectStore("laporan", { keyPath:"id", autoIncrement:true });
      }
    };

    req.onsuccess = (e)=>{
      db = e.target.result;
      resolve(db);
    };
    req.onerror = ()=> reject(req.error);
  });
}

function tx(store, mode="readonly"){
  return db.transaction(store, mode).objectStore(store);
}

function getAll(store){
  return new Promise((resolve, reject)=>{
    const req = tx(store).getAll();
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}

function addData(store, data){
  return new Promise((resolve, reject)=>{
    const req = tx(store, "readwrite").add(data);
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}

function putData(store, data){
  return new Promise((resolve, reject)=>{
    const req = tx(store, "readwrite").put(data);
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}

function deleteData(store, id){
  return new Promise((resolve, reject)=>{
    const req = tx(store, "readwrite").delete(id);
    req.onsuccess = ()=> resolve();
    req.onerror = ()=> reject(req.error);
  });
}

function clearStore(store){
  return new Promise((resolve, reject)=>{
    const req = tx(store, "readwrite").clear();
    req.onsuccess = ()=> resolve();
    req.onerror = ()=> reject(req.error);
  });
}

function rupiah(n){
  return new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(n || 0);
}

function today(){
  return new Date().toISOString().slice(0,10);
}

async function seedItems(){
  const items = await getAll("items");
  if(items.length === 0){
    for(const item of defaultItems){
      await addData("items", item);
    }
  }
}

async function renderInput(){
  const items = await getAll("items");
  const tbody = document.getElementById("inputTable");
  tbody.innerHTML = "";

  if(items.length === 0){
    tbody.innerHTML = `<tr><td colspan="4">Belum ada item. Tambahkan di Setting.</td></tr>`;
    return;
  }

  items.forEach(item=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.nama}</strong></td>
      <td>${rupiah(item.harga)}</td>
      <td><input type="number" min="0" value="0" data-id="${item.id}" data-field="masuk"></td>
      <td><input type="number" min="0" value="0" data-id="${item.id}" data-field="sisa"></td>
    `;
    tbody.appendChild(tr);
  });
}

async function simpanLaporan(){
  const tanggal = document.getElementById("tanggalInput").value || today();
  const catatan = document.getElementById("catatanInput").value.trim();
  const itemsMaster = await getAll("items");

  const dataItems = itemsMaster.map(item=>{
    const masukEl = document.querySelector(`input[data-id="${item.id}"][data-field="masuk"]`);
    const sisaEl = document.querySelector(`input[data-id="${item.id}"][data-field="sisa"]`);
    const masuk = Number(masukEl?.value || 0);
    const sisa = Number(sisaEl?.value || 0);
    const terjual = Math.max(masuk - sisa, 0);
    return {
      itemId: item.id,
      nama: item.nama,
      harga: Number(item.harga || 0),
      masuk,
      sisa,
      terjual,
      total: terjual * Number(item.harga || 0)
    };
  });

  await addData("laporan", {
    tanggal,
    catatan,
    dibuatPada: new Date().toISOString(),
    items: dataItems
  });

  alert("Data berhasil disimpan offline.");
  document.getElementById("catatanInput").value = "";
  await renderInput();
  await renderLaporan();
}

async function renderLaporan(filterDate = null){
  let laporan = await getAll("laporan");
  laporan = laporan.sort((a,b)=> new Date(b.tanggal) - new Date(a.tanggal));

  if(filterDate){
    laporan = laporan.filter(x=>x.tanggal === filterDate);
  }

  const box = document.getElementById("laporanList");
  const summary = document.getElementById("ringkasanBox");
  box.innerHTML = "";

  let totalMasuk = 0, totalSisa = 0, totalTerjual = 0, totalUang = 0;
  laporan.forEach(l=>{
    l.items.forEach(i=>{
      totalMasuk += Number(i.masuk || 0);
      totalSisa += Number(i.sisa || 0);
      totalTerjual += Number(i.terjual || 0);
      totalUang += Number(i.total || 0);
    });
  });

  summary.innerHTML = `
    <strong>Ringkasan</strong><br>
    Total Masuk: ${totalMasuk} · Total Sisa: ${totalSisa} · Terjual: ${totalTerjual}<br>
    <strong>Total Uang: ${rupiah(totalUang)}</strong>
  `;

  if(laporan.length === 0){
    box.innerHTML = `<p class="muted">Belum ada laporan.</p>`;
    return;
  }

  laporan.forEach(l=>{
    const div = document.createElement("div");
    div.className = "report-card";

    const rows = l.items.map(i=>`
      <tr>
        <td>${i.nama}</td>
        <td>${i.masuk}</td>
        <td>${i.sisa}</td>
        <td>${i.terjual}</td>
        <td>${rupiah(i.total)}</td>
      </tr>
    `).join("");

    div.innerHTML = `
      <h3>${l.tanggal}</h3>
      <div class="report-meta">${l.catatan || "-"} · dibuat ${new Date(l.dibuatPada).toLocaleString("id-ID")}</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Masuk</th>
              <th>Sisa</th>
              <th>Terjual</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <button class="danger small" onclick="hapusLaporan(${l.id})">Hapus laporan ini</button>
    `;
    box.appendChild(div);
  });
}

async function hapusLaporan(id){
  if(confirm("Hapus laporan ini?")){
    await deleteData("laporan", id);
    await renderLaporan(document.getElementById("filterTanggal").value || null);
  }
}

async function renderItems(){
  const items = await getAll("items");
  const list = document.getElementById("itemList");
  list.innerHTML = "";

  if(items.length === 0){
    list.innerHTML = `<p class="muted">Belum ada item.</p>`;
    return;
  }

  items.forEach(item=>{
    const div = document.createElement("div");
    div.className = "item-row";
    div.innerHTML = `
      <div>
        <strong>${item.nama}</strong>
        <span>${rupiah(item.harga)}</span>
      </div>
      <button class="secondary" onclick='editItem(${JSON.stringify(item)})'>Edit</button>
      <button class="danger" onclick="hapusItem(${item.id})">Hapus</button>
    `;
    list.appendChild(div);
  });
}

function editItem(item){
  document.getElementById("editItemId").value = item.id;
  document.getElementById("namaItem").value = item.nama;
  document.getElementById("hargaItem").value = item.harga;
  document.getElementById("simpanItemBtn").textContent = "Simpan Perubahan";
  document.getElementById("batalEditBtn").classList.remove("hidden");
}

function batalEdit(){
  document.getElementById("editItemId").value = "";
  document.getElementById("namaItem").value = "";
  document.getElementById("hargaItem").value = "";
  document.getElementById("simpanItemBtn").textContent = "Tambah Item";
  document.getElementById("batalEditBtn").classList.add("hidden");
}

async function simpanItem(){
  const id = document.getElementById("editItemId").value;
  const nama = document.getElementById("namaItem").value.trim();
  const harga = Number(document.getElementById("hargaItem").value || 0);

  if(!nama){
    alert("Nama item wajib diisi.");
    return;
  }

  if(id){
    await putData("items", { id:Number(id), nama, harga });
  }else{
    await addData("items", { nama, harga });
  }

  batalEdit();
  await renderItems();
  await renderInput();
}

async function hapusItem(id){
  if(confirm("Hapus item ini? Data laporan lama tetap tersimpan.")){
    await deleteData("items", id);
    await renderItems();
    await renderInput();
  }
}

async function exportJSON(){
  const data = {
    items: await getAll("items"),
    laporan: await getAll("laporan"),
    exportPada: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `maqshof-export-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function setupTabs(){
  document.querySelectorAll(".tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.page).classList.add("active");
    });
  });
}

function setupEvents(){
  document.getElementById("simpanBtn").addEventListener("click", simpanLaporan);
  document.getElementById("simpanItemBtn").addEventListener("click", simpanItem);
  document.getElementById("batalEditBtn").addEventListener("click", batalEdit);
  document.getElementById("exportBtn").addEventListener("click", exportJSON);

  document.getElementById("filterTanggal").addEventListener("change", e=>{
    renderLaporan(e.target.value || null);
  });

  document.getElementById("lihatSemuaBtn").addEventListener("click", ()=>{
    document.getElementById("filterTanggal").value = "";
    renderLaporan();
  });

  document.getElementById("hapusSemuaBtn").addEventListener("click", async ()=>{
    if(confirm("Yakin hapus semua laporan? Item setting tidak ikut terhapus.")){
      await clearStore("laporan");
      await renderLaporan();
    }
  });
}

async function init(){
  document.getElementById("tanggalInput").value = today();
  document.getElementById("filterTanggal").value = today();

  await openDB();
  await seedItems();
  setupTabs();
  setupEvents();
  await renderInput();
  await renderItems();
  await renderLaporan(today());

  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js");
  }
}

init();
