/* Pusula YDS — tek dosyalık uygulama mantığı. Veri: data/*.json. Durum: localStorage. */
(() => {
"use strict";
const KEY = "pusula-v1";
const LVN = {1:"A1",2:"A2",3:"B1",4:"B2",5:"C1"};
const INT = [0,1,3,7,16,35,70];
const TYPES = {
  vocab:{n:"Kelime bilgisi", s:"Boşluğa uygun kelime", ic:"abc"},
  grammar:{n:"Dilbilgisi", s:"Zamanlar, bağlaçlar, yapılar", ic:"gram"},
  cloze:{n:"Cloze test", s:"Paragrafta 5 boşluk", ic:"cloze"},
  completion:{n:"Cümle tamamlama", s:"Cümlenin devamını bul", ic:"comp"},
  trans_en:{n:"Çeviri İng → Tr", s:"En doğru Türkçe karşılık", ic:"tr"},
  trans_tr:{n:"Çeviri Tr → İng", s:"En doğru İngilizce karşılık", ic:"tr"},
  reading:{n:"Okuma soruları", s:"YDS tarzı paragraflar", ic:"book"},
  dialog:{n:"Diyalog tamamlama", s:"Konuşmadaki boşluğu bul", ic:"chat"},
  restatement:{n:"Anlamca en yakın", s:"Aynı anlamı veren cümle", ic:"eq"},
  paracomp:{n:"Paragraf tamamlama", s:"Boşluğa uygun cümle", ic:"para"},
  irrelevant:{n:"Anlamı bozan cümle", s:"Akışa uymayan cümle", ic:"odd"}
};
// Gerçek YDS dağılımı (80 soru)
const EXAM_PLAN = [["vocab",6],["grammar",10],["cloze",10],["completion",10],["trans_en",3],["trans_tr",3],["reading",20],["dialog",5],["restatement",4],["paracomp",4],["irrelevant",5]];

/* ---------- ikonlar ---------- */
const P = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  home:P('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
  cards:P('<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>'),
  target:P('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
  book:P('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'),
  exam:P('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
  gear:P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  back:P('<path d="M15 18l-6-6 6-6"/>'),
  speak:P('<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>'),
  heart:P('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>'),
  heartF:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  flame:P('<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z"/>'),
  abc:P('<path d="M4 18l4-12 4 12M5.5 14h5"/><path d="M15 6h3a2.5 2.5 0 0 1 0 5h-3zM15 11h3.5a2.5 2.5 0 0 1 0 5H15z"/>'),
  gram:P('<path d="M4 6h16M4 12h10M4 18h7"/>'),
  cloze:P('<path d="M4 7h4M12 7h8M4 12h8M16 12h4M4 17h2M10 17h10"/>'),
  comp:P('<path d="M4 8h10M4 14h6"/><path d="M14 17l3 3 4-6"/>'),
  tr:P('<path d="M4 6h8M8 4v2M6 6c0 4 3 7 6 8"/><path d="M12 20l4-9 4 9M13.5 17h5"/>'),
  eq:P('<path d="M5 9h14M5 15h14"/>'),
  para:P('<path d="M4 6h16M4 10h16"/><path d="M4 14h5" stroke-dasharray="2 2"/><path d="M4 18h16"/>'),
  chat:P('<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'),
  odd:P('<path d="M4 6h16M4 12h16M4 18h16"/><path d="M17 9l4 6M21 9l-4 6"/>'),
  wrong:P('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'),
  check:P('<path d="M5 12l5 5 9-10"/>'),
  quiz:P('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.8 1c0 2-2.3 2.2-2.3 4M12 17h.01"/>'),
  list:P('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  rose:'<svg class="rose" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 6 L58 50 L50 94 L42 50 Z" fill="currentColor"/><path d="M6 50 L50 42 L94 50 L50 58 Z" fill="currentColor" opacity=".6"/></svg>'
};

/* ---------- yardımcılar ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const dayNum = (d = new Date()) => Math.floor((d - d.getTimezoneOffset()*60000) / 86400000);
const dayKey = (n = dayNum()) => String(n);
function rng(seed){ let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function shuffle(a, r = Math.random){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const L = n => "ABCDE"[n];
function toast(msg, ms = 2200){ const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms); }
/* Telaffuz: önce uygulamayla gelen gerçek ses kayıtları (Amerikan / İngiliz), yoksa cihazın ses motoru */
const AUD = { idx:{}, buf:{}, ctx:null, src:null };
function audioIndex(acc){ return AUD.idx[acc] || (AUD.idx[acc] = fetch(`audio/${acc}.json`).then(r => r.ok ? r.json() : {}).catch(() => ({}))); }
function audioChunk(acc, n){ const k = acc + n; return AUD.buf[k] || (AUD.buf[k] = fetch(`audio/${k}.mp3`).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(b => new Promise((ok, no) => AUD.ctx.decodeAudioData(b, ok, no))).catch(e => { delete AUD.buf[k]; throw e; })); }
// Cihaz sesinin yanlış okuyabileceği eş yazımlı ifadeler için okunuş ipucu (yalnızca seslendirmede kullanılır, ekranda görünmez)
const TTS_FIX = { "wind up":"wined up", "close down":"cloze down", "tear down":"tare down", "convict":"to convict" };
function ttsSpeak(text, acc){
  text = TTS_FIX[String(text).toLowerCase()] || text;
  try {
    const ss = window.speechSynthesis; if (!ss) return false;
    const lang = acc === "uk" ? "en-GB" : "en-US", vs = ss.getVoices();
    const v = vs.find(x => x.lang.replace("_", "-") === lang && /natural|google|samantha|daniel|serena|premium|enhanced/i.test(x.name)) || vs.find(x => x.lang.replace("_", "-") === lang) || vs.find(x => /^en/i.test(x.lang));
    const u = new SpeechSynthesisUtterance(text); u.lang = lang; if (v) u.voice = v; u.rate = .9;
    if (ss.speaking || ss.pending) ss.cancel();
    setTimeout(() => ss.speak(u), 60); return true;
  } catch(e){ return false; }
}
function speak(text, acc){
  acc = acc || S.settings.accent || "us";
  const t = String(text).replace(/\s*\(.*?\)/g, "").replace(/™/g, "").trim(), key = t.toLowerCase();
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !AUD.ctx) AUD.ctx = new AC();
    if (AUD.ctx && AUD.ctx.state === "suspended") AUD.ctx.resume();
  } catch(e){ AUD.ctx = null; }
  if (!AUD.ctx){ ttsSpeak(t, acc); return; }
  audioIndex(acc).then(ix => {
    const e = ix[key]; if (!e) throw 0;
    return audioChunk(acc, e[0]).then(buf => {
      try { AUD.src && AUD.src.stop(); } catch(_){}
      const src = AUD.ctx.createBufferSource(); src.buffer = buf; src.connect(AUD.ctx.destination); src.start(0, e[1], e[2]); AUD.src = src;
    });
  }).catch(() => { if (!ttsSpeak(t, acc)) toast("Bu cihazda ses çalınamadı"); });
}

/* ---------- durum ---------- */
const fresh = () => ({ v:1, profile:null, cards:{}, favs:[], qs:{}, wrong:[], days:{}, exams:[], run:null, read:{}, settings:{ theme:"system", levels:[1,2,3,4,5], starOnly:false, accent:"us" } , newDay:0, newCount:0 });
/* Kayıtlı durumu / yedeği eksik alanlara karşı tamamlar */
function norm(s){ const o = Object.assign(fresh(), s); o.settings = Object.assign(fresh().settings, s.settings || {}); if (!o.settings.lv5 || !Array.isArray(o.settings.levels) || !o.settings.levels.length){ o.settings.lv5 = 1; o.settings.levels = [1,2,3,4,5]; } return o; }
function load(){ try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return norm(s); } catch(e){} return fresh(); }
let S = load();
let saveWarned = false;
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){ if (!saveWarned){ saveWarned = true; toast("İlerlemen bu cihaza kaydedilemiyor. Depolama dolu ya da gizli sekme açık olabilir.", 6000); } } }
function day(){ const k = dayKey(); const x = S.days[k] || (S.days[k] = { w:0, n:0, q:0, c:0, r:0 }); if (!x.r) x.r = 0; return x; }
function streak(){ let n = 0, d = dayNum(); const act = k => { const x = S.days[String(k)]; return x && ((x.w || 0) + (x.q || 0) + (x.r || 0)) > 0; };
  // Seri koruma: 7 günde bir, iki çalışma günü arasındaki tek boş gün seriyi bozmaz
  if (!act(d)) d--; let fz = Infinity;
  for (;;){ if (act(d)){ n++; d--; } else if (act(d - 1) && fz - d >= 7){ fz = d; d--; } else break; }
  return n; }
// "Bugün girsen": soru tipi başarısını gerçek sınav dağılımına uygular
function projection(){
  const all = Object.values(S.qs).flatMap(x => x.h || []); if (all.length < 30) return null;
  const overall = all.filter(x => x[1]).length / all.length; let pts = 0, worst = null;
  EXAM_PLAN.forEach(([k, n]) => { const s = typeStats(k), acc = s.acc === null ? overall * 100 : s.acc, loss = n * (1 - acc / 100);
    pts += n * acc / 100; if (!worst || loss > worst.loss) worst = { k, loss }; });
  return { score:Math.round(pts * 1.25), worst:TYPES[worst.k].n, wk:worst.k };
}
function weekSummary(){
  const t = dayNum(); let w = 0, n = 0, q = 0, c = 0, act = 0;
  for (let k = 0; k < 7; k++){ const x = S.days[String(t - k)]; if (!x) continue; w += x.w || 0; n += x.n || 0; q += x.q || 0; c += x.c || 0; if ((x.w || 0) + (x.q || 0) + (x.r || 0)) act++; }
  return { w, n, q, c, act };
}
function gauge(v, t){
  const C = 157.08, ang = x => Math.PI * (1 - x / 100), pt = (x, r) => [60 + r * Math.cos(ang(x)), 60 - r * Math.sin(ang(x))];
  const [tx1, ty1] = pt(t, 40), [tx2, ty2] = pt(t, 56), val = v == null ? 0 : Math.max(0, Math.min(100, v));
  return `<svg class="gauge" viewBox="0 0 120 70" role="img" aria-label="${v == null ? "Tahmini puan henüz yok" : `Tahmini puan ${v}, hedef ${t}`}">
    <path d="M10 60 A50 50 0 0 1 110 60" class="g-track"/>
    <path d="M10 60 A50 50 0 0 1 110 60" class="g-fill" style="stroke-dasharray:${(C * val / 100).toFixed(1)} ${C}"/>
    <line x1="${tx1.toFixed(1)}" y1="${ty1.toFixed(1)}" x2="${tx2.toFixed(1)}" y2="${ty2.toFixed(1)}" class="g-target"/>
    <g class="g-needle" style="transform:rotate(${(val * 1.8 - 90).toFixed(1)}deg)"><path d="M58 60 L60 18 L62 60 Z"/></g><circle cx="60" cy="60" r="5" class="g-hub"/></svg>`;
}
function applyTheme(){ const t = S.settings.theme; if (t === "system") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", t); }

/* ---------- veri ---------- */
/* Mağaza sürümü ayarları */
const STORE_URL = "https://play.google.com/store/apps/details?id=com.pusulayds.app";
const DEV_NAME = "Pusula Apps"; // Geliştirici / veri sorumlusu adı (Gizlilik Politikası'nda görünür). Yayından önce doldurulmalı.
const DEV_MAIL = "pusulaappstr@gmail.com"; // İletişim e-postası (Gizlilik Politikası'nda görünür). Yayından önce doldurulmalı.
const CONTENT_URL = ""; // Yeni içeriklerin yayınlandığı adres (ör. https://kullanici.github.io/pusula-icerik). Boşsa uygulama sadece kendi içeriğini kullanır.
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const shareUrl = () => NATIVE ? STORE_URL : location.href.split("?")[0];
let W = [], G = [], Q = [], CL = [], R = [], QI = {}, DICT = {}, PH = {};
async function loadData(){
  const get = async f => (await fetch(f)).json();
  const [w, g, q, r] = await Promise.all([get("data/words.json"), get("data/grammar.json"), get("data/questions.json"), get("data/reading.json")]);
  W = w; G = g; Q = q.q; CL = q.cloze; R = r;
  try { mergeExtra(JSON.parse(localStorage.getItem("pusula-extra") || "null")); } catch(e){}
  if (CONTENT_URL) fetchExtra();
  genVocab();
  Q.forEach(x => QI[x.id] = x);
  W.forEach((x, i) => { const b = x[0].replace(/\s*\(.*?\)/, "").replace(/™/g, ""); for (const f of b.split(/\s*,\s*/)){ const k = f.toLowerCase(); (DICT[k] || (DICT[k] = [])).push(i); if (f.includes(" ")) (PH[k.split(" ")[0]] || (PH[k.split(" ")[0]] = [])).push(k.split(" ")); } });
}
/* Uzaktan yeni içerik: sadece yeni id'li metin ve sorular eklenir, mevcutlara dokunulmaz */
function mergeExtra(x){ if (!x) return; const rid = new Set(R.map(r => r.id)), qid = new Set(Q.map(q => q.id)); (x.r || []).forEach(r => { if (!rid.has(r.id)) R.push(r); }); (x.q || []).forEach(q => { if (!qid.has(q.id) && !q.id.startsWith("gv")){ Q.push(q); QI[q.id] = q; } }); }
async function fetchExtra(){
  try {
    const t = u => Promise.race([fetch(`${CONTENT_URL}/${u}?v=${dayNum()}`).then(r => r.json()), new Promise((_, no) => setTimeout(no, 5000))]);
    const [r, q] = await Promise.all([t("data/reading.json"), t("data/questions.json")]);
    const x = { r, q:q.q }; try { localStorage.setItem("pusula-extra", JSON.stringify(x)); } catch(e){} const n = R.length; mergeExtra(x); if (R.length > n) toast(`${R.length - n} yeni okuma metni eklendi`);
  } catch(e){}
}
/* Kelime verisinden otomatik boşluk doldurma soruları: her kelimenin örnek cümlesi bir soruya dönüşür */
function genVocab(){
  const byLv = {}; W.forEach((w, i) => (byLv[w[2] + w[1].split(/[ ,.]/)[0]] || (byLv[w[2] + w[1].split(/[ ,.]/)[0]] = [])).push(i));
  W.forEach((w, i) => {
    const base = w[0].replace(/\s*\(.*?\)/, ""); if (base.includes(" ") || base.length < 3 || !w[4]) return;
    const re = new RegExp(`\\b${base.replace(/[^a-z]/gi, "").slice(0, Math.max(3, base.length - (base.endsWith("e") ? 1 : 0)))}[a-z]*`, "i");
    const m = w[4].match(re); if (!m || m[0].length > base.length + 4) return;
    const pool = (byLv[w[2] + w[1].split(/[ ,.]/)[0]] || []).filter(k => k !== i && !W[k][0].includes(" ") && W[k][0] !== base), r = rng(i + 7);
    if (pool.length < 4) return;
    const ds = []; while (ds.length < 4){ const k = pool[Math.floor(r() * pool.length)]; if (!ds.includes(k)) ds.push(k); }
    const opts = shuffle([i, ...ds], r), suf = m[0].slice(base.replace(/e$/, "").length);
    Q.push({ id:`gv${i}`, t:"vocab", g:"", q:w[4].replace(m[0], "----"), o:opts.map(k => W[k][0].replace(/\s*\(.*?\)/, "")), a:opts.indexOf(i), e:`Doğru cevap "${base}" (${w[3]}). Cümle: ${w[5]}${suf && suf !== "e" ? ` Not: cümlede kelime "${m[0]}" biçiminde geçiyor.` : ""}` });
  });
}
// sözcük: [kelime, tür, seviye, türkçe, örnek, örnek-tr, eş anlamlı, yds]

/* ---------- gezinme ---------- */
let stack = [{ tab:"home" }];
const cur = () => stack[stack.length - 1];
function go(v){ if (v.view === "wordQuiz") WQ = null; stack.push(v); render(true); }
function back(){ if (stack.length > 1){ stack.pop(); render(true); } }
function tab(t){ stack = [{ tab:t }]; render(true); }
/* Geri (Android geri tuşu, Escape): önce en üstteki pencere kapanır, sonra bir önceki ekrana, en son Bugün sekmesine dönülür. Bugün ekranında geri tuşu uygulamadan çıkar. */
const topSheet = () => { const a = document.querySelectorAll(".sheet-back"); return a[a.length - 1]; };
const canBack = () => !!topSheet() || (!!S.profile && (stack.length > 1 || cur().tab !== "home"));
function stepBack(){ const sh = topSheet(); if (sh){ sh.remove(); return true; } if (!S.profile) return false; if (stack.length > 1){ back(); return true; } if (cur().tab !== "home"){ tab("home"); return true; } return false; }
let trapped = false, skipPop = 0;
try { trapped = !!(history.state && history.state.pusula); } catch(e){}
function syncHist(){
  try {
    const need = canBack();
    if (need && !trapped){ history.pushState({ pusula:1 }, ""); trapped = true; }
    else if (!need && trapped){ trapped = false; skipPop++; history.back(); }
  } catch(e){}
}
window.addEventListener("popstate", () => { if (skipPop){ skipPop--; return; } trapped = false; stepBack(); syncHist(); });
new MutationObserver(syncHist).observe(document.body, { childList:true });
window.addEventListener("keydown", e => { if (e.key === "Escape") stepBack(); });
try { const CapApp = window.Capacitor?.Plugins?.App; CapApp?.addListener?.("backButton", () => { if (!stepBack()) CapApp.exitApp?.(); }); } catch(e){}

/* ---------- çizim ---------- */
function shell(title, body, opts = {}){
  const t = [...stack].reverse().find(x => x.tab)?.tab;
  const nav = [["home","Bugün",I.home],["words","Kelime",I.cards],["practice","Pratik",I.target],["read","Okuma",I.book],["exam","Deneme",I.exam]];
  return `<div class="shell">
    <header class="top"><div class="top-in">
      ${stack.length > 1 ? `<button class="iconbtn" data-act="back" aria-label="Geri">${I.back}</button>` : ""}
      <h1>${title}</h1>${opts.right || ""}
      ${opts.noGear ? "" : `<button class="iconbtn" data-act="settings" aria-label="Ayarlar">${I.gear}</button>`}
    </div></header>
    <main id="main">${body}</main>
    <nav class="tabs" aria-label="Bölümler"><div class="in">${nav.map(([k, n, ic]) => `<button data-tab="${k}" ${t === k ? 'aria-current="page"' : ""}><span class="pill">${ic}</span>${n}</button>`).join("")}</div></nav>
  </div>`;
}
let after = null;
function render(scrollTop){
  if (!S.profile){ $("#app").innerHTML = onboarding(); bindOnb(); syncHist(); return; }
  const v = cur(); after = null;
  const views = { home, words, practice, read, exam, wordStudy, wordList, wordQuiz, lesson, lessons, qsession, reader, examRun, examResult, stats, strategy };
  const fn = views[v.view || v.tab];
  $("#app").innerHTML = fn(v);
  document.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => tab(b.dataset.tab));
  document.querySelectorAll("[data-act=back]").forEach(b => b.onclick = back);
  document.querySelectorAll("[data-act=settings]").forEach(b => b.onclick = settings);
  document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(JSON.parse(b.dataset.go)));
  if (after) after();
  if (scrollTop) window.scrollTo(0, 0);
  syncHist();
}
const goAttr = o => `data-go='${JSON.stringify(o).replace(/'/g, "&#39;")}'`;

