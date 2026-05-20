const DB_NAME = "maqshof_offline_db";
const DB_VERSION = 2;
let db;
let currentLaporan = [];

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
      if(!db.objectStoreNames.contains("items")) db.createObjectStore("items", { keyPath:"id", autoIncrement:true });
      if(!db.objectStoreNames.contains("laporan")) db.createObjectStore("laporan", { keyPath:"id", autoIncrement:true });
      if(!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath:"key" });
    };
    req.onsuccess = (e)=>{ db = e.target.result; resolve(db); };
    req.onerror = ()=> reject(req.error);
  });
}
function tx(store, mode="readonly"){ return db.transaction(store, mode).objectStore(store); }
function getAll(store){ return new Promise((res, rej)=>{ const r=tx(store).getAll(); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
function addData(store, data){ return new Promise((res, rej)=>{ const r=tx(store,"readwrite").add(data); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
function putData(store, data){ return new Promise((res, rej)=>{ const r=tx(store,"readwrite").put(data); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
function deleteData(store, id){ return new Promise((res, rej)=>{ const r=tx(store,"readwrite").delete(id); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error); }); }
function clearStore(store){ return new Promise((res, rej)=>{ const r=tx(store,"readwrite").clear(); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error); }); }
function getSetting(key){ return new Promise((res, rej)=>{ const r=tx("settings").get(key); r.onsuccess=()=>res(r.result?.value || ""); r.onerror=()=>rej(r.error); }); }
function setSetting(key, value){ return putData("settings", { key, value }); }

function rupiah(n){ return new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(n || 0); }
function today(){ return new Date().toISOString().slice(0,10); }
function cleanPhone(n){ return (n || "").replace(/[^0-9]/g, "").replace(/^0/, "62"); }
function escapeHtml(s){ return String(s ?? "").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

async function seedItems(){
  const items = await getAll("items");
  if(items.length === 0){ for(const item of defaultItems) await addData("items", item); }
}
async function loadSettings(){ document.getElementById("waNumber").value = await getSetting("waNumber"); }
async function saveWa(){ await setSetting("waNumber", cleanPhone(document.getElementById("waNumber").value)); await loadSettings(); alert("Nomor WA tersimpan."); }

async function renderInput(){
  const items = await getAll("items");
  const tbody = document.getElementById("inputTable");
  const mobile = document.getElementById("inputMobileList");
  tbody.innerHTML = ""; mobile.innerHTML = "";
  if(items.length === 0){ tbody.innerHTML = `<tr><td colspan="4">Belum ada item. Tambahkan di Setting.</td></tr>`; mobile.innerHTML = `<p class="muted">Belum ada item.</p>`; return; }
  items.forEach(item=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><strong>${escapeHtml(item.nama)}</strong></td><td>${rupiah(item.harga)}</td><td><input type="number" min="0" value="0" data-id="${item.id}" data-field="masuk"></td><td><input type="number" min="0" value="0" data-id="${item.id}" data-field="sisa"></td>`;
    tbody.appendChild(tr);
    const card = document.createElement("div");
    card.className = "input-card";
    card.innerHTML = `<div class="input-card-title"><strong>${escapeHtml(item.nama)}</strong><span>${rupiah(item.harga)}</span></div><div class="qty-grid"><div><label>Masuk</label><input type="number" min="0" value="0" data-id="${item.id}" data-field="masuk-mobile"></div><div><label>Sisa</label><input type="number" min="0" value="0" data-id="${item.id}" data-field="sisa-mobile"></div></div>`;
    mobile.appendChild(card);
  });
}
function readQty(itemId, field){
  const normal = document.querySelector(`input[data-id="${itemId}"][data-field="${field}"]`);
  const mobile = document.querySelector(`input[data-id="${itemId}"][data-field="${field}-mobile"]`);
  const active = window.innerWidth <= 640 ? mobile : normal;
  return Number(active?.value || 0);
}
async function simpanLaporan(){
  const tanggal = document.getElementById("tanggalInput").value || today();
  const catatan = document.getElementById("catatanInput").value.trim();
  const itemsMaster = await getAll("items");
  const dataItems = itemsMaster.map(item=>{
    const masuk = readQty(item.id, "masuk");
    const sisa = readQty(item.id, "sisa");
    const terjual = Math.max(masuk - sisa, 0);
    return { itemId:item.id, nama:item.nama, harga:Number(item.harga||0), masuk, sisa, terjual, total:terjual*Number(item.harga||0) };
  });
  await addData("laporan", { tanggal, catatan, dibuatPada:new Date().toISOString(), items:dataItems });
  alert("Data berhasil disimpan.");
  document.getElementById("catatanInput").value = "";
  await renderInput(); await renderLaporan(document.getElementById("filterTanggal").value || tanggal);
}

async function renderLaporan(filterDate = null){
  let laporan = await getAll("laporan");
  laporan = laporan.sort((a,b)=> new Date(b.tanggal) - new Date(a.tanggal));
  if(filterDate) laporan = laporan.filter(x=>x.tanggal === filterDate);
  currentLaporan = laporan;
  const box = document.getElementById("laporanList"); const summary = document.getElementById("ringkasanBox"); box.innerHTML = "";
  let totalMasuk=0,totalSisa=0,totalTerjual=0,totalUang=0;
  laporan.forEach(l=>l.items.forEach(i=>{ totalMasuk+=Number(i.masuk||0); totalSisa+=Number(i.sisa||0); totalTerjual+=Number(i.terjual||0); totalUang+=Number(i.total||0); }));
  summary.innerHTML = `<strong>Ringkasan</strong><br>Masuk: ${totalMasuk} · Sisa: ${totalSisa} · Terjual: ${totalTerjual}<br><strong>Total Uang: ${rupiah(totalUang)}</strong>`;
  if(laporan.length === 0){ box.innerHTML = `<p class="muted">Belum ada laporan.</p>`; return; }
  laporan.forEach(l=>{
    const rows = l.items.map(i=>`<tr><td>${escapeHtml(i.nama)}</td><td>${i.masuk}</td><td>${i.sisa}</td><td>${i.terjual}</td><td>${rupiah(i.total)}</td></tr>`).join("");
    const div = document.createElement("div"); div.className = "report-card";
    div.innerHTML = `<h3>${l.tanggal}</h3><div class="report-meta">${escapeHtml(l.catatan || "-")} · dibuat ${new Date(l.dibuatPada).toLocaleString("id-ID")}</div><div class="table-wrap"><table><thead><tr><th>Item</th><th>Masuk</th><th>Sisa</th><th>Terjual</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table></div><button class="danger small" onclick="hapusLaporan(${l.id})">Hapus laporan ini</button>`;
    box.appendChild(div);
  });
}
async function hapusLaporan(id){ if(confirm("Hapus laporan ini?")){ await deleteData("laporan", id); await renderLaporan(document.getElementById("filterTanggal").value || null); } }

async function renderItems(){
  const items = await getAll("items"); const list = document.getElementById("itemList"); list.innerHTML = "";
  if(items.length === 0){ list.innerHTML = `<p class="muted">Belum ada item.</p>`; return; }
  items.forEach(item=>{ const div=document.createElement("div"); div.className="item-row"; div.innerHTML=`<div><strong>${escapeHtml(item.nama)}</strong><span>${rupiah(item.harga)}</span></div><button class="secondary" onclick='editItem(${JSON.stringify(item).replace(/'/g,"&apos;")})'>Edit</button><button class="danger" onclick="hapusItem(${item.id})">Hapus</button>`; list.appendChild(div); });
}
function editItem(item){ document.getElementById("editItemId").value=item.id; document.getElementById("namaItem").value=item.nama; document.getElementById("hargaItem").value=item.harga; document.getElementById("simpanItemBtn").textContent="Simpan Perubahan"; document.getElementById("batalEditBtn").classList.remove("hidden"); }
function batalEdit(){ document.getElementById("editItemId").value=""; document.getElementById("namaItem").value=""; document.getElementById("hargaItem").value=""; document.getElementById("simpanItemBtn").textContent="Tambah Item"; document.getElementById("batalEditBtn").classList.add("hidden"); }
async function simpanItem(){ const id=document.getElementById("editItemId").value; const nama=document.getElementById("namaItem").value.trim(); const harga=Number(document.getElementById("hargaItem").value||0); if(!nama){alert("Nama item wajib diisi.");return;} if(id) await putData("items",{id:Number(id),nama,harga}); else await addData("items",{nama,harga}); batalEdit(); await renderItems(); await renderInput(); }
async function hapusItem(id){ if(confirm("Hapus item ini? Data laporan lama tetap tersimpan.")){ await deleteData("items", id); await renderItems(); await renderInput(); } }

function buildExportHtml(){
  const filter = document.getElementById("filterTanggal").value;
  let totalMasuk=0,totalSisa=0,totalTerjual=0,totalUang=0;
  const sections = currentLaporan.map(l=>{
    const rows = l.items.map(i=>{ totalMasuk+=Number(i.masuk||0); totalSisa+=Number(i.sisa||0); totalTerjual+=Number(i.terjual||0); totalUang+=Number(i.total||0); return `<tr><td>${escapeHtml(i.nama)}</td><td>${i.harga}</td><td>${i.masuk}</td><td>${i.sisa}</td><td>${i.terjual}</td><td>${i.total}</td></tr>`; }).join("");
    return `<h3>${l.tanggal}</h3><p>${escapeHtml(l.catatan || "-")}</p><table><thead><tr><th>Item</th><th>Harga</th><th>Masuk</th><th>Sisa</th><th>Terjual</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).join("<br>");
  return `<div class="export-area-content"><h2>Laporan MAQSHOF</h2><p>Filter: ${filter || "Semua tanggal"}</p><p><b>Masuk:</b> ${totalMasuk} &nbsp; <b>Sisa:</b> ${totalSisa} &nbsp; <b>Terjual:</b> ${totalTerjual} &nbsp; <b>Total:</b> ${rupiah(totalUang)}</p>${sections || "<p>Belum ada data.</p>"}</div>`;
}
function downloadBlob(blob, filename){ const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000); }
function exportExcel(){ const html = `<html><head><meta charset="UTF-8"></head><body>${buildExportHtml()}</body></html>`; downloadBlob(new Blob([html],{type:"application/vnd.ms-excel"}), `laporan-maqshof-${today()}.xls`); }
function exportPdf(){ window.print(); }
function makeExportElement(){ const div=document.createElement("div"); div.className="export-area"; div.innerHTML=buildExportHtml(); document.body.appendChild(div); return div; }
function htmlToCanvasBlob(el){
  return new Promise(resolve=>{
    const w = 760, h = Math.max(900, el.scrollHeight + 48);
    const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h; const ctx=canvas.getContext("2d");
    ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,w,h); ctx.fillStyle="#111827"; ctx.font="bold 24px Arial"; ctx.fillText("Laporan MAQSHOF",24,36);
    ctx.font="14px Arial"; let y=70;
    const filter=document.getElementById("filterTanggal").value || "Semua tanggal"; ctx.fillText(`Filter: ${filter}`,24,y); y+=28;
    currentLaporan.forEach(l=>{
      ctx.font="bold 18px Arial"; ctx.fillText(l.tanggal,24,y); y+=24; ctx.font="13px Arial"; ctx.fillText(l.catatan || "-",24,y); y+=20;
      ctx.font="bold 12px Arial"; const cols=["Item","Masuk","Sisa","Terjual","Total"]; const xs=[24,280,350,420,510]; cols.forEach((c,i)=>ctx.fillText(c,xs[i],y)); y+=18; ctx.font="12px Arial";
      l.items.forEach(i=>{ if(y>h-40) return; ctx.fillText(String(i.nama).slice(0,32),24,y); ctx.fillText(String(i.masuk),280,y); ctx.fillText(String(i.sisa),350,y); ctx.fillText(String(i.terjual),420,y); ctx.fillText(rupiah(i.total),510,y); y+=18; }); y+=16;
    });
    canvas.toBlob(resolve, "image/png");
  });
}
async function exportImage(returnFile=false){ const el=makeExportElement(); const blob=await htmlToCanvasBlob(el); el.remove(); const file=new File([blob], `laporan-maqshof-${today()}.png`, {type:"image/png"}); if(returnFile) return file; downloadBlob(blob, file.name); }
async function shareWa(){
  const number = cleanPhone(await getSetting("waNumber"));
  const msg = `Laporan MAQSHOF ${document.getElementById("filterTanggal").value || "semua tanggal"}`;
  try{
    const file = await exportImage(true);
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({ title:"Laporan MAQSHOF", text:msg, files:[file] });
      return;
    }
  }catch(e){ console.log(e); }
  const url = number ? `https://wa.me/${number}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

function setupTabs(){ document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{ document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active")); document.querySelectorAll(".page").forEach(p=>p.classList.remove("active")); btn.classList.add("active"); document.getElementById(btn.dataset.page).classList.add("active"); })); }
function setupEvents(){
  document.getElementById("simpanBtn").addEventListener("click", simpanLaporan);
  document.getElementById("simpanItemBtn").addEventListener("click", simpanItem);
  document.getElementById("batalEditBtn").addEventListener("click", batalEdit);
  document.getElementById("simpanWaBtn").addEventListener("click", saveWa);
  document.getElementById("exportExcelBtn").addEventListener("click", exportExcel);
  document.getElementById("exportPdfBtn").addEventListener("click", exportPdf);
  document.getElementById("exportImageBtn").addEventListener("click", ()=>exportImage(false));
  document.getElementById("shareWaBtn").addEventListener("click", shareWa);
  document.getElementById("filterTanggal").addEventListener("change", e=>renderLaporan(e.target.value || null));
  document.getElementById("lihatSemuaBtn").addEventListener("click",()=>{ document.getElementById("filterTanggal").value=""; renderLaporan(); });
  document.getElementById("hapusSemuaBtn").addEventListener("click", async()=>{ if(confirm("Yakin hapus semua laporan? Item setting tidak ikut terhapus.")){ await clearStore("laporan"); await renderLaporan(); } });
}
async function init(){
  document.getElementById("tanggalInput").value = today(); document.getElementById("filterTanggal").value = today();
  await openDB(); await seedItems(); setupTabs(); setupEvents(); await loadSettings(); await renderInput(); await renderItems(); await renderLaporan(today());
  if("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
}
init();
