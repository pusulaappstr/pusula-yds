// Pusula YDS çevrimdışı çalışma. Yeni sürüm yayınlarken SURUM değerini artırın.
const SURUM = "pusula-v1";
const CEKIRDEK = ["./", "index.html", "app.js", "styles.css", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png",
  "data/words.json", "data/grammar.json", "data/questions.json", "data/reading.json", "audio/us.json", "audio/uk.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(SURUM).then(c => c.addAll(CEKIRDEK)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  // Ses dosyaları: önce önbellek, yoksa indirip sakla
  if (u.origin === location.origin && u.pathname.endsWith(".mp3")) {
    e.respondWith(caches.open(SURUM).then(c => c.match(r, { ignoreSearch:true }).then(hit => hit || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }))));
    return;
  }
  // Uygulama ve içerik: önce ağ (güncel içerik), bağlantı yoksa önbellek
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(SURUM).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r, { ignoreSearch:true }).then(hit => hit || caches.match("index.html"))));
    return;
  }
  // Yazı tipleri: önbellekte varsa onu kullan, arka planda yenile
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.open(SURUM).then(c => c.match(r).then(hit => { const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; })));
  }
});