/* ---------- karşılama ---------- */
let onb = { target:70, daily:20, date:"" };
function onboarding(){
  return `<div class="onb">
    <div class="brandmark" style="color:var(--brand)">${I.rose.replace('class="rose"', 'width="48" height="48"')}</div>
    <h1>Pusula YDS</h1>
    <p class="muted">Kelime, dilbilgisi, YDS soru tipleri ve deneme sınavları tek yerde. Birkaç bilgiyle planını hazırlayalım.</p>
    <div class="card stack">
      <span class="eyebrow">Hedef puan</span>
      <div class="choice c3" id="oT" role="group" aria-label="Hedef puan">${[50,60,70,80,90,100].map(n => `<button data-v="${n}" aria-pressed="${onb.target === n}">${n}</button>`).join("")}</div>
      <span class="eyebrow">Günde kaç yeni kelime?</span>
      <div class="choice" id="oD" role="group" aria-label="Günlük yeni kelime sayısı">${[10,20,30,40].map(n => `<button data-v="${n}" aria-pressed="${onb.daily === n}">${n}</button>`).join("")}</div>
      <label class="field" for="oDate">Sınav tarihi (biliyorsan)<input type="date" id="oDate" value="${onb.date}"></label>
    </div>
    <button class="btn block" id="oGo">Başla</button>
    <p class="tiny muted">İlerlemen yalnızca bu cihazda saklanır. Hesap gerekmez, internet olmadan da çalışır. Başlayarak <button class="link tiny" data-legal="terms" style="padding:0">Kullanım Koşulları</button>'nı ve <button class="link tiny" data-legal="privacy" style="padding:0">Gizlilik Politikası</button>'nı kabul etmiş olursun.</p>
  </div>`;
}
function bindOnb(){
  const pick = (id, k) => document.querySelectorAll(`#${id} button`).forEach(b => b.onclick = () => { onb[k] = +b.dataset.v; document.querySelectorAll(`#${id} button`).forEach(x => x.setAttribute("aria-pressed", x === b)); });
  pick("oT", "target"); pick("oD", "daily");
  $("#oGo").onclick = () => { onb.date = $("#oDate").value; S.profile = { target:onb.target, daily:onb.daily, date:onb.date, start:dayNum() }; save(); render(true); };
}

/* ---------- SRS ---------- */
function wStatus(i){ const c = S.cards[i]; if (!c) return 0; return c.b >= 3 ? 3 : (c.b >= 1 ? 2 : 1); }
function inScope(i){ const w = W[i]; return S.settings.levels.includes(w[2]) && (!S.settings.starOnly || w[7]); }
function resetNewDay(){ if (S.newDay !== dayNum()){ S.newDay = dayNum(); S.newCount = 0; } }
function dueList(){ const t = dayNum(); return Object.keys(S.cards).map(Number).filter(i => S.cards[i].d <= t && inScope(i)).sort((a, b) => S.cards[a].d - S.cards[b].d); }
let ORDER = null;
function newOrder(){
  if (ORDER) return ORDER; const r = rng(2024);
  const by = l => shuffle(W.map((w, i) => w[2] === l ? i : -1).filter(i => i >= 0), r).sort((a, b) => W[b][7] - W[a][7]);
  // YDS için öncelik: önce C1 ve B2, sonra B1, A2, A1
  ORDER = [...by(5), ...by(4), ...by(3), ...by(2), ...by(1)]; return ORDER;
}
// Hedef puana göre düzey önceliği (5=C1 … 1=A1). Her düzeyde önce yıldızlı (YDS'de sık çıkan) kelimeler, sonra diğerleri; seçim her seferinde rastgele.
function levelOrder(){ const t = (S.profile && S.profile.target) || 70; return t >= 90 ? [5, 4, 3, 2, 1] : t >= 70 ? [4, 5, 3, 2, 1] : [3, 4, 2, 5, 1]; }
function levelHint(){ const t = (S.profile && S.profile.target) || 70, o = levelOrder(); return `Hedefin ${t} puan: yeni kelimeler önce ${LVN[o[0]]}, sonra ${LVN[o[1]]} düzeyinden gelir.`; }
function freshWords(n){
  const out = []; if (n <= 0) return out;
  const pool = []; for (let i = 0; i < W.length; i++) if (!S.cards[i] && inScope(i)) pool.push(i);
  for (const l of levelOrder()) for (const st of [1, 0]){
    if (out.length >= n) return out;
    out.push(...shuffle(pool.filter(i => W[i][2] === l && (W[i][7] ? 1 : 0) === st)).slice(0, n - out.length));
  }
  return out;
}
function grade(i, a){
  const t = dayNum(), isNew = !S.cards[i]; const c = S.cards[i] || { b:0, d:t };
  if (a === 0){ c.b = 1; c.d = t; } else if (a === 1){ c.b = Math.max(1, Math.min(c.b, 2)); c.d = t + 1; } else { c.b = Math.min(6, c.b + 1); c.d = t + INT[c.b]; }
  S.cards[i] = c; const d = day(); d.w++; if (isNew){ d.n++; S.newCount++; } save();
}

