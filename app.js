const DB_NAME = 'kasir_pwa_db';
const DB_VERSION = 1;
let dbPromise;

export function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('produk')) db.createObjectStore('produk', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('transaksi')) db.createObjectStore('transaksi', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('setting')) db.createObjectStore('setting', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function store(name, mode = 'readonly') {
  const db = await openDB();
  return db.transaction(name, mode).objectStore(name);
}

export async function getAll(name) {
  const s = await store(name);
  return new Promise((resolve, reject) => {
    const req = s.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function put(name, value) {
  const s = await store(name, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = s.put(value);
    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}

export async function remove(name, id) {
  const s = await store(name, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = s.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function seedProduk() {
  const existing = await getAll('produk');
  if (existing.length) return;
  const contoh = [
    { id: crypto.randomUUID(), nama: 'Es Teh', hargaModal: 2000, hargaJual: 3000, stok: 50, kategori: 'Minuman' },
    { id: crypto.randomUUID(), nama: 'Snack', hargaModal: 2500, hargaJual: 4000, stok: 30, kategori: 'Makanan' }
  ];
  for (const item of contoh) await put('produk', item);
}