/* ---------- BUGÜN ---------- */
function home(){
  resetNewDay(); checkBadges();
  const p = S.profile, d = day(), due = dueList().length, left = Math.min(Math.max(0, p.daily - S.newCount), freshWords(p.daily).length);
  const daysLeft = p.date ? Math.round((new Date(p.date + "T00:00") - new Date(new Date().toDateString())) / 86400000) : null;
  const learned = Object.values(S.cards).filter(c => c.b >= 3).length;
  const est = estimate();
  const wk = []; for (let k = 6; k >= 0; k--){ const n = dayNum() - k, x = S.days[String(n)] || {}; wk.push({ n, v:(x.w || 0) + (x.q || 0) * 2, lbl:["Pz","Pt","Sa","Ça","Pe","Cu","Ct"][new Date((n) * 86400000).getUTCDay()] }); }
  const mx = Math.max(10, ...wk.map(x => x.v));
  const qToday = d.q, rToday = d.r;
  const goals = [
    { ic:I.cards, t:"Kelime tekrarı", s:due ? `${due} kart tekrar zamanı geldi` : "Bugünkü tekrarlar bitti", done:!due && d.w > 0, go:{ view:"wordStudy" }, btn:due ? "Başla" : "" },
    { ic:I.abc, t:"Yeni kelimeler", s:left ? `${left} yeni kelime kaldı` : S.newCount >= p.daily ? `${p.daily} yeni kelime tamam` : "Seçili seviyelerde yeni kelime kalmadı", done:!left, go:{ view:"wordStudy" }, btn:left ? "Öğren" : "Devam et" },
    { ic:I.target, t:"Günün soruları", s:qToday >= 10 ? `${qToday} soru çözdün` : `${Math.max(0, 10 - qToday)} soru kaldı`, done:qToday >= 10, go:{ view:"qsession", type:"mix" }, btn:qToday >= 10 ? "Devam" : "Çöz" },
    { ic:I.book, t:"Günün metni", s:rToday ? "Bugün okudun" : "Bir metin oku", done:rToday > 0, go:{ view:"reader", id:dailyText() }, btn:rToday ? "" : "Oku" }
  ];
  return shell("Bugün", `
    <section class="card hero stack">${I.rose}
      <span class="eyebrow" style="color:inherit;opacity:.8">${greet()}</span>
      ${daysLeft !== null && daysLeft >= 0 ? `<div class="row" style="align-items:flex-end;gap:12px"><span class="countdown num">${daysLeft}</span><span style="padding-bottom:8px">gün kaldı<br><span class="muted small">Hedef: ${p.target} puan</span></span></div>`
        : `<h2>Hedef: ${p.target} puan</h2><span class="muted small">${daysLeft !== null && daysLeft < 0 ? "Sınav tarihin geçmiş görünüyor; Ayarlar'dan güncelleyebilirsin." : "Sınav tarihini Ayarlar'dan ekleyebilirsin."}</span>`}
      <div class="row small" style="gap:16px"><span class="row" style="gap:6px">${I.flame.replace("<svg", '<svg width="18" height="18"')} <b class="num pop">${streak()}</b> gün seri</span><span><b class="num">${learned}</b> kelime öğrenildi</span></div>
    </section>
    <section class="card"><div class="sec" style="margin:0 0 4px">Bugünün planı</div>
      ${goals.map(g => `<div class="goal ${g.done ? "done" : ""}"><span class="ic">${g.done ? I.check : g.ic}</span><span><b>${g.t}</b><span class="small muted">${g.s}</span></span>${g.btn ? `<button class="btn soft" ${goAttr(g.go)}>${g.btn}</button>` : ""}</div>`).join("")}
    </section>
    ${dailyCards()}
    ${levelMap()}
    <section class="grid2">
      <div class="card stat gauge-card"><span class="eyebrow">Pusulan</span>${gauge(est ? est.score : null, p.target)}<span class="row between" style="align-items:baseline"><span class="v num">${est ? est.score : "–"}</span><span class="small muted">hedef ${p.target}</span></span><span class="small muted">${est ? (est.score >= p.target ? "Hedefin üzerindesin, böyle devam!" : `Hedefe ${p.target - est.score} puan kaldı · son ${est.n} soru`) : "30 soru çözünce ibre oynar"}</span></div>
      <div class="card stat"><span class="eyebrow">Bu hafta</span><span class="v num">${wk.reduce((a, x) => a + (S.days[String(x.n)]?.q || 0), 0)}</span><span class="small muted">soru çözüldü</span></div>
    </section>
    ${(() => { const pr = projection(); return pr ? `<section class="card stack"><span class="eyebrow">Bugün girsen</span><div class="row" style="align-items:baseline;gap:8px"><span class="stat"><span class="v num">≈ ${pr.score}</span></span><span class="small muted">puan (soru tipi başarına göre)</span></div><span class="small">En çok puanı <b>${pr.worst}</b> bölümünde kaybediyorsun.</span><button class="btn soft" ${goAttr(pr.wk === "reading" ? { tab:"read", filter:"YDS Paragraf" } : { view:"qsession", type:pr.wk })}>Bu bölümü çalış</button></section>` : ""; })()}
    ${(() => { const ws = weekSummary(); return ws.act ? `<section class="card stack"><div class="row between"><span class="eyebrow">Bu haftanın özeti</span><button class="link" id="wkShare">Paylaş</button></div><div class="grid2"><span class="stat"><span class="v num">${ws.act}/7</span><span class="small muted">çalışılan gün</span></span><span class="stat"><span class="v num">${ws.n}</span><span class="small muted">yeni kelime</span></span><span class="stat"><span class="v num">${ws.q}</span><span class="small muted">soru çözüldü</span></span><span class="stat"><span class="v num">${ws.q ? Math.round(100 * ws.c / ws.q) + "%" : "–"}</span><span class="small muted">doğruluk</span></span></div></section>` : ""; })()}
    <section class="card stack"><div class="row between"><span class="eyebrow">Son 7 gün</span><button class="link small" ${goAttr({ view:"stats" })}>İstatistikler</button></div>
      <div class="week" role="img" aria-label="Son 7 günlük çalışma">${wk.map(x => `<div class="d"><div class="col ${x.v ? "" : "zero"}" style="height:${Math.max(4, 70 * x.v / mx)}%"></div><span class="lbl">${x.lbl}</span></div>`).join("")}</div>
    </section>`);
}
const FACTS = ["İngilizcede en sık kullanılan 1.000 kelime, günlük metinlerin yaklaşık %85'ini oluşturur.","YDS'de en çok puan getiren bölüm okuma; 80 sorunun yaklaşık 20'si paragraf sorusudur.","\"Set\" kelimesi, sözlüklerde en fazla anlamı olan İngilizce kelimelerden biridir.","Yeni bir kelimeyi kalıcı öğrenmek için onu farklı günlerde 5–7 kez görmek gerekir.","\"However\" ve \"therefore\" YDS paragraf sorularında cevabı en sık ele veren bağlaçlardır.","Uyumadan önce tekrar edilen kelimeler uykuda pekişir ve ertesi gün daha iyi hatırlanır.","İngilizcede \"-tion\" ile biten kelimelerin neredeyse hepsi isimdir.","Türkçedeki \"tren\", \"tiyatro\" ve \"istasyon\" gibi kelimeler Fransızca üzerinden gelmiştir; İngilizce karşılıkları çok benzerdir.","YDS'de yanlış cevaplar doğruları götürmez; boş bırakmak yerine tahmin etmek her zaman mantıklıdır.","\"Make\" üretmek, \"do\" yapmak için kullanılır: make a cake, do homework.","Akademik metinlerde \"may\", \"might\" ve \"suggest\" gibi kelimeler yazarın emin olmadığını gösterir.","Günde 20 yeni kelime öğrenen biri altı ayda 3.000'den fazla kelimeye ulaşır.","\"Since\" hem \"-den beri\" hem de \"çünkü\" anlamına gelebilir; anlamı cümle belirler.","\"Unless\" = \"if not\": Unless you study, you won't pass.","İngilizcede en sık kullanılan harf \"e\", en az kullanılan ise \"q\" harfidir."];
function wotd(){ const pool = W.map((w, i) => w[2] >= 3 && w[4] ? i : -1).filter(i => i >= 0); return pool[Math.floor(rng(dayNum() * 31)() * pool.length)]; }
function dailyCards(){
  const i = wotd(), w = W[i], dc = (S.dc || {})[dayKey()];
  after = () => { document.querySelectorAll("#wotd [data-acc]").forEach(b => b.onclick = () => speak(w[0], b.dataset.acc)); };
  return `<section class="card stack" id="wotd"><div class="row between"><span class="eyebrow">Günün kelimesi</span><span class="row" style="gap:6px"><button class="speak acc" data-acc="us" aria-label="Amerikan okunuşu">${I.speak}<i>US</i></button><button class="speak acc" data-acc="uk" aria-label="İngiliz okunuşu">${I.speak}<i>UK</i></button></span></div>
    <div class="row" style="gap:10px;align-items:baseline"><b style="font-family:var(--display);font-size:28px">${esc(w[0].replace(/\s*\(.*?\)/, ""))}</b><span class="lv lv${w[2]}">${LVN[w[2]]}</span></div><b>${esc(w[3])}</b><span class="small"><i>${esc(w[4])}</i><br><span class="muted">${esc(w[5])}</span></span>
    <div class="tip" style="margin-top:6px"><b>Biliyor muydun?</b><br>${esc(FACTS[dayNum() % FACTS.length])}</div></section>
  <section class="card row between"><span class="stack" style="gap:2px"><span class="eyebrow">Günlük meydan okuma</span><b>${dc === undefined ? "Herkese aynı 5 soru" : `Bugün ${dc}/5 yaptın`}</b><span class="small muted">${dc === undefined ? "Çöz, sonucunu arkadaşlarınla paylaş" : "Yarın yeni sorular gelecek"}</span></span><button class="btn ${dc === undefined ? "" : "soft"}" ${goAttr({ view:"qsession", type:"daily" })}>${dc === undefined ? "Başla" : "Tekrar çöz"}</button></section>`;
}
function levelStats(){ return [1,2,3,4,5].map(l => { const ids = W.map((w, i) => w[2] === l ? i : -1).filter(i => i >= 0); const ok = ids.filter(i => S.cards[i] && S.cards[i].b >= 3).length; return { l, n:ids.length, ok, p:ids.length ? Math.round(100 * ok / ids.length) : 0 }; }); }
function levelMap(){
  return `<section class="card stack"><div class="row between"><span class="eyebrow">Seviye haritan</span><span class="small muted">öğrenilen kelimeler</span></div>${levelStats().map(x => `<div class="row" style="gap:10px"><span class="lv lv${x.l}" style="min-width:34px;text-align:center">${LVN[x.l]}</span><div class="bar" style="flex:1"><i style="width:${x.p}%"></i></div><span class="small num muted" style="min-width:74px;text-align:right">${x.ok}/${x.n}</span></div>`).join("")}</section>`;
}
/* rozetler */
function badgeList(){
  const tot = Object.values(S.days).reduce((a, d) => ({ q:a.q + d.q, r:a.r + (d.r || 0) }), { q:0, r:0 }), learned = Object.values(S.cards).filter(c => c.b >= 3).length, st = streak(), ls = levelStats(), dcs = Object.values(S.dc || {});
  return [
    ["🔥","3 gün seri","3 gün üst üste çalış", st >= 3], ["🔥","7 gün seri","Bir hafta aralıksız", st >= 7], ["🏆","30 gün seri","Bir ay aralıksız", st >= 30],
    ["🌱","İlk 50 kelime","50 kelimeyi öğren", learned >= 50], ["🌿","500 kelime","500 kelimeyi öğren", learned >= 500], ["🌳","1.000 kelime","1.000 kelimeyi öğren", learned >= 1000],
    ["🎯","100 soru","100 soru çöz", tot.q >= 100], ["💯","1.000 soru","1.000 soru çöz", tot.q >= 1000],
    ["📖","Kitap kurdu","10 metin oku", Object.keys(S.read).length >= 10], ["⚡","Kusursuz gün","Günlük meydan okumada 5/5", dcs.includes(5)],
    ["📝","Deneme ustası","Bir deneme sınavı bitir", S.exams.length >= 1], ...ls.map(x => ["⭐", `${LVN[x.l]} ustası`, `${LVN[x.l]} kelimelerinin %80'ini öğren`, x.p >= 80])
  ].map(([ic, n, d, ok]) => ({ ic, n, d, ok }));
}
function checkBadges(){ const got = badgeList().filter(b => b.ok).map(b => b.n); S.bd = S.bd || got.slice(); const nw = got.filter(n => !S.bd.includes(n)); if (nw.length){ S.bd.push(...nw); save(); nw.forEach((n, k) => setTimeout(() => toast(`🏅 Yeni rozet: ${n}`), 400 + k * 2200)); } }
function greet(){ const h = new Date().getHours(); return h < 6 ? "İyi geceler" : h < 12 ? "Günaydın" : h < 18 ? "İyi günler" : "İyi akşamlar"; }
function dailyText(){ return R[dayNum() % R.length].id; }
function estimate(){
  const all = Object.values(S.qs).flatMap(x => x.h || []); if (all.length < 30) return null;
  const last = all.sort((a, b) => b[0] - a[0]).slice(0, 100); const acc = last.filter(x => x[1]).length / last.length;
  return { score:Math.round(acc * 100), n:last.length };
}

/* ---------- KELİME ---------- */
function words(){
  resetNewDay(); const due = dueList().length, left = Math.min(Math.max(0, S.profile.daily - S.newCount), freshWords(S.profile.daily).length);
  const cnt = l => { const ids = W.map((w, i) => w[2] === l ? i : -1).filter(i => i >= 0); return { all:ids.length, ok:ids.filter(i => wStatus(i) === 3).length }; };
  const favN = S.favs.length; after = bindLevels;
  return shell("Kelime", `
    <section class="card stack">
      <div class="row between"><div><span class="eyebrow">Bugün</span><h2 style="font-size:24px;margin-top:4px">${due} tekrar · ${left} yeni</h2></div></div>
      <button class="btn block" ${goAttr({ view:"wordStudy" })}>Kartlarla çalış</button>
      <div class="grid2"><button class="btn ghost" ${goAttr({ view:"wordQuiz" })}>${I.quiz} Hızlı test</button><button class="btn ghost" ${goAttr({ view:"wordList" })}>${I.list} Tüm kelimeler</button></div>
    </section>
    <section class="card stack"><span class="eyebrow">Çalışılacak seviyeler</span>
      <div class="chips" id="lvc">${[1,2,3,4,5].map(l => `<button class="chip" data-l="${l}" aria-pressed="${S.settings.levels.includes(l)}">${LVN[l]}</button>`).join("")}</div>
      <label class="row small" style="gap:8px;cursor:pointer"><input type="checkbox" id="starOnly" ${S.settings.starOnly ? "checked" : ""}> Sadece YDS'de sık çıkan kelimeler <span class="star">★</span></label>
      <p class="small muted" style="margin:0">${levelHint()}</p>
    </section>
    <div class="sec">Seviyeler <small>${W.length.toLocaleString("tr-TR")} kelime</small></div>
    <section class="card stack">${[5,4,3,2,1].map(l => { const c = cnt(l); return `<div class="stack" style="gap:6px"><div class="row between small"><span class="row" style="gap:8px"><span class="lv lv${l}">${LVN[l]}</span></span><span class="num muted">${c.ok} / ${c.all}</span></div><div class="bar"><i style="width:${c.all ? 100 * c.ok / c.all : 0}%"></i></div></div>`; }).join("")}</section>
    ${favN ? `<button class="btn soft block" ${goAttr({ view:"wordList", fav:1 })}>${I.heart} Favori kelimelerim (${favN})</button>` : ""}`);
}
function bindLevels(){
  document.querySelectorAll("#lvc .chip").forEach(c => c.onclick = () => { const l = +c.dataset.l, a = S.settings.levels, on = a.includes(l); if (on && a.length === 1) return; on ? a.splice(a.indexOf(l), 1) : a.push(l); c.setAttribute("aria-pressed", !on); save(); });
  const so = $("#starOnly"); if (so) so.onchange = () => { S.settings.starOnly = so.checked; save(); };
}

let WS = null;
function wordStudy(v){
  if (WS && v.fresh === WS.key && (WS.day !== dayNum() || (WS.cur === null && (dueList().length || freshWords(1).length && S.newCount < S.profile.daily)))) WS = null;
  if (!WS || v.fresh !== WS.key){
    resetNewDay(); const due = dueList(); const fr = freshWords(Math.max(0, S.profile.daily - S.newCount));
    const q = []; let a = 0, b = 0; while (a < due.length || b < fr.length){ for (let k = 0; k < 3 && a < due.length; k++) q.push(due[a++]); if (b < fr.length) q.push(fr[b++]); }
    WS = { key:v.fresh, day:dayNum(), q, again:[], cur:null, flip:false, done:0 }; v.fresh = WS.key = Date.now(); nextCard();
  }
  after = bindStudy;
  const i = WS.cur;
  if (i === null) return shell("Kartlar", `<section class="card empty"><h2>Tüm kelimeleri gördün</h2><p class="muted">${WS.done ? `${WS.done} kart çalıştın. ` : ""}Seçili seviyelerde yeni kelime kalmadı. Kelime sekmesinden başka seviye ekleyebilirsin; tekrar zamanı gelen kartlar burada olacak.</p>
    <button class="btn ghost" ${goAttr({ view:"wordQuiz" })}>Hızlı teste geç</button></section>`);
  const w = W[i], isNew = !S.cards[i], fav = S.favs.includes(i);
  const left = WS.q.length + WS.again.length + 1;
  return shell("Kartlar", `
    <div class="row between small muted"><span>${left} kart kaldı</span><span>${isNew ? "Yeni kelime" : "Tekrar"}</span></div>
    <section class="card wcard" id="wc" tabindex="0" role="button" aria-label="Kartı çevir">
      <div class="row between"><span class="row" style="gap:8px"><span class="lv lv${w[2]}">${LVN[w[2]]}</span>${w[7] ? '<span class="star" title="YDS\'de sık">★ YDS</span>' : ""}</span>
        <span class="row" style="gap:6px"><button class="fav" id="fav" aria-pressed="${fav}" aria-label="Favorilere ekle">${fav ? I.heartF : I.heart}</button><button class="speak acc" data-acc="us" aria-label="Amerikan okunuşu">${I.speak}<i>US</i></button><button class="speak acc" data-acc="uk" aria-label="İngiliz okunuşu">${I.speak}<i>UK</i></button></span></div>
      <div class="word">${esc(w[0])}</div><div class="pos">${esc(w[1])}</div>
      ${WS.flip ? `<div class="back"><div class="tr">${esc(w[3])}</div><div class="ex"><span class="en">${esc(w[4])}</span><span class="t">${esc(w[5])}</span></div>${w[6] ? `<div class="small muted">Eş anlamlı: <b style="color:var(--ink);font-weight:500">${esc(w[6])}</b></div>` : ""}</div>`
        : `<p class="small muted" style="margin:auto 0 0">Anlamını aklından söyle, sonra karta dokun.</p>`}
    </section>
    ${WS.flip ? `<div class="answers"><button class="a-bad" data-g="0">Bilmiyordum<small>az sonra</small></button><button class="a-mid" data-g="1">Zorlandım<small>yarın</small></button><button class="a-good" data-g="2">Biliyordum<small>${INT[Math.min(6, (S.cards[i]?.b || 0) + 1)]} gün sonra</small></button></div>`
      : `<button class="btn block" id="flip">Anlamını göster</button>`}
    <p class="tiny muted kbd-hint" style="text-align:center">Klavye: Boşluk çevir · 1 · 2 · 3</p>`);
}
function nextCard(){ if (!WS.q.length && WS.again.length){ WS.q = WS.again; WS.again = []; }
  // Yeni kelime çalışması kapanmaz: kuyruk bitince kayıtlı kelimelerden 10 yeni rastgele kelime eklenir
  if (!WS.q.length) WS.q = freshWords(10);
  WS.cur = WS.q.length ? WS.q.shift() : null; WS.flip = false; }
function bindStudy(){
  if (!$("#wc")) return;
  const flip = () => { if (!WS.flip){ WS.flip = true; render(); } };
  $("#wc").onclick = e => { if (e.target.closest(".speak,#fav")) return; flip(); };
  $("#wc").onkeydown = e => { if (e.key === "Enter"){ e.preventDefault(); flip(); } };
  document.querySelectorAll("#wc [data-acc]").forEach(b => b.onclick = () => speak(W[WS.cur][0], b.dataset.acc));
  $("#fav").onclick = () => { toggleFav(WS.cur); render(); };
  if ($("#flip")) $("#flip").onclick = flip;
  document.querySelectorAll("[data-g]").forEach(b => b.onclick = () => answerCard(+b.dataset.g));
}
function answerCard(g){ const i = WS.cur; grade(i, g); if (g === 0) WS.again.push(i); WS.done++; nextCard(); render(); }
document.addEventListener("keydown", e => {
  if (!S.profile || cur().view !== "wordStudy" || !WS || WS.cur === null || $(".sheet-back") || e.target.matches("input,textarea,select")) return;
  if (e.key === " "){ e.preventDefault(); if (!WS.flip){ WS.flip = true; render(); } }
  if (WS.flip && ["1","2","3"].includes(e.key)) answerCard(+e.key - 1);
});
/* gün değişince veya uygulamaya geri dönünce ekranı tazele */
let SEEN_DAY = dayNum();
function refreshIfStale(){
  if (document.hidden || !S.profile || $(".sheet-back")) return;
  const v = cur(), t = dayNum();
  const safe = ["home","words","stats"].includes(v.view || v.tab) || (v.view === "wordStudy" && (!WS || WS.cur === null));
  if (t !== SEEN_DAY && safe){ SEEN_DAY = t; render(); }
  else if (safe && (v.tab === "home" || v.tab === "words") && !v.view) render();
}
document.addEventListener("visibilitychange", refreshIfStale);
window.addEventListener("focus", refreshIfStale);
setInterval(() => { if (dayNum() !== SEEN_DAY) refreshIfStale(); }, 60000);
function toggleFav(i){ const k = S.favs.indexOf(i); k >= 0 ? S.favs.splice(k, 1) : S.favs.push(i); save(); }

let WL = { q:"", lv:[1,2,3,4,5], n:100 };
function wordList(v){
  after = () => {
    const s = $("#wq"); s.oninput = () => { WL.q = s.value; WL.n = 100; draw(); };
    document.querySelectorAll("#wlc .chip").forEach(c => c.onclick = () => { const l = +c.dataset.l, on = WL.lv.includes(l); if (on && WL.lv.length === 1) return; on ? WL.lv.splice(WL.lv.indexOf(l), 1) : WL.lv.push(l); c.setAttribute("aria-pressed", !on); WL.n = 100; draw(); });
    draw();
  };
  function draw(){
    const q = WL.q.trim().toLocaleLowerCase("tr");
    const hits = []; W.forEach((w, i) => { if (v.fav && !S.favs.includes(i)) return; if (!WL.lv.includes(w[2])) return; if (q && !w[0].toLowerCase().includes(q) && !w[3].toLocaleLowerCase("tr").includes(q)) return; hits.push(i); });
    $("#wlN").textContent = `${hits.length.toLocaleString("tr-TR")} kelime`;
    $("#wl").innerHTML = hits.slice(0, WL.n).map(i => { const w = W[i]; return `<button class="li" data-i="${i}"><span class="lv lv${w[2]}">${LVN[w[2]]}</span><span><span class="w">${esc(w[0])}</span>${w[7] ? ' <span class="star">★</span>' : ""} <span class="t">· ${esc(w[3])}</span></span><span class="dot s${wStatus(i)}"></span></button>`; }).join("") || `<div class="empty muted">Eşleşen kelime yok.</div>`;
    $("#wlMore").hidden = hits.length <= WL.n; $("#wlMore").onclick = () => { WL.n += 200; draw(); };
    document.querySelectorAll("#wl .li").forEach(r => r.onclick = () => {
      const x = r.querySelector(".x"); if (x){ x.remove(); return; } const i = +r.dataset.i, w = W[i];
      r.insertAdjacentHTML("beforeend", `<span class="x"><span class="pos">${esc(w[1])}</span><span>${esc(w[4])}</span><span class="muted">${esc(w[5])}</span>${w[6] ? `<span class="small">Eş anlamlı: ${esc(w[6])}</span>` : ""}<span class="row" style="gap:8px;margin-top:4px"><span class="link small" data-sp="${i}">Dinle</span><span class="link small" data-fv="${i}">${S.favs.includes(i) ? "Favoriden çıkar" : "Favorilere ekle"}</span></span></span>`);
      r.querySelector("[data-sp]").onclick = e => { e.stopPropagation(); speak(w[0]); };
      r.querySelector("[data-fv]").onclick = e => { e.stopPropagation(); toggleFav(i); e.target.textContent = S.favs.includes(i) ? "Favoriden çıkar" : "Favorilere ekle"; };
    });
  }
  return shell(v.fav ? "Favoriler" : "Tüm kelimeler", `
    <input type="search" id="wq" placeholder="İngilizce ya da Türkçe ara…" value="${esc(WL.q)}" aria-label="Kelime ara">
    <div class="row between"><div class="chips" id="wlc">${[1,2,3,4,5].map(l => `<button class="chip" data-l="${l}" aria-pressed="${WL.lv.includes(l)}">${LVN[l]}</button>`).join("")}</div><span class="small muted" id="wlN"></span></div>
    <p class="tiny muted" style="margin:0">Nokta: kırmızı yeni öğreniliyor · turuncu tekrarda · yeşil öğrenildi</p>
    <div class="list" id="wl"></div><button class="btn ghost" id="wlMore" hidden>Daha fazla göster</button>`);
}

let WQ = null;
// Hızlı test kapanmaz: 10 soru bitince kayıtlı kelimelerden 10 yeni rastgele soru eklenir
function wqBatch(){
    const known = shuffle(Object.keys(S.cards).map(Number).filter(i => S.cards[i].b >= 1)).slice(0, 5);
    const rest = shuffle(W.map((_, i) => i).filter(i => inScope(i) && !known.includes(i))).slice(0, 10 - known.length);
    const pool = [...known, ...rest];
    const items = shuffle(pool).slice(0, 10).map(i => { const same = W.map((w, k) => (w[2] === W[i][2] && k !== i) ? k : -1).filter(k => k >= 0); const o = shuffle([i, ...shuffle(same).slice(0, 3)]); return { i, o, a:o.indexOf(i), pick:null }; });
    return items;
}
function wordQuiz(){
  if (!WQ) WQ = { items:wqBatch(), k:0, ok:0 };
  after = () => {
    document.querySelectorAll(".opt").forEach(b => b.onclick = () => { const it = WQ.items[WQ.k]; if (it.pick !== null) return; it.pick = +b.dataset.o; if (it.pick === it.a) WQ.ok++; grade(it.i, it.pick === it.a ? 2 : 0); render(); });
    const n = $("#wqNext"); if (n) n.onclick = () => { WQ.k++; if (WQ.k >= WQ.items.length) WQ.items.push(...wqBatch()); render(true); };
    const r = $("#wqAgain"); if (r) r.onclick = () => { WQ = null; render(true); };
  };
  if (WQ.k >= WQ.items.length) return shell("Hızlı test", `<section class="card empty"><span class="eyebrow">Sonuç</span><span class="result-big num">${WQ.ok}/10</span><p class="muted">${WQ.ok >= 8 ? "Çok iyi! Bu kelimeler oturmuş." : WQ.ok >= 5 ? "İyi gidiyor. Yanlışlar kartlarda tekrar gelecek." : "Bu kelimeler kartlarda yakında tekrar karşına çıkacak."}</p><button class="btn" id="wqAgain">Yeni test</button></section>`);
  const it = WQ.items[WQ.k], w = W[it.i];
  return shell("Hızlı test", `
    <div class="qhead"><span class="small muted num">${WQ.k + 1}. soru · ${WQ.ok} doğru</span><div class="bar qprog"><i style="width:${10 * (WQ.k % 10)}%"></i></div></div>
    <section class="card stack"><span class="eyebrow">Bu kelimenin anlamı ne?</span><div class="row between"><div class="word" style="font-size:40px;margin:0">${esc(w[0])}</div><button class="speak" id="sp2" aria-label="Dinle">${I.speak}</button></div><span class="pos">${esc(w[1])}</span></section>
    <div class="opts">${it.o.map((k, n) => `<button class="opt ${it.pick !== null ? (n === it.a ? "right" : n === it.pick ? "wrong" : "") : ""}" data-o="${n}" ${it.pick !== null ? "disabled" : ""}><span class="ol">${L(n)}</span><span>${esc(W[k][3])}</span></button>`).join("")}</div>
    ${it.pick !== null ? `<div class="expl"><b>${it.pick === it.a ? "Doğru." : "Yanlış."}</b>${esc(w[4])}<br><span class="muted">${esc(w[5])}</span></div><button class="btn block" id="wqNext">Sonraki</button>` : ""}`)
    .replace('id="sp2"', `id="sp2" data-w="${it.i}"`);
}
document.addEventListener("click", e => { const b = e.target.closest("#sp2"); if (b) speak(W[+b.dataset.w][0]); });

/* ---------- PRATİK ---------- */
function typeStats(t){
  const ids = t === "reading" ? R.filter(r => r.q).flatMap(r => r.q.map((_, k) => `${r.id}:${k}`)) : t === "cloze" ? CL.flatMap(c => c.qs.map((_, k) => `${c.id}:${k}`)) : Q.filter(q => q.t === t).map(q => q.id);
  let seen = 0, ok = 0, tot = 0; ids.forEach(id => { const s = S.qs[id]; if (s){ seen++; ok += s.c; tot += s.c + s.w; } });
  return { n:ids.length, seen, acc:tot ? Math.round(100 * ok / tot) : null };
}
function practice(){
  const tiles = Object.entries(TYPES).map(([k, t]) => { const s = typeStats(k); return `<button class="tile" ${goAttr(k === "reading" ? { tab:"read", filter:"YDS Paragraf" } : { view:"qsession", type:k })}><span class="ti">${I[t.ic]}</span><b>${t.n}</b><span class="small muted">${t.s}</span><span class="m num">${s.n} soru · ${s.acc === null ? "henüz çözülmedi" : `%${s.acc} doğru`}</span></button>`; }).join("");
  const wn = S.wrong.length;
  return shell("Pratik", `
    <section class="grid2">
      <button class="card stack" style="text-align:left;cursor:pointer" ${goAttr({ view:"qsession", type:"mix" })}><span class="eyebrow">Karışık</span><b style="font-size:18px">10 soruluk set</b><span class="small muted">Her türden sorular</span></button>
      <button class="card stack" style="text-align:left;cursor:pointer" ${goAttr({ view:"lessons" })}><span class="eyebrow">Dersler</span><b style="font-size:18px">Dilbilgisi</b><span class="small muted">${G.length} konu, Türkçe anlatım</span></button>
    </section>
    <button class="card row" style="text-align:left;cursor:pointer;gap:12px" ${goAttr({ view:"strategy" })}><span class="ti" style="width:40px;height:40px;border-radius:12px;background:var(--needle-soft);color:var(--needle);display:grid;place-items:center">${I.target}</span><span style="flex:1"><b>Sınav stratejisi</b><br><span class="small muted">Süre planı ve soru tiplerine göre taktikler</span></span></button>
    ${wn ? `<button class="btn soft block" ${goAttr({ view:"qsession", type:"wrong" })}>${I.wrong} Yanlışlarımı tekrar et (${wn})</button>` : ""}
    <div class="sec">Soru tipleri <small>YDS'deki sırayla</small></div>
    <section class="tiles">${tiles}</section>`);
}
const STRAT = [
  ["Süre planı (180 dakika / 80 soru)", ["Kelime ve dilbilgisi (1–16): 15 dakika. Bilmediğin soruda takılma, işaretleyip geç.", "Cloze ve cümle tamamlama (17–36): 30 dakika.", "Çeviri (37–42): 15 dakika.", "Okuma (43–62): 60 dakika; her metin (4 soru) için en fazla 12 dakika.", "Diyalog, anlamca yakın, paragraf tamamlama, anlamı bozan cümle (63–80): 40 dakika.", "Kalan 20 dakika: işaretlediğin soruları kontrol ve cevap kâğıdı."]],
  ["Puan hesabı", ["Her doğru 1,25 puan; yanlışlar doğruları götürmez. Boş bırakmak yerine en mantıklı tahmini işaretle.", "70 puan için 56, 80 puan için 64, 90 puan için 72 doğru gerekir."]],
  ["Kelime ve dilbilgisi", ["Önce boşluğun etrafındaki ipuçlarını oku: zaman zarfları (by the time, since, already) zamanı, bağlaçlar (although, because) anlam ilişkisini belirler.", "Edat sorularında fiil/sıfatın kalıbını hatırla: depend on, responsible for, capable of.", "Şıklardaki kelimeleri boşluğa tek tek koyup cümlenin tamamını oku."]],
  ["Cloze test", ["Metni bir kez baştan sona oku; her boşluk önceki ve sonraki cümleyle bağlantılıdır.", "Bağlaç boşluklarında iki cümle arasındaki ilişkiyi (zıtlık, sebep-sonuç, ekleme) belirle."]],
  ["Cümle tamamlama", ["Bağlacı bul ve anlam ilişkisini kur: although → zıtlık, because → sebep, so … that → sonuç.", "Zaman uyumuna bak: ana cümle geçmiş zamandaysa yan cümle de genelde geçmiştedir.", "Özne-zamir uyumu (it/they, this/these) yanlış şıkları hızla eler."]],
  ["Çeviri", ["Önce cümlenin ana fiilini ve öznesini bul; şıkları bu iki öğeye göre ele.", "Zaman, olumsuzluk, 'bazı/birçok/tüm' gibi niceleyiciler ve 'may/must' kipleri en çok değiştirilen ayrıntılardır.", "Anlamı doğru ama bilgi eksik ya da fazla olan şıkları ele."]],
  ["Okuma (paragraf soruları)", ["Önce soruyu oku, sonra metne dön; ne aradığını bilerek okumak zaman kazandırır.", "Ana fikir sorularında ilk ve son cümleye, ayrıntı sorularında anahtar kelimeye odaklan.", "Metinde açıkça söylenmeyen, abartılı (always, never, all) şıklara şüpheyle yaklaş."]],
  ["Diyalog tamamlama", ["Boşluktan sonraki satır en güçlü ipucudur; cevap o satırla mantıklı biçimde bağlanmalı.", "Soru sorulmuşsa cevap veren, itiraz edilmişse gerekçe sunan şıkkı ara."]],
  ["Anlamca en yakın cümle", ["Verilen cümledeki mantık ilişkisini (sebep, zıtlık, koşul, karşılaştırma) bul; doğru şık aynı ilişkiyi korur.", "Tek kelimelik farklar (only, hardly, not until) anlamı tamamen değiştirebilir."]],
  ["Paragraf tamamlama ve anlamı bozan cümle", ["Boşluktan önceki ve sonraki cümleleri birlikte oku; doğru cümle ikisini bağlar.", "Anlamı bozan cümle genelde aynı konudan bahseder ama paragrafın odaklandığı alt konudan sapar.", "Zamirlerin (this, these, such) neyi gösterdiğini kontrol et."]],
  ["Son hafta", ["Her gün en az bir zayıf soru tipine odaklan; Pratik ekranındaki yüzdeler sana yol gösterir.", "Sınavdan önceki iki gün tam deneme çöz, süreyi gerçek sınav gibi tut.", "Sınav günü yeni konu çalışma; kelime tekrarı yeterli."]]
];
function strategy(){
  return shell("Sınav stratejisi", `<section class="card stack lesson"><p class="small muted" style="margin:0">YDS'de puanı belirleyen yalnızca bilgi değil, süreyi doğru kullanmak ve soru tiplerinin mantığını bilmektir.</p></section>
    ${STRAT.map(([t, items]) => `<section class="card stack lesson"><h3 style="margin:0">${t}</h3><ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px">${items.map(x => `<li>${x}</li>`).join("")}</ul></section>`).join("")}`);
}
function lessons(){
  return shell("Dilbilgisi", `<section class="list">${G.map(g => { const ids = Q.filter(q => q.t === "grammar" && q.g === g.tag); return `<button class="li" ${goAttr({ view:"lesson", id:g.id })}><span class="ti" style="width:34px;height:34px;border-radius:10px;background:var(--brand-soft);color:var(--brand-deep);display:grid;place-items:center">${I.gram.replace("<svg", '<svg width="18" height="18"')}</span><span><span class="w">${esc(g.title)}</span><br><span class="t small">${esc(g.sum)}</span></span><span class="small muted num">${ids.length} soru</span></button>`; }).join("")}</section>`);
}
function lesson(v){
  const g = G.find(x => x.id === v.id); const n = Q.filter(q => q.t === "grammar" && q.g === g.tag).length;
  return shell(g.title, `
    <p class="muted" style="margin:0">${esc(g.sum)}</p>
    ${g.parts.map(p => `<section class="card lesson"><h3>${esc(p.h)}</h3><p>${esc(p.t)}</p><div class="exl">${p.ex.map(e => `<div><span>${esc(e[0])}</span><br><span class="t">${esc(e[1])}</span></div>`).join("")}</div></section>`).join("")}
    <div class="tip"><b>YDS ipucu</b><br>${esc(g.tip)}</div>
    ${n ? `<button class="btn block" ${goAttr({ view:"qsession", type:"grammar", tag:g.tag, title:g.title })}>Bu konudan ${Math.min(10, n)} soru çöz</button>` : ""}`);
}

/* soru oturumu */
let QS = null;
function record(id, ok){
  const s = S.qs[id] || (S.qs[id] = { c:0, w:0, h:[] }); ok ? s.c++ : s.w++; (s.h || (s.h = [])).push([Date.now(), ok ? 1 : 0]); if (s.h.length > 5) s.h.shift();
  const k = S.wrong.indexOf(id); if (ok && k >= 0) S.wrong.splice(k, 1); if (!ok && k < 0) S.wrong.push(id);
  const d = day(); d.q++; if (ok) d.c++; save();
}
function itemFor(id){
  if (id.startsWith("cl")){ const [cid, k] = id.split(":"); const c = CL.find(x => x.id === cid); const q = c.qs[+k]; return { id, kind:"cloze", c, k:+k, o:q.o, a:q.a, e:q.e }; }
  if (id.startsWith("rd")){ const [rid, k] = id.split(":"); const r = R.find(x => x.id === rid); const q = r.q[+k]; return { id, kind:"read", r, k:+k, q:q.q, o:q.o, a:q.a, e:q.e }; }
  const q = QI[id]; return { id, kind:"q", t:q.t, q:q.q, o:q.o, a:q.a, e:q.e };
}
const hasItem = id => { try { return !!itemFor(id); } catch(e){ return false; } };
function pickIds(pool, n){ const unseen = shuffle(pool.filter(id => !S.qs[id])); const wrong = shuffle(pool.filter(id => S.qs[id] && S.wrong.includes(id))); const rest = shuffle(pool.filter(id => S.qs[id] && !S.wrong.includes(id))); return [...unseen, ...wrong, ...rest].slice(0, n); }
function buildSession(v){
  let ids = [];
  if (v.type === "cloze"){ const c = shuffle(CL.slice().sort((a, b) => (S.qs[`${a.id}:0`] ? 1 : 0) - (S.qs[`${b.id}:0`] ? 1 : 0)).slice(0, 3))[0]; if (c) ids = c.qs.map((_, k) => `${c.id}:${k}`); }
  else if (v.type === "wrong"){ const n = S.wrong.length; S.wrong = S.wrong.filter(hasItem); if (S.wrong.length !== n) save(); ids = shuffle(S.wrong).slice(0, 10); } // artık var olmayan sorular listeden düşer
  else if (v.type === "mix") ids = pickIds(Q.map(q => q.id), 10);
  else if (v.type === "daily") ids = shuffle(Q.filter(q => !q.id.startsWith("gv")).map(q => q.id), rng(dayNum() * 97)).slice(0, 5);
  else ids = pickIds(Q.filter(q => q.t === v.type && (!v.tag || q.g === v.tag)).map(q => q.id), 10);
  return { key:v.key, items:ids.filter(hasItem).map(itemFor), k:0, picks:{}, ok:0 };
}
function qsession(v){
  if (!v.key){ v.key = Date.now(); QS = null; }
  if (!QS || QS.key !== v.key) QS = buildSession(v);
  const title = v.title || (v.type === "daily" ? "Günlük meydan okuma" : v.type === "mix" ? "Karışık set" : v.type === "wrong" ? "Yanlışlarım" : TYPES[v.type].n);
  after = () => {
    document.querySelectorAll(".opt").forEach(b => b.onclick = () => { const it = QS.items[QS.k]; if (QS.picks[QS.k] !== undefined) return; const p = +b.dataset.o; QS.picks[QS.k] = p; if (p === it.a) QS.ok++; record(it.id, p === it.a); render(); });
    const n = $("#qNext"); if (n) n.onclick = () => { QS.k++; render(true); };
    const a = $("#qAgain"); if (a) a.onclick = () => { v.key = Date.now(); QS = null; render(true); };
  };
  if (!QS.items.length) return shell(title, `<section class="card empty"><h2>Burada soru kalmadı</h2><p class="muted">${v.type === "wrong" ? "Tüm yanlışlarını düzelttin." : "Bu bölümde soru yok."}</p></section>`);
  if (QS.k >= QS.items.length){
    const n = QS.items.length;
    if (v.type === "daily"){
      const dk = dayKey(); S.dc = S.dc || {}; if (S.dc[dk] === undefined){ S.dc[dk] = QS.ok; save(); }
      const sq = QS.items.map((it, k) => QS.picks[k] === it.a ? "🟩" : "🟥").join(""), dt = new Date().toLocaleDateString("tr-TR");
      const txt = `Pusula YDS günlük meydan okuma ${dt}: ${QS.ok}/${n} ${sq}\nSen kaç yapacaksın? ${shareUrl()}`;
      after = () => { $("#shWa").onclick = () => window.open("https://wa.me/?text=" + encodeURIComponent(txt), "_blank"); $("#shCp").onclick = () => { const no = () => toast("Kopyalanamadı. WhatsApp ile paylaşmayı dene."); try { navigator.clipboard.writeText(txt).then(() => toast("Sonuç kopyalandı"), no); } catch(e){ no(); } }; };
      return shell(title, `<section class="card empty"><span class="eyebrow">Bugünün sonucu</span><span class="result-big num">${QS.ok}/${n}</span><div style="font-size:28px;letter-spacing:4px">${sq}</div><p class="muted">Herkes bugün aynı 5 soruyu çözüyor. Sonucunu arkadaşlarınla paylaş, yarın yeni sorular gelecek.</p><button class="btn" id="shWa">WhatsApp'ta paylaş</button><button class="btn ghost" id="shCp">Sonucu kopyala</button></section>`);
    }
    return shell(title, `<section class="card empty"><span class="eyebrow">Set bitti</span><span class="result-big num">${QS.ok}/${n}</span><p class="muted">${QS.ok === n ? "Hepsi doğru, harika!" : `Yanlış yaptığın ${n - QS.ok} soru "Yanlışlarım" listesine eklendi.`}</p><button class="btn" id="qAgain">Yeni set</button><button class="btn ghost" data-tab="practice">Pratik'e dön</button></section>`);
  }
  const it = QS.items[QS.k], pk = QS.picks[QS.k], answered = pk !== undefined;
  let stem = "";
  if (it.kind === "cloze"){ let n = 0; stem = `<div class="eyebrow" lang="en">${esc(it.c.title)} · Boşluk ${it.k + 1}</div><div class="passage">${esc(it.c.p).replace(/\((\d)\)----/g, (m, d) => `<span class="blank ${+d === it.k + 1 ? "cur" : ""}">(${d})</span>`)}</div><p class="small muted" style="margin:0">(${it.k + 1}) numaralı boşluğa hangisi gelmelidir?</p>`; }
  else if (it.kind === "read") stem = `<div class="eyebrow" lang="en">${esc(it.r.title)}</div><details class="card" ${QS.k === 0 || !answered ? "open" : ""}><summary class="small" style="cursor:pointer;font-weight:600">Parçayı göster / gizle</summary><p class="rtext" style="margin:10px 0 0">${esc(it.r.s.map(s => s[0]).join(" "))}</p></details><p class="qtext" style="margin:0">${esc(it.q)}</p>`;
  else stem = `<div class="eyebrow">${TYPES[it.t].n}</div><p class="qtext" style="margin:0">${esc(it.q)}</p>${it.t === "irrelevant" ? '<p class="small muted" style="margin:0">Parçada anlam bütünlüğünü bozan cümle hangisidir?</p>' : it.t === "restatement" ? '<p class="small muted" style="margin:0">Verilen cümleye anlamca en yakın cümle hangisidir?</p>' : it.t.startsWith("trans") ? '<p class="small muted" style="margin:0">En doğru çeviri hangisidir?</p>' : it.t === "dialog" ? '<p class="small muted" style="margin:0">Diyaloğu tamamlayan ifade hangisidir?</p>' : ""}`;
  return shell(title, `
    <div class="qhead"><span class="small muted num">${QS.k + 1} / ${QS.items.length}</span><div class="bar qprog"><i style="width:${100 * QS.k / QS.items.length}%"></i></div><span class="small num" style="color:var(--good)">${QS.ok} doğru</span></div>
    <section class="stack">${stem}</section>
    <div class="opts">${it.o.map((o, n) => `<button class="opt ${answered ? (n === it.a ? "right" : n === pk ? "wrong" : "") : ""}" data-o="${n}" ${answered ? "disabled" : ""}><span class="ol">${L(n)}</span><span>${esc(o)}</span></button>`).join("")}</div>
    ${answered ? `<div class="expl"><b>${pk === it.a ? "Doğru." : `Yanlış. Doğru cevap ${L(it.a)}.`}</b>${esc(it.e)}</div><button class="btn block" id="qNext">${QS.k === QS.items.length - 1 ? "Sonucu gör" : "Sonraki soru"}</button>` : ""}`);
}

/* ---------- OKUMA ---------- */
const RTYPES = ["Fıkra","Hikâye","Haber","Bilimsel","YDS Paragraf"];
let RF = null;
function read(v){
  if (v.filter && !v.applied){ RF = [v.filter]; v.applied = 1; } if (!RF) RF = RTYPES.slice();
  after = () => document.querySelectorAll("#rtc .chip").forEach(c => c.onclick = () => { const t = c.dataset.t, on = RF.includes(t); if (on && RF.length === 1) return; on ? RF.splice(RF.indexOf(t), 1) : RF.push(t); render(); });
  const list = R.filter(r => RF.includes(r.type));
  return shell("Okuma", `
    <div class="chips" id="rtc">${RTYPES.map(t => `<button class="chip" data-t="${t}" aria-pressed="${RF.includes(t)}">${t}</button>`).join("")}</div>
    <p class="small muted" style="margin:0">Renkli kelimeler B2 ve C1 düzeyinde; dokununca anlamı çıkar.</p>
    <section class="tiles">${list.map(r => `<button class="tile" ${goAttr({ view:"reader", id:r.id })}><span class="eyebrow" style="color:var(--brand)">${r.type}</span><b style="font-family:var(--display);font-size:18px">${esc(r.title)}</b><span class="small muted">${esc(r.tr)}</span><span class="m">${S.read[r.id] ? "✓ okundu · " : ""}${r.s.length} cümle${r.q ? ` · ${r.q.length} soru` : ""}</span></button>`).join("")}</section>`);
}
const IRR = {went:"go",gone:"go",saw:"see",seen:"see",took:"take",taken:"take",came:"come",gave:"give",given:"give",found:"find",felt:"feel",left:"leave",ran:"run",grew:"grow",grown:"grow",spent:"spend",woke:"wake",forgot:"forget",forgotten:"forget",understood:"understand",thought:"think",bought:"buy",told:"tell",said:"say",made:"make",knew:"know",known:"know",lost:"lose",began:"begin",begun:"begin",broke:"break",broken:"break",met:"meet",kept:"keep",brought:"bring",won:"win",children:"child",people:"person",lives:"life",leaves:"leaf",men:"man",women:"woman",feet:"foot",teeth:"tooth",mice:"mouse",halves:"half",wolves:"wolf",better:"good",best:"good",worse:"bad",worst:"bad",fewer:"few",less:"little",least:"little",led:"lead",held:"hold",fell:"fall",chose:"choose",chosen:"choose",paid:"pay",had:"have",has:"have",was:"be",were:"be",are:"be",am:"be",is:"be",been:"be",being:"be",did:"do",does:"do",done:"do",risen:"rise",rose:"rise",meant:"mean",these:"this",those:"that",an:"a",spread:"spread",built:"build",taught:"teach",caught:"catch",written:"write",wrote:"write",became:"become",sat:"sit",stood:"stand",slept:"sleep",sold:"sell",sent:"send",shook:"shake",fought:"fight",flew:"fly",flown:"fly",drove:"drive",driven:"drive",ate:"eat",eaten:"eat",drank:"drink",drunk:"drink",spoke:"speak",spoken:"speak",heard:"hear",hid:"hide",hidden:"hide",lay:"lie",lain:"lie",laid:"lay",lit:"light",rode:"ride",sang:"sing",sung:"sing",swam:"swim",threw:"throw",thrown:"throw",wore:"wear",worn:"wear",froze:"freeze",frozen:"freeze",fed:"feed",dug:"dig",hung:"hang",struck:"strike",sought:"seek",bore:"bear",born:"bear",tore:"tear",torn:"tear",wound:"wind",shone:"shine",shot:"shoot",stole:"steal",stolen:"steal",understood:"understand",withdrew:"withdraw",arose:"arise",sank:"sink",sunk:"sink",got:"get",gotten:"get",shown:"show",rang:"ring",rung:"ring",arisen:"arise",
  "can't":"can","cannot":"can","couldn't":"could","won't":"will","wouldn't":"would","shouldn't":"should","mustn't":"must","don't":"do","doesn't":"do","didn't":"do","isn't":"be","aren't":"be","wasn't":"be","weren't":"be","haven't":"have","hasn't":"have","hadn't":"have","i'm":"i","i've":"i","i'll":"i","i'd":"i","you're":"you","you've":"you","you'll":"you","we're":"we","we've":"we","they're":"they","they've":"they","he's":"he","she's":"she","it's":"it","that's":"that","there's":"there","what's":"what","let's":"let"};
const NAMES = {canada:"Kanada",europe:"Avrupa",european:"Avrupalı, Avrupa'ya ait",india:"Hindistan",peru:"Peru",turkey:"Türkiye",turkish:"Türk; Türkçe",egypt:"Mısır",egyptian:"Mısırlı, Mısır'a ait",german:"Alman; Almanca",germany:"Almanya",english:"İngilizce; İngiliz",england:"İngiltere",britain:"Britanya",british:"İngiliz, Britanyalı",america:"Amerika",american:"Amerikalı",japan:"Japonya",japanese:"Japon; Japonca",china:"Çin",chinese:"Çinli; Çince",france:"Fransa",french:"Fransız; Fransızca",africa:"Afrika",asia:"Asya",istanbul:"İstanbul",ankara:"Ankara",lira:"lira (Türk parası)",hodja:"Hoca (Nasreddin Hoca)",göbeklitepe:"Göbeklitepe (Şanlıurfa'daki 11.000 yıllık tapınak alanı)",stonehenge:"Stonehenge (İngiltere'deki taş anıt)",ouch:"Ah! Of! (acı ünlemi)"};
const ncase = s => s.length > 1 && s === s.toUpperCase() && /[A-Z]/.test(s) ? 2 : /^[A-Z]/.test(s) ? 1 : 0;
function forms(tok){
  const t = tok.toLowerCase().replace(/’/g, "'"), u = t.replace(/'s$|'$/, ""), c = [t, u, IRR[t], IRR[u]];
  for (const x of [u]){
    if (x.endsWith("ies") || x.endsWith("ied")) c.push(x.slice(0, -3) + "y");
    if (x.endsWith("s") && !x.endsWith("ss")) c.push(x.slice(0, -1)); if (x.endsWith("es")) c.push(x.slice(0, -2));
    if (x.endsWith("ves")) c.push(x.slice(0, -3) + "f", x.slice(0, -3) + "fe");
    if (x.endsWith("ed")){ c.push(x.slice(0, -1), x.slice(0, -2)); if (/(.)\1ed$/.test(x)) c.push(x.slice(0, -3)); }
    if (x.endsWith("ing")){ c.push(x.slice(0, -3) + "e", x.slice(0, -3)); if (/(.)\1ing$/.test(x)) c.push(x.slice(0, -4)); if (x.endsWith("ying")) c.push(x.slice(0, -4) + "ie"); }
    if (x.endsWith("ily")) c.push(x.slice(0, -3) + "y"); if (x.endsWith("ly")) c.push(x.slice(0, -2), x.slice(0, -2) + "le");
    if (x.endsWith("ier")) c.push(x.slice(0, -3) + "y"); if (x.endsWith("iest")) c.push(x.slice(0, -4) + "y");
    if (x.endsWith("er")){ c.push(x.slice(0, -2), x.slice(0, -1)); if (/(.)\1er$/.test(x)) c.push(x.slice(0, -3)); }
    if (x.endsWith("est")){ c.push(x.slice(0, -3), x.slice(0, -2)); if (/(.)\1est$/.test(x)) c.push(x.slice(0, -4)); }
  }
  return [...new Set(c.filter(Boolean))];
}
/* Büyük/küçük harfe göre uygun kayıtları bulur: "it" → zamir, "IT" → bilişim; "may" → -ebilir, "May" → Mayıs */
function lookup(tok){
  const tc = ncase(tok), out = [];
  for (const f of forms(tok)){ for (const i of DICT[f] || []){ const ec = ncase(W[i][0].replace(/\s*\(.*$/, "")); if (ec === 2 ? tc === 2 : ec === 1 ? tc >= 1 : tc !== 2 || tok.length > 3) out.push(i); } if (out.length) break; }
  return [...new Set(out)];
}
/* Metni kelime ve öbeklere ayırır; öbekler (according to, carry out…) tek parça işaretlenir */
function annotate(r){
  const parts = r.s.map(p => p[0]).join(" ").split(/([\p{L}’'-]*\p{L})/u), toks = [];
  for (let i = 1; i < parts.length; i += 2) toks.push(i);
  const keys = {}; (r.keys || []).forEach(([en, tr]) => keys[en.toLowerCase()] = tr);
  const kph = {}; Object.keys(keys).filter(k => k.includes(" ")).forEach(k => { const a = k.split(" "); (kph[a[0]] || (kph[a[0]] = [])).push(a); });
  const fs = toks.map(i => forms(parts[i]));
  const out = parts.map(p => esc(p));
  for (let n = 0; n < toks.length; n++){
    let best = null;
    for (const f of fs[n]) for (const ph of [...(kph[f] || []), ...(PH[f] || [])]){
      if (ph.length < 2 || n + ph.length > toks.length || (best && best.length >= ph.length)) continue;
      let ok = true; for (let j = 1; j < ph.length; j++){ const sep = parts[toks[n + j] - 1]; if (!/^\s+$/.test(sep) || !fs[n + j].includes(ph[j])){ ok = false; break; } }
      if (ok) best = ph;
    }
    const tok = parts[toks[n]];
    let key, ks, ctx;
    if (best){ key = best.join(" "); ks = DICT[key] || []; ctx = keys[key]; }
    else {
      ks = lookup(tok); ctx = fs[n].map(f => keys[f]).find(Boolean);
      const nm = ncase(tok) >= 1 && NAMES[tok.toLowerCase().replace(/[’']s$/, "")];
      if (nm){ ks = []; ctx = nm; }
      if (!ks.length && !ctx && tok.includes("-")) ks = [...new Set(tok.split("-").flatMap(lookup))];
      if (!ks.length && !ctx) continue;
    }
    const lv = Math.max(0, ...ks.map(k => W[k][2]));
    const attrs = `class="w${lv >= 4 ? " hl" : ""}" data-k="${ks.join(",")}"${ctx ? ` data-c="${esc(ctx)}"` : ""} tabindex="0" role="button"`;
    if (best){ const last = n + best.length - 1; out[toks[n]] = `<span ${attrs}>` + out[toks[n]]; out[toks[last]] += "</span>"; n = last; }
    else out[toks[n]] = `<span ${attrs}>${out[toks[n]]}</span>`;
  }
  return out.join("");
}
if (location.search.includes("debug")) window.__p = () => ({ R, W, Q, annotate, go });
let RD = {};
function reader(v){
  const r = R.find(x => x.id === v.id), idx = R.indexOf(r);
  if (!S.read[r.id]){ S.read[r.id] = 1; day().r++; save(); }
  const st = RD[r.id] || (RD[r.id] = { picks:{}, tr:!r.q });
  const text = annotate(r);
  after = () => {
    const pick = el => { document.querySelectorAll(".rtext .w.on").forEach(x => x.classList.remove("on")); el.classList.add("on");
      const ks = el.dataset.k ? el.dataset.k.split(",").map(Number) : []; let ctx = el.dataset.c; if (ctx && ks.some(k => W[k][3] === ctx)){ ks.sort((a, b) => (W[b][3] === ctx) - (W[a][3] === ctx)); ctx = ks.length > 1 ? ctx : ""; }
      const sense = k => { const w = W[k]; return `<div class="ps"><span class="pw">${esc(w[0].replace(/\s*\(.*\)$/, ""))}</span><span class="lv lv${w[2]}">${LVN[w[2]]}</span><span class="pos">${esc(w[1])}</span><b>${esc(w[3])}</b><button class="speak" data-sp="${k}" aria-label="Dinle">${I.speak}</button><button class="fav" data-fv="${k}" aria-pressed="${S.favs.includes(k)}" aria-label="Favorilere ekle">${S.favs.includes(k) ? I.heartF : I.heart}</button></div>`; };
      $("#pop").innerHTML = (ctx ? `<div class="ps"><span class="pw">${esc(el.textContent)}</span><span class="ctx">Bu metinde:</span><b>${esc(ctx)}</b>${ks.length ? "" : `<button class="speak" data-say="1" aria-label="Dinle">${I.speak}</button>`}</div>` : "")
        + (ks.length > 1 ? `<span class="small muted pnote">Bu kelimenin birden fazla anlamı var; cümleye uyanı seç:</span>` : "") + ks.map(sense).join("");
      $("#pop").querySelectorAll("[data-sp]").forEach(b => b.onclick = () => speak(W[+b.dataset.sp][0].replace(/\s*\(.*\)$/, "")));
      $("#pop").querySelectorAll("[data-say]").forEach(b => b.onclick = () => speak(el.textContent));
      $("#pop").querySelectorAll("[data-fv]").forEach(b => b.onclick = () => { toggleFav(+b.dataset.fv); pick(el); }); };
    document.querySelectorAll(".rtext .w").forEach(el => { el.onclick = () => pick(el); el.onkeydown = e => { if (e.key === "Enter"){ e.preventDefault(); pick(el); } }; });
    $("#trT").onclick = () => { st.tr = !st.tr; render(); };
    document.querySelectorAll("[data-q] .opt").forEach(b => b.onclick = () => { const qi = +b.closest("[data-q]").dataset.q; if (st.picks[qi] !== undefined) return; const p = +b.dataset.o; st.picks[qi] = p; record(`${r.id}:${qi}`, p === r.q[qi].a); render(); });
  };
  const qs = r.q ? `<div class="sec">Sorular <small>${Object.keys(st.picks).length ? `${r.q.filter((q, i) => st.picks[i] === q.a).length} / ${r.q.length} doğru` : "Önce kendin çöz"}</small></div>
    ${r.q.map((q, qi) => { const pk = st.picks[qi], an = pk !== undefined; return `<section class="card stack" data-q="${qi}"><p class="qtext" style="margin:0"><b>${qi + 1}.</b> ${esc(q.q)}</p><div class="opts">${q.o.map((o, n) => `<button class="opt ${an ? (n === q.a ? "right" : n === pk ? "wrong" : "") : ""}" data-o="${n}" ${an ? "disabled" : ""}><span class="ol">${L(n)}</span><span>${esc(o)}</span></button>`).join("")}</div>${an ? `<div class="expl"><b>${pk === q.a ? "Doğru." : `Yanlış. Doğru cevap ${L(q.a)}.`}</b>${esc(q.e)}</div>` : ""}</section>`; }).join("")}` : "";
  return shell(r.type, `
    <div class="stack" style="gap:4px"><span class="eyebrow" style="color:var(--brand)">${r.type} · ${r.level}</span><h2 style="font-size:clamp(26px,6vw,34px)">${esc(r.title)}</h2><span class="muted">${esc(r.tr)}</span></div>
    <section class="card"><p class="rtext" style="margin:0">${text}</p></section>
    <div class="pop" id="pop"><span class="small muted">Bilmediğin kelimeye dokun; anlamı burada görünür.</span></div>
    ${qs}
    <div class="sec">Türkçe çevirisi <button class="link small" id="trT">${st.tr ? "Gizle" : "Göster"}</button></div>
    ${st.tr ? `<section class="card pairs">${r.s.map(p => `<div class="pair"><span class="en">${esc(p[0])}</span><span>${esc(p[1])}</span></div>`).join("")}</section>` : ""}
    <div class="sec">Önemli kelimeler</div><div>${(r.keys || []).map(k => `<span class="kc"><b>${esc(k[0])}</b> · ${esc(k[1])}</span>`).join("")}</div>
    <div class="tip"><b>Açıklama</b><br>${esc(r.note)}</div>
    <div class="row between">${idx > 0 ? `<button class="btn ghost" ${goAttr({ view:"reader", id:R[idx - 1].id })}>← Önceki</button>` : "<span></span>"}${idx < R.length - 1 ? `<button class="btn ghost" ${goAttr({ view:"reader", id:R[idx + 1].id })}>Sonraki →</button>` : ""}</div>`);
}

/* ---------- DENEME ---------- */
function examPool(type){
  if (type === "cloze") return CL.map(c => c.qs.map((_, k) => `${c.id}:${k}`));
  if (type === "reading") return R.filter(r => r.q).map(r => r.q.map((_, k) => `${r.id}:${k}`));
  return Q.filter(q => q.t === type && !q.id.startsWith("gv")).map(q => [q.id]);
}
function buildExam(no){
  const ids = [];
  EXAM_PLAN.forEach(([type, n]) => {
    const groups = no ? shuffle(examPool(type), rng(77 + type.length * 13)) : shuffle(examPool(type));
    const flat = groups.flat(); const start = no ? ((no - 1) * n) % Math.max(1, flat.length - n + 1) : 0;
    const take = flat.slice(start, start + n); if (take.length < n) take.push(...flat.slice(0, n - take.length));
    ids.push(...take);
  });
  return ids;
}
function exam(){
  const run = S.run;
  return shell("Deneme sınavı", `
    <section class="card stack">
      <span class="eyebrow">YDS formatına yakın</span>
      <h2 style="font-size:24px">80 soru · 180 dakika</h2>
      <p class="small muted" style="margin:0">Kelime 6 · Dilbilgisi 10 · Cloze 10 · Cümle tamamlama 10 · Çeviri 6 · Okuma 20 · Diyalog 5 · Anlamca en yakın 4 · Paragraf tamamlama 4 · Anlamı bozan cümle 5. Her doğru 1,25 puan; yanlış doğruyu götürmez.</p>
      ${run ? `<button class="btn block" ${goAttr({ view:"examRun" })}>Yarım kalan denemeye devam et</button>` : ""}
      <div class="grid2"><button class="btn ${run ? "ghost" : ""}" data-ex="1">Deneme 1</button><button class="btn ${run ? "ghost" : ""}" data-ex="2">Deneme 2</button></div>
      <button class="btn soft block" data-ex="0">Karışık deneme</button>
      ${run ? '<p class="tiny muted" style="margin:0">Yeni bir deneme başlatırsan yarım kalan silinir.</p>' : ""}
    </section>
    <div class="sec">Geçmiş denemeler</div>
    ${S.exams.length ? `<section class="list">${S.exams.slice().reverse().map((e, i) => `<button class="li" ${goAttr({ view:"examResult", i:S.exams.length - 1 - i })}><span class="lv lv2">${e.name}</span><span><span class="w num">${e.score.toLocaleString("tr-TR")} puan</span> <span class="t small">· ${e.ok}/80 doğru · ${new Date(e.at).toLocaleDateString("tr-TR")}</span></span><span class="small muted">›</span></button>`).join("")}</section>`
      : `<section class="card empty muted">Henüz deneme çözmedin. İlk denemeyi çözdüğünde sonuçların burada görünür.</section>`}`);
}
document.addEventListener("click", e => { const b = e.target.closest("[data-ex]"); if (!b) return; const no = +b.dataset.ex; S.run = { no, name:no ? `Deneme ${no}` : "Karışık", ids:buildExam(no), ans:{}, k:0, start:Date.now(), limit:180 * 60000 }; save(); go({ view:"examRun" }); });
let timerH = null;
function examRun(){
  const run = S.run; if (!run) { stack.pop(); return exam(); }
  const it = itemFor(run.ids[run.k]), pk = run.ans[run.k];
  clearInterval(timerH);
  after = () => {
    const tick = () => { const ms = run.limit - (Date.now() - run.start); const el = $("#tmr"); if (!el){ clearInterval(timerH); return; } if (ms <= 0){ clearInterval(timerH); finishExam(); return; } const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; el.textContent = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`; };
    tick(); timerH = setInterval(tick, 1000);
    document.querySelectorAll(".opt").forEach(b => b.onclick = () => { const p = +b.dataset.o; run.ans[run.k] = run.ans[run.k] === p ? undefined : p; if (run.ans[run.k] === undefined) delete run.ans[run.k]; save(); render(); });
    $("#exPrev").onclick = () => { if (run.k > 0){ run.k--; save(); render(true); } };
    $("#exNext").onclick = () => { if (run.k < 79){ run.k++; save(); render(true); } else $("#exGrid").click(); };
    $("#exGrid").onclick = () => sheet(`<h2>Sorular</h2><p class="small muted" style="margin:0">${Object.keys(run.ans).length} / 80 cevaplandı</p><div class="qgrid">${run.ids.map((_, n) => `<button class="${run.ans[n] !== undefined ? "ans" : ""} ${n === run.k ? "cur" : ""}" data-j="${n}">${n + 1}</button>`).join("")}</div><button class="btn danger block" id="exFin">Sınavı bitir</button>`, el => {
      el.querySelectorAll("[data-j]").forEach(b => b.onclick = () => { run.k = +b.dataset.j; save(); el.remove(); render(true); });
      let armed = false; el.querySelector("#exFin").onclick = e => { if (!armed){ armed = true; e.target.textContent = `${80 - Object.keys(run.ans).length} boş soru var. Yine de bitir`; return; } el.remove(); finishExam(); };
    });
  };
  let stem = "";
  if (it.kind === "cloze") stem = `<div class="passage">${esc(it.c.p).replace(/\((\d)\)----/g, (m, d) => `<span class="blank ${+d === it.k + 1 ? "cur" : ""}">(${d})</span>`)}</div>`;
  else if (it.kind === "read") stem = `<div class="passage">${esc(it.r.s.map(s => s[0]).join(" "))}</div><p class="qtext" style="margin:0">${esc(it.q)}</p>`;
  else stem = `<p class="qtext" style="margin:0">${esc(it.q)}</p>`;
  return shell(run.name, `
    <div class="row between"><span class="small muted num">Soru ${run.k + 1} / 80</span><button class="btn ghost" id="exGrid" style="padding:8px 12px">Tüm sorular</button></div>
    <section class="stack">${stem}</section>
    <div class="opts">${it.o.map((o, n) => `<button class="opt ${pk === n ? "sel" : ""}" data-o="${n}"><span class="ol">${L(n)}</span><span>${esc(o)}</span></button>`).join("")}</div>
    <div class="grid2"><button class="btn ghost" id="exPrev" ${run.k === 0 ? "disabled" : ""}>← Önceki</button><button class="btn" id="exNext">${run.k === 79 ? "Sınavı bitir" : "Sonraki →"}</button></div>`,
    { right:`<span class="timer" id="tmr">3:00:00</span>`, noGear:true });
}
function secOf(id){ if (id.startsWith("cl")) return "cloze"; if (id.startsWith("rd")) return "reading"; return QI[id].t; }
function finishExam(){
  clearInterval(timerH); const run = S.run; if (!run) return;
  let ok = 0; const by = {};
  run.ids.forEach((id, n) => { const it = itemFor(id), sec = secOf(id); by[sec] = by[sec] || [0, 0]; by[sec][1]++; const p = run.ans[n]; if (p !== undefined){ const good = p === it.a; if (good){ ok++; by[sec][0]++; } record(id, good); } });
  S.exams.push({ name:run.name, ids:run.ids, ans:run.ans, ok, score:Math.round(ok * 1.25 * 100) / 100, by, at:Date.now(), dur:Date.now() - run.start });
  S.run = null; save(); stack = [{ tab:"exam" }, { view:"examResult", i:S.exams.length - 1 }]; render(true);
}
function examResult(v){
  const e = S.exams[v.i]; if (!e){ stack = [{ tab:"exam" }]; return exam(); } const target = S.profile.target;
  after = () => document.querySelectorAll("[data-rv]").forEach(b => b.onclick = () => { const n = +b.dataset.rv, it = itemFor(e.ids[n]), p = e.ans[n];
    sheet(`<span class="eyebrow">Soru ${n + 1} · ${TYPES[secOf(e.ids[n])].n}</span>${it.kind === "cloze" ? `<div class="passage">${esc(it.c.p).replace(/\((\d)\)----/g, (m, d) => `<span class="blank ${+d === it.k + 1 ? "cur" : ""}">(${d})</span>`)}</div>` : it.kind === "read" ? `<div class="passage small">${esc(it.r.s.map(s => s[0]).join(" "))}</div><p class="qtext">${esc(it.q)}</p>` : `<p class="qtext">${esc(it.q)}</p>`}
      <div class="opts">${it.o.map((o, k) => `<div class="opt ${k === it.a ? "right" : k === p ? "wrong" : ""}"><span class="ol">${L(k)}</span><span>${esc(o)}</span></div>`).join("")}</div><div class="expl"><b>${p === undefined ? `Boş bıraktın. Doğru cevap ${L(it.a)}.` : p === it.a ? "Doğru." : `Yanlış. Doğru cevap ${L(it.a)}.`}</b>${esc(it.e)}</div><button class="btn block" data-close>Kapat</button>`); });
  const m = Math.round(e.dur / 60000);
  return shell("Sonuç", `
    <section class="card hero stack">${I.rose}<span class="eyebrow" style="color:inherit;opacity:.8">${e.name}</span><span class="result-big num">${e.score.toLocaleString("tr-TR")}</span><span>${e.ok} doğru · ${80 - e.ok} yanlış/boş · ${m} dakika</span><span class="small" style="opacity:.9">${e.score >= target ? `Hedefin olan ${target} puanı geçtin.` : `Hedefin ${target}. ${Math.ceil((target - e.score) / 1.25)} doğru daha gerekiyor.`}</span></section>
    <section class="card"><div class="secrow small muted"><span>Bölüm</span><span>Doğru</span><span>%</span></div>${Object.entries(e.by).map(([k, [o, n]]) => `<div class="secrow"><span>${TYPES[k].n}</span><span class="num">${o} / ${n}</span><span class="num" style="color:${o / n >= .7 ? "var(--good)" : o / n >= .4 ? "var(--mid)" : "var(--bad)"}">%${Math.round(100 * o / n)}</span></div>`).join("")}</section>
    <div class="sec">Cevapları incele <small>Soruya dokun</small></div>
    <div class="qgrid">${e.ids.map((id, n) => { const it = itemFor(id), p = e.ans[n]; return `<button class="${p === undefined ? "" : p === it.a ? "r" : "w"}" data-rv="${n}">${n + 1}</button>`; }).join("")}</div>
    <p class="tiny muted">Yeşil doğru · kırmızı yanlış · beyaz boş. Yanlışların Pratik'teki "Yanlışlarım" listesine eklendi.</p>`);
}

/* ---------- İSTATİSTİK ---------- */
function stats(){
  const tot = Object.values(S.days).reduce((a, d) => ({ w:a.w + d.w, q:a.q + d.q, c:a.c + d.c }), { w:0, q:0, c:0 });
  const learned = Object.values(S.cards).filter(c => c.b >= 3).length, learning = Object.values(S.cards).filter(c => c.b < 3).length;
  return shell("İstatistikler", `
    <section class="grid2">
      <div class="card stat"><span class="eyebrow">Öğrenilen</span><span class="v num">${learned}</span><span class="small muted">${learning} kelime tekrarda</span></div>
      <div class="card stat"><span class="eyebrow">Seri</span><span class="v num">${streak()}</span><span class="small muted">gün üst üste · haftada 1 boş gün serini bozmaz</span></div>
      <div class="card stat"><span class="eyebrow">Çözülen soru</span><span class="v num">${tot.q}</span><span class="small muted">%${tot.q ? Math.round(100 * tot.c / tot.q) : 0} doğru</span></div>
      <div class="card stat"><span class="eyebrow">Kart tekrarı</span><span class="v num">${tot.w}</span><span class="small muted">toplam</span></div>
    </section>
    <div class="sec">Rozetler <small>${badgeList().filter(b => b.ok).length}/${badgeList().length}</small></div>
    <section class="badges">${badgeList().map(b => `<div class="badge ${b.ok ? "on" : ""}" title="${esc(b.d)}"><span>${b.ic}</span><b>${esc(b.n)}</b><small>${esc(b.d)}</small></div>`).join("")}</section>
    <div class="sec">Soru tiplerine göre başarı</div>
    <section class="card">${Object.entries(TYPES).map(([k, t]) => { const s = typeStats(k); return `<div class="secrow"><span>${t.n}</span><span class="num small muted">${s.seen}/${s.n}</span><span class="num" style="color:${s.acc === null ? "var(--muted)" : s.acc >= 70 ? "var(--good)" : s.acc >= 40 ? "var(--mid)" : "var(--bad)"}">${s.acc === null ? "–" : "%" + s.acc}</span></div>`; }).join("")}</section>
    <p class="small muted">En düşük yüzdeli soru tipine biraz daha çok zaman ayırmak puanı en hızlı yükselten yoldur.</p>`);
}

/* ---------- hatırlatma (mağaza sürümü: @capacitor/local-notifications) ---------- */
const canRemind = () => !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications);
async function scheduleReminder(){
  const LN = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications; if (!LN) return;
  try {
    await LN.cancel({ notifications:[{ id:1 }] }); const t = S.settings.rem; if (!t) return;
    if ((await LN.requestPermissions()).display !== "granted") return;
    const [h, m] = t.split(":").map(Number), due = dueList().length;
    await LN.schedule({ notifications:[{ id:1, title:"Pusula YDS", body:due ? `${due} kelimenin tekrar zamanı geldi. Günlük meydan okuma da seni bekliyor!` : "Günün kelimesi ve meydan okuması hazır. 10 dakikan var mı?", schedule:{ on:{ hour:h, minute:m }, repeats:true } }] });
  } catch(e){}
}
/* ---------- ayarlar ---------- */
function sheet(html, bind){
  const el = document.createElement("div"); el.className = "sheet-back"; el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  el.onclick = e => { if (e.target === el || e.target.closest("[data-close]")) el.remove(); };
  document.body.appendChild(el); if (bind) bind(el); return el;
}
function settings(){
  const p = S.profile;
  sheet(`<div class="row between"><h2>Ayarlar</h2><button class="iconbtn" data-close aria-label="Kapat">✕</button></div>
    <label class="field" for="sDate">Sınav tarihi<input type="date" id="sDate" value="${p.date || ""}"></label>
    <span class="eyebrow">Hedef puan</span><div class="choice c3" id="sT" role="group" aria-label="Hedef puan">${[50,60,70,80,90,100].map(n => `<button data-v="${n}" aria-pressed="${p.target === n}">${n}</button>`).join("")}</div>
    <span class="eyebrow">Günlük yeni kelime</span><div class="choice" id="sD" role="group" aria-label="Günlük yeni kelime sayısı">${[10,20,30,40].map(n => `<button data-v="${n}" aria-pressed="${p.daily === n}">${n}</button>`).join("")}</div>
    ${canRemind() ? `<span class="eyebrow">Günlük hatırlatma</span><label class="field" for="sRem">Her gün bu saatte hatırlat<input type="time" id="sRem" value="${S.settings.rem || ""}"></label><p class="tiny muted" style="margin:0">Saati silersen hatırlatma kapanır.</p>` : ""}
    <span class="eyebrow">Telaffuz</span><div class="choice" id="sAc" style="grid-template-columns:repeat(2,1fr)">${[["us","Amerikan"],["uk","İngiliz"]].map(([k, n]) => `<button data-v="${k}" aria-pressed="${(S.settings.accent || "us") === k}">${n}</button>`).join("")}</div>
    <span class="eyebrow">Görünüm</span><div class="choice" id="sTh" style="grid-template-columns:repeat(3,1fr)">${[["system","Sistem"],["light","Açık"],["dark","Koyu"]].map(([k, n]) => `<button data-v="${k}" aria-pressed="${S.settings.theme === k}">${n}</button>`).join("")}</div>
    <span class="eyebrow">Yedek</span>
    <p class="small muted" style="margin:0">İlerlemen bu cihazda saklanır. Başka cihaza geçerken yedek kodunu kopyalayıp orada yapıştır.</p>
    <div class="grid2"><button class="btn ghost" id="bCopy">Yedeği kopyala</button><button class="btn ghost" id="bLoad">Yedekten yükle</button></div>
    <textarea id="bBox" hidden aria-label="Yedek kodu"></textarea><button class="btn soft" id="bApply" hidden>Bu yedeği yükle</button>
    <button class="btn danger" id="rst">Tüm ilerlemeyi sıfırla</button>
    <div class="row" style="gap:16px"><button class="link" data-legal="privacy">Gizlilik Politikası</button><button class="link" data-legal="terms">Kullanım Koşulları</button></div>
    <p class="tiny muted" style="margin:0">Pusula YDS · Sürüm 1.0 · Tüm kelime açıklamaları, metinler ve sorular uygulamaya özgüdür. Kelime seçimi ve seviyeleri uygulamaya özgüdür. ÖSYM ile bağlantısı yoktur.</p>`, el => {
    const pick = (id, f) => el.querySelectorAll(`#${id} button`).forEach(b => b.onclick = () => { el.querySelectorAll(`#${id} button`).forEach(x => x.setAttribute("aria-pressed", x === b)); f(b.dataset.v); save(); });
    pick("sT", v => { p.target = +v; if (WS && WS.q){ const keep = WS.q.filter(i => S.cards[i]); WS.q = keep.concat(freshWords(WS.q.length - keep.length).filter(i => i !== WS.cur)); } }); pick("sD", v => p.daily = +v); pick("sTh", v => { S.settings.theme = v; applyTheme(); }); pick("sAc", v => { S.settings.accent = v; speak("pronunciation", v); });
    if (el.querySelector("#sRem")) el.querySelector("#sRem").onchange = e => { S.settings.rem = e.target.value; save(); scheduleReminder(); };
    el.querySelector("#sDate").onchange = e => { p.date = e.target.value; save(); };
    const box = el.querySelector("#bBox");
    el.querySelector("#bCopy").onclick = () => { const code = btoa(unescape(encodeURIComponent(JSON.stringify(S)))); box.hidden = false; box.value = code;
      try { navigator.clipboard.writeText(code).then(() => toast("Yedek kopyalandı"), () => { box.select(); toast("Kutudaki kodu seçip kopyala"); }); } catch(e){ box.select(); } };
    el.querySelector("#bLoad").onclick = () => { box.hidden = false; box.value = ""; box.placeholder = "Yedek kodunu buraya yapıştır"; el.querySelector("#bApply").hidden = false; box.focus(); };
    el.querySelector("#bApply").onclick = () => { try { const s = JSON.parse(decodeURIComponent(escape(atob(box.value.trim())))); if (!s || s.v !== 1) throw 0; S = norm(s); save(); stack = [{ tab:"home" }]; WS = WQ = QS = null; RD = {}; el.remove(); applyTheme(); render(true); toast("Yedek yüklendi"); } catch(e){ toast("Kod okunamadı. Tamamını kopyaladığından emin ol."); } };
    let armed = false; el.querySelector("#rst").onclick = e => { if (!armed){ armed = true; e.target.textContent = "Emin misin? Tekrar dokun"; return; } try { localStorage.removeItem(KEY); } catch(_){} S = fresh(); stack = [{ tab:"home" }]; WS = WQ = QS = null; RD = {}; el.remove(); applyTheme(); render(true); };
  });
  // sayfa ayarlar kapanınca güncellensin
  const obs = new MutationObserver(() => { if (!$(".sheet-back")){ obs.disconnect(); render(); } }); obs.observe(document.body, { childList:true });
}

/* ---------- yasal metinler ---------- */
const LEGAL = {
  privacy:["Gizlilik Politikası", `<p class="small muted">Son güncelleme: 15 Kasım 2026</p>
    <p>Pusula YDS ("Uygulama"), kişisel verilerin korunmasına önem verir. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Google Play politikaları çerçevesinde hazırlanmıştır.</p>
    <h3>Veri sorumlusu</h3><p>${DEV_NAME ? `Uygulama ${DEV_NAME} adıyla yayımlanmaktadır. Veri sorumlusu, uygulamanın Google Play sayfasında yer alan geliştirici hesabının sahibidir.` : "Veri sorumlusu, uygulamanın Google Play sayfasında adı yer alan geliştiricidir."}</p>
    <h3>Toplanan veriler</h3><p>Uygulama hesap açmanızı istemez. Adınız, e-posta adresiniz, telefon numaranız, konumunuz, rehberiniz, fotoğraflarınız veya cihaz kimliğiniz toplanmaz; geliştiriciye hiçbir kullanım verisi iletilmez.</p>
    <h3>Cihazda saklanan bilgiler</h3><p>Hedef puanınız, sınav tarihiniz, çalıştığınız kelimeler, çözdüğünüz sorular, deneme sonuçlarınız ve ayarlarınız yalnızca kendi cihazınızda, uygulamanın yerel depolama alanında saklanır. Bu bilgiler geliştiriciye veya üçüncü kişilere gönderilmez; siz silene ya da uygulamayı kaldırana kadar cihazınızda kalır.</p>
    <h3>İnternet bağlantısı ve üçüncü taraflar</h3><p>Uygulamada reklam, analiz veya takip aracı bulunmaz. Uygulama; yazı tiplerini Google Fonts hizmetinden, ${CONTENT_URL ? "yeni okuma metni ve soruları" : "ileride sunulabilecek içerik güncellemelerini"} ise geliştiricinin içerik sunucusundan indirir. Bu indirmeler sırasında, her internet bağlantısında olduğu gibi IP adresiniz ile cihaz ve tarayıcı türü bilginiz ilgili sunucuya (Google ve barındırma hizmeti sağlayıcısı) teknik olarak ulaşır ve bu sunucular yurt dışında bulunabilir. Bu isteklerle çalışma bilgileriniz gönderilmez.</p>
    <h3>Sesli okuma</h3><p>Kelimelerin sesli okunması için cihazınızın kendi konuşma (metinden sese) özelliği kullanılabilir. Bu durumda okunacak İngilizce kelime, cihazınızdaki konuşma hizmetinin sağlayıcısı tarafından işlenebilir.</p>
    <h3>Paylaşım ve yedek</h3><p>Sonuç paylaşma ve yedek kodu kopyalama yalnızca siz düğmeye dokunduğunuzda çalışır; metin, sizin seçtiğiniz uygulamaya (ör. WhatsApp) veya panoya aktarılır. Yedek kodu ilerleme bilgilerinizi içerir; kiminle paylaşacağınız sizin kontrolünüzdedir.</p>
    <h3>Bildirimler</h3><p>Günlük hatırlatma yalnızca siz bir saat seçerseniz ve bildirim izni verirseniz, cihazınızda yerel olarak oluşturulur. Hatırlatma için herhangi bir sunucuya veri gönderilmez.</p>
    <h3>Verilerin silinmesi</h3><p>Ayarlar → "Tüm ilerlemeyi sıfırla" ile veya uygulamayı kaldırarak cihazınızdaki tüm bilgileri kalıcı olarak silebilirsiniz. Geliştiricide size ait kayıt tutulmadığı için ayrıca silinecek bir veri bulunmaz.</p>
    <h3>Haklarınız</h3><p>KVKK'nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme ve itiraz etme haklarına sahipsiniz.</p>
    <h3>Çocuklar</h3><p>Uygulama yetişkin sınav adaylarına yöneliktir; çocuklara yönelik değildir ve çocuklardan bilerek veri toplamaz.</p>
    <h3>İletişim ve değişiklikler</h3><p>Sorularınız ve KVKK kapsamındaki talepleriniz için ${DEV_MAIL ? `${DEV_MAIL} adresine yazabilirsiniz` : "geliştiriciye Google Play'deki uygulama sayfasında yer alan iletişim adresinden ulaşabilirsiniz"}. Bu politika güncellenirse yeni sürüm uygulama içinde yayımlanır.</p>`],
  terms:["Kullanım Koşulları", `<p class="small muted">Son güncelleme: 15 Kasım 2026</p>
    <p>Pusula YDS'yi kullanarak aşağıdaki koşulları kabul etmiş olursunuz.</p>
    <h3>Hizmetin niteliği</h3><p>Uygulama, Yabancı Dil Bilgisi Seviye Tespit Sınavı'na (YDS) hazırlık için ücretsiz bir çalışma aracıdır. ÖSYM ile herhangi bir bağlantısı yoktur; resmî sınav soruları içermez.</p>
    <h3>Puan tahmini</h3><p>Uygulamada gösterilen puan tahminleri ve deneme sonuçları yalnızca fikir vermek içindir; gerçek sınav sonucunu garanti etmez.</p>
    <h3>İçerik ve fikrî haklar</h3><p>Kelime açıklamaları, örnek cümleler, okuma metinleri ve sorular uygulamaya özgüdür ve izin alınmadan kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz. Kelime seçimi, seviyeler ve tür etiketleri uygulamaya özgü editoryal değerlendirmeyle, kullanım sıklığı ve YDS'de görülme durumu dikkate alınarak belirlenmiştir.</p>
    <h3>Sorumluluğun sınırı</h3><p>Uygulama "olduğu gibi" sunulur. İçeriklerin doğruluğu için özen gösterilir; ancak hata bulunabilir. Cihaz değişikliği, uygulamanın silinmesi veya uygulama verilerinin temizlenmesi sonucu ilerlemenin kaybolmasından geliştirici sorumlu değildir; düzenli olarak yedek kodu almanız önerilir.</p>
    <h3>Değişiklikler</h3><p>Koşullar güncellenebilir; güncel metin her zaman uygulama içinde yer alır.</p>`]
};
document.addEventListener("click", e => { if (!e.target.closest("#wkShare")) return; const ws = weekSummary(), txt = `Pusula YDS ile bu hafta: ${ws.act}/7 gün çalıştım, ${ws.n} yeni kelime öğrendim, ${ws.q} soru çözdüm.${ws.q ? ` Doğruluk: %${Math.round(100 * ws.c / ws.q)}.` : ""}`;
  if (navigator.share) navigator.share({ text:txt + " " + STORE_URL }).catch(() => {}); else { try { navigator.clipboard.writeText(txt + " " + STORE_URL).then(() => toast("Özet kopyalandı"), () => toast(txt)); } catch (err){ toast(txt); } } });
document.addEventListener("click", e => { const b = e.target.closest("[data-legal]"); if (!b) return; const [t, body] = LEGAL[b.dataset.legal]; if (document.querySelector(".sheet-back .legal")) return; sheet(`<div class="row between"><h2>${t}</h2><button class="iconbtn" data-close aria-label="Kapat">✕</button></div><div class="lesson stack legal">${body}</div>`); });

/* ---------- başlat ---------- */
document.documentElement.lang = "tr"; // ekran okuyucu + büyük harf dönüşümünde doğru İ/I
applyTheme();
function boot(tries){
  W = []; G = []; Q = []; CL = []; R = []; QI = {}; DICT = {}; PH = {};
  loadData().then(() => {
    // Uygulama kısayolları (ikona basılı tutunca): ?go=study | daily | exam | words
    try { const g = new URLSearchParams(location.search).get("go"), M = { words:[{ tab:"words" }], study:[{ tab:"words" }, { view:"wordStudy" }], daily:[{ tab:"practice" }, { view:"qsession", type:"daily" }], exam:[{ tab:"exam" }] };
      if (g && M[g] && S.profile) { stack = M[g]; history.replaceState(null, "", location.pathname); } } catch (e) {}
    render(true); scheduleReminder(); }).catch(err => {
    if (tries > 0){ setTimeout(() => boot(tries - 1), 800); return; }
    console.error(err);
    $("#app").innerHTML = `<div class="onb"><h1>Yüklenemedi</h1><p class="muted">Uygulama içeriği açılamadı. İnternet bağlantını kontrol edip tekrar dene. İlerlemen silinmedi.</p><button class="btn block" id="retry">Tekrar dene</button></div>`;
    $("#retry").onclick = () => { $("#app").innerHTML = `<div class="onb"><h1>Pusula YDS</h1><p>Yükleniyor…</p></div>`; boot(1); };
  });
}
boot(1);
if ("serviceWorker" in navigator && location.protocol === "https:") { navigator.serviceWorker.register("sw.js").catch(() => {}); }
})();
