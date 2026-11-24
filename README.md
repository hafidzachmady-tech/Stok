<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>
<title>Stok Kelontong</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
<style>
/* Layout: sidebar + konten di layar lebar; bilah menu bawah di HP. Hijau daun di atas abu kehijauan. */
:root{
  --bg:#F0F4F1; --surface:#FFFFFF; --surface-2:#E6EDE8; --ink:#15221B; --muted:#566860; --line:#D7E0D9;
  --accent:#17694A; --accent-ink:#FFFFFF; --accent-soft:#DFF0E7; --accent-soft-ink:#0F5A3D;
  --warn-bg:#FFF0DA; --warn-ink:#8A3B00; --bad-bg:#FDE6E3; --bad-ink:#A3200F; --ok-bg:#DFF0E7; --ok-ink:#0F5A3D;
  --overlay:rgba(12,24,18,.55);
  --font:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0E1612; --surface:#16211B; --surface-2:#1F2D25; --ink:#E7EFE9; --muted:#9DB0A5; --line:#2B3A31;
    --accent:#4FBF8C; --accent-ink:#06130C; --accent-soft:#1B3A2C; --accent-soft-ink:#9BE0BE;
    --warn-bg:#3A2A12; --warn-ink:#F5C487; --bad-bg:#3E1D19; --bad-ink:#F5A89E; --ok-bg:#1B3A2C; --ok-ink:#9BE0BE;
    --overlay:rgba(0,0,0,.65); color-scheme:dark;
  }
}
:root[data-theme="dark"]{
  --bg:#0E1612; --surface:#16211B; --surface-2:#1F2D25; --ink:#E7EFE9; --muted:#9DB0A5; --line:#2B3A31;
  --accent:#4FBF8C; --accent-ink:#06130C; --accent-soft:#1B3A2C; --accent-soft-ink:#9BE0BE;
  --warn-bg:#3A2A12; --warn-ink:#F5C487; --bad-bg:#3E1D19; --bad-ink:#F5A89E; --ok-bg:#1B3A2C; --ok-ink:#9BE0BE;
  --overlay:rgba(0,0,0,.65); color-scheme:dark;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font);font-size:15px;line-height:1.45}
button,input,select,textarea{font:inherit;color:inherit}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.app{display:grid;grid-template-columns:minmax(0,1fr);min-height:100vh}
.side{display:none}
main{min-width:0;padding-block:20px 112px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.inner{max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.top h1{margin:0;font-size:26px;line-height:1.2;font-weight:800;text-wrap:balance}
.date{font-size:13px;color:var(--muted);font-weight:500}
#actions{display:flex;gap:8px;flex-wrap:wrap}
/* tombol */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:12px;border:1px solid var(--accent);background:var(--accent);color:var(--accent-ink);font-weight:700;font-size:15px;cursor:pointer;text-decoration:none;white-space:nowrap}
.btn:hover{filter:brightness(1.07)}
.btn.ghost{background:transparent;color:var(--accent);border-color:var(--line)}
.btn.ghost:hover{background:var(--surface-2);filter:none}
.btn.danger{color:var(--bad-ink)}
.btn.bad{background:var(--bad-ink);border-color:var(--bad-ink);color:var(--surface)}
.btn.sm{min-height:44px;padding:0 14px;font-size:14px}
.btn[aria-disabled="true"]{opacity:.45;pointer-events:none}
/* kartu & daftar */
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px}
.card>h2,.panel-h h2{margin:0;font-size:17px;font-weight:800}
.panel-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px 4px}
.panel-h a{font-weight:700;color:var(--accent);text-decoration:none;min-height:44px;display:inline-flex;align-items:center}
.panel-h a:hover{text-decoration:underline}
ul.list{list-style:none;margin:0;padding:0}
ul.list>li{border-top:1px solid var(--line)}
ul.list>li:first-child{border-top:0}
.row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px}
.row .t{font-weight:700}
.row .s{font-size:13px;color:var(--muted);margin-top:2px}
.row>div:first-child{min-width:0}
.empty{padding:20px 16px;color:var(--muted)}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.tile{padding:14px 16px;border-radius:14px;border:1px solid var(--line);background:var(--surface)}
.tile .l{font-size:13px;font-weight:600;color:var(--muted)}
.tile .n{font-size:30px;font-weight:800;line-height:1.1;margin-top:6px;font-variant-numeric:tabular-nums}
.tile.warn{background:var(--warn-bg);border-color:transparent;color:var(--warn-ink)}
.tile.warn .l{color:inherit}
.tile.bad{background:var(--bad-bg);border-color:transparent;color:var(--bad-ink)}
.tile.bad .l{color:inherit}
.two{display:grid;grid-template-columns:minmax(0,1fr);gap:20px}
/* status */
.pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}
.pill svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.pill.habis{background:var(--bad-bg);color:var(--bad-ink)}
.pill.menipis{background:var(--warn-bg);color:var(--warn-ink)}
.pill.aman{background:var(--ok-bg);color:var(--ok-ink)}
.plus{color:var(--ok-ink);font-weight:800;font-variant-numeric:tabular-nums}
.minus{font-weight:800;font-variant-numeric:tabular-nums}
/* barang */
.tools{display:flex;gap:10px;flex-wrap:wrap}
.tools .grow{flex:1 1 220px;min-width:0}
.field{width:100%;min-height:48px;padding:0 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-size:16px}
select.field{padding-right:10px}
.item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;align-items:center;padding:12px 16px}
.item .t{font-weight:700}
.item .s{font-size:13px;color:var(--muted);margin-top:2px}
.item .stk{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.item .num{font-size:20px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}
.item .num span{font-size:12px;font-weight:600;color:var(--muted)}
.item .acts{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--line);background:var(--surface);font-weight:600;cursor:pointer}
.chip[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);font-weight:700}
.day{margin:0 0 8px;font-size:14px;font-weight:800;color:var(--muted)}
.ico{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--surface-2)}
.ico.in{background:var(--ok-bg);color:var(--ok-ink)}
.ico svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.lg{display:flex;align-items:center;gap:12px;padding:12px 16px}
.lg .m{flex:1;min-width:0}
.lg .t{font-weight:700}.lg .s{font-size:13px;color:var(--muted);margin-top:2px}
.lg .d{font-size:17px}
/* belanja */
.buy{display:flex;align-items:center;gap:14px;padding:12px 16px;min-height:44px}
.buy input[type=checkbox]{width:24px;height:24px;accent-color:var(--accent);margin:0;flex:none}
.buy .m{flex:1;min-width:0}
.buy .q{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted);font-weight:600}
.buy .q input{width:76px;min-height:44px;padding:0 10px;border:1px solid var(--line);border-radius:10px;background:var(--surface);font-size:16px;text-align:right}
textarea.prev{width:100%;min-height:150px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-size:14px;line-height:1.5;resize:vertical}
.note{font-size:13px;color:var(--muted);line-height:1.55;margin:0}
.foot{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--line)}
.linkbtn{background:none;border:0;padding:0 4px;min-height:44px;color:var(--accent);font-weight:700;cursor:pointer;text-decoration:underline}
/* navigasi */
.tabs{position:fixed;left:0;right:0;bottom:0;display:flex;background:var(--surface);border-top:1px solid var(--line);padding:0 max(0px,env(safe-area-inset-left,0px)) env(safe-area-inset-bottom,0px) max(0px,env(safe-area-inset-right,0px));z-index:20}
.tabs a,.tabs button{flex:1;min-width:0;min-height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:0;color:var(--muted);font-size:12px;font-weight:600;text-decoration:none;cursor:pointer;position:relative}
.tabs svg,.side svg.n{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.tabs a[aria-current="page"]{color:var(--accent);font-weight:800}
.tabs .add span{width:44px;height:44px;border-radius:14px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center}
.tabs .add{color:var(--accent);font-weight:800}
.badge{position:absolute;top:6px;left:calc(50% + 8px);min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--bad-ink);color:var(--surface);font-size:11px;font-weight:800;display:grid;place-items:center}
@media (min-width:900px){
  .app{grid-template-columns:248px minmax(0,1fr)}
  .tabs{display:none}
  .side{display:flex;flex-direction:column;gap:6px;position:sticky;top:0;align-self:start;height:100vh;padding:24px 16px;background:var(--surface);border-right:1px solid var(--line)}
  .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;padding:0 8px 18px}
  .brand span{width:38px;height:38px;border-radius:11px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center}
  .brand svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .side a{display:flex;align-items:center;gap:12px;min-height:46px;padding:0 12px;border-radius:12px;color:var(--ink);text-decoration:none;font-weight:600}
  .side a:hover{background:var(--surface-2)}
  .side a[aria-current="page"]{background:var(--accent-soft);color:var(--accent-soft-ink);font-weight:800}
  .side .btn{margin-top:14px;width:100%}
  .side .push{flex:1}
  .side .badge{position:static;margin-left:auto}
  main{padding-block:32px 56px;padding-left:max(36px,env(safe-area-inset-left,0px));padding-right:max(36px,env(safe-area-inset-right,0px))}
  .two{grid-template-columns:repeat(2,minmax(0,1fr))}
  .item{grid-template-columns:minmax(0,1fr) 150px auto}
  .item .acts{grid-column:auto;flex-wrap:nowrap}
  .item .stk{align-items:flex-start}
}
/* modal */
#modal[hidden]{display:none!important}
.ov{position:fixed;inset:0;z-index:50;background:var(--overlay);display:flex;align-items:center;justify-content:center;padding:16px max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));overflow:auto}
.dlg{width:100%;max-width:460px;max-height:100%;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:14px}
.dlg h2{margin:0;font-size:20px;font-weight:800}
.fg{display:flex;flex-direction:column;gap:6px}
.fg label{font-size:14px;font-weight:700}
.fg .h{font-size:12px;color:var(--muted)}
.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.err{margin:0;color:var(--bad-ink);font-weight:600;font-size:14px}
.btns{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}
.seg{display:flex;padding:4px;gap:4px;background:var(--surface-2);border-radius:14px}
.seg button{flex:1;min-height:44px;border:0;border-radius:10px;background:transparent;font-weight:600;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);font-weight:800}
.stp{display:flex;align-items:center;gap:12px}
.stp .step{width:56px;height:56px;border-radius:16px;border:1px solid var(--line);background:var(--surface-2);font-size:26px;font-weight:700;cursor:pointer}
.stp .step.p{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.stp input{flex:1;min-width:0;height:56px;text-align:center;font-size:30px;font-weight:800;border:1px solid var(--line);border-radius:14px;background:var(--surface)}
.quick{display:flex;gap:8px}
.quick button{flex:1;min-height:44px;border-radius:10px;border:1px solid var(--line);background:var(--surface);font-weight:700;cursor:pointer}
.after{padding:12px 14px;border-radius:14px;background:var(--ok-bg);color:var(--ok-ink)}
.after.low{background:var(--warn-bg);color:var(--warn-ink)}
.after.bad{background:var(--bad-bg);color:var(--bad-ink)}
.after b{display:block;font-size:20px;margin-top:2px}
#toast{position:fixed;left:50%;bottom:calc(88px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);max-width:calc(100% - 32px);padding:12px 18px;border-radius:12px;background:var(--ink);color:var(--bg);font-weight:600;font-size:14px;z-index:60;opacity:0;pointer-events:none;transition:opacity .2s}
#toast.on{opacity:1}
@media (min-width:900px){#toast{bottom:28px}}
@media (prefers-reduced-motion:reduce){#toast{transition:none}}
</style>

<div class="app">
  <aside class="side" aria-label="Menu samping">
    <div class="brand"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"/><path d="M5 12v8h14v-8"/></svg></span>Stok Kelontong</div>
    <div id="side-nav" style="display:flex;flex-direction:column;gap:6px"></div>
    <button type="button" class="btn" data-act="new-stock"><svg class="n" style="width:20px;height:20px" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Catat stok</button>
    <div class="push"></div>
    <p class="note">Prototipe. Data contoh tersimpan hanya di browser ini dan belum memakai login.</p>
  </aside>

  <main>
    <div class="inner">
      <header class="top">
        <div>
          <div class="date" id="date"></div>
          <h1 id="title">Ringkasan</h1>
        </div>
        <div id="actions"></div>
      </header>
      <section id="view" aria-live="polite"></section>
      <div class="foot">
        <p class="note">Prototipe: data contoh disimpan hanya di browser ini, belum ada login atau database.</p>
        <button type="button" class="linkbtn" data-act="reset" id="reset-btn">Kembalikan data contoh</button>
      </div>
    </div>
  </main>

  <nav class="tabs" id="tabs" aria-label="Menu utama"></nav>
</div>
<div id="modal" hidden></div>
<div id="toast" role="status" aria-live="polite"></div>

<script>
(function () {
  var KEY = 'stok-kelontong-v1';
  var NAV = [
    ['ringkasan', 'Ringkasan', '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'],
    ['barang', 'Barang', '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>'],
    ['riwayat', 'Riwayat', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],
    ['belanja', 'Belanja', '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11l2-8H6"/>']
  ];
  var TITLES = { ringkasan: 'Ringkasan stok', barang: 'Daftar barang', riwayat: 'Riwayat stok', belanja: 'Daftar belanja' };
  var DEFAULT_KAT = ['Sembako', 'Mi & Snack', 'Minuman', 'Kebersihan'];
  var state = { data: null, view: 'ringkasan', q: '', kat: '', jenis: 'semua', cart: {}, modal: null, resetArm: false, lastFocus: null };

  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function n(v) { return Math.max(0, Math.floor(Number(v) || 0)); }
  function rp(v) { return 'Rp ' + Number(v).toLocaleString('id-ID'); }
  function svg(p, w) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (w ? ' style="width:' + w + 'px;height:' + w + 'px"' : '') + '>' + p + '</svg>'; }
  function find(id) { return state.data.items.filter(function (i) { return i.id === id; })[0]; }

  function seed() {
    var H = 3600000, now = Date.now();
    var raw = [
      ['Beras Pandan Wangi 5 kg', 'Sembako', 'pak', 66000, 72000, 14, 5],
      ['Minyak Goreng 1 L', 'Sembako', 'botol', 16000, 18000, 2, 6],
      ['Gula Pasir 1 kg', 'Sembako', 'kg', 15500, 17000, 0, 5],
      ['Telur Ayam', 'Sembako', 'kg', 25500, 28000, 3, 8],
      ['Tepung Terigu 1 kg', 'Sembako', 'kg', 11000, 13000, 9, 5],
      ['Kecap Manis 135 ml', 'Sembako', 'botol', 7500, 9000, 11, 4],
      ['Indomie Goreng', 'Mi & Snack', 'bungkus', 3000, 3500, 120, 40],
      ['Kopi Kapal Api sachet', 'Minuman', 'sachet', 1200, 1500, 38, 30],
      ['Teh Celup 25 kantong', 'Minuman', 'kotak', 5500, 7000, 18, 6],
      ['Air Mineral 600 ml', 'Minuman', 'botol', 2400, 3000, 48, 24],
      ['Sabun Mandi Batang', 'Kebersihan', 'batang', 3200, 4000, 4, 12],
      ['Detergen Sachet', 'Kebersihan', 'sachet', 1000, 1500, 60, 24]
    ];
    var items = raw.map(function (r) { return { id: uid(), nama: r[0], kategori: r[1], satuan: r[2], beli: r[3], jual: r[4], stok: r[5], min: r[6] }; });
    function byName(nm) { return items.filter(function (i) { return i.nama.indexOf(nm) === 0; })[0]; }
    var lg = [
      ['Beras', 'keluar', 1, '', 1], ['Indomie', 'masuk', 40, 'Kulakan dari agen', 2], ['Kopi', 'keluar', 6, '', 3],
      ['Minyak', 'keluar', 4, '', 26], ['Telur', 'keluar', 5, '', 27], ['Gula', 'keluar', 3, '', 30]
    ].map(function (r) { var it = byName(r[0]); return { id: uid(), t: now - r[4] * H, itemId: it.id, nama: it.nama, jenis: r[1], jumlah: r[2], catatan: r[3] }; });
    return { items: items, log: lg };
  }
  function load() {
    try {
      var r = localStorage.getItem(KEY);
      if (r) { var d = JSON.parse(r); if (d && Array.isArray(d.items) && Array.isArray(d.log)) return d; }
    } catch (e) {}
    return seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state.data)); } catch (e) {} }

  function status(i) { return i.stok <= 0 ? 'habis' : (i.stok <= i.min ? 'menipis' : 'aman'); }
  var RANK = { habis: 0, menipis: 1, aman: 2 };
  function urg(a, b) { return (RANK[status(a)] - RANK[status(b)]) || ((a.stok - a.min) - (b.stok - b.min)) || a.nama.localeCompare(b.nama, 'id'); }
  var PILL = {
    habis: ['Habis', '<circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/>'],
    menipis: ['Menipis', '<path d="M12 3l10 18H2z"/><path d="M12 10v4"/>'],
    aman: ['Aman', '<path d="M5 12l5 5 9-10"/>']
  };
  function pill(i) { var s = status(i); return '<span class="pill ' + s + '">' + svg(PILL[s][1]) + PILL[s][0] + '</span>'; }
  function timeStr(t) { return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); }
  function dayLabel(t) {
    var d = new Date(t), td = new Date(), y = new Date(Date.now() - 86400000);
    if (d.toDateString() === td.toDateString()) return 'Hari ini';
    if (d.toDateString() === y.toDateString()) return 'Kemarin';
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function todayStr() { return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  /* ---------- tampilan ---------- */
  function lowItems() { return state.data.items.filter(function (i) { return status(i) !== 'aman'; }).sort(urg); }

  function viewRingkasan() {
    var items = state.data.items, low = lowItems();
    var habis = items.filter(function (i) { return status(i) === 'habis'; }).length;
    var menipis = items.filter(function (i) { return status(i) === 'menipis'; }).length;
    var nilai = items.reduce(function (a, i) { return a + i.stok * i.beli; }, 0);
    var recent = state.data.log.slice().sort(function (a, b) { return b.t - a.t; }).slice(0, 5);
    var h = '<div class="tiles">' +
      '<div class="tile"><div class="l">Total barang</div><div class="n">' + items.length + '</div></div>' +
      '<div class="tile warn"><div class="l">Menipis</div><div class="n">' + menipis + '</div></div>' +
      '<div class="tile bad"><div class="l">Habis</div><div class="n">' + habis + '</div></div>' +
      '<div class="tile"><div class="l">Nilai stok (harga beli)</div><div class="n" style="font-size:22px;padding-top:6px">' + rp(nilai) + '</div></div></div>';
    h += '<div class="two" style="margin-top:20px"><section class="card"><div class="panel-h"><h2>Perlu dibeli ulang</h2><a href="#belanja">Lihat semua</a></div>';
    if (!low.length) h += '<p class="empty">Semua barang di atas batas minimum.</p>';
    else h += '<ul class="list">' + low.slice(0, 5).map(function (i) {
      return '<li class="row"><div><div class="t">' + esc(i.nama) + '</div><div class="s">Sisa ' + i.stok + ' ' + esc(i.satuan) + ' · Minimum ' + i.min + '</div></div>' + pill(i) + '</li>';
    }).join('') + '</ul>';
    h += '</section><section class="card"><div class="panel-h"><h2>Perubahan terakhir</h2><a href="#riwayat">Riwayat</a></div>';
    if (!recent.length) h += '<p class="empty">Belum ada catatan stok masuk atau keluar.</p>';
    else h += '<ul class="list">' + recent.map(function (l) {
      var m = l.jenis === 'masuk';
      return '<li class="row"><div><div class="t">' + esc(l.nama) + '</div><div class="s">' + (m ? 'Masuk' : 'Keluar') + ' · ' + dayLabel(l.t) + ', ' + timeStr(l.t) + '</div></div><div class="' + (m ? 'plus' : 'minus') + '">' + (m ? '+' : '−') + l.jumlah + '</div></li>';
    }).join('') + '</ul>';
    return h + '</section></div>';
  }

  function categories() {
    var set = {}; DEFAULT_KAT.forEach(function (k) { set[k] = 1; });
    state.data.items.forEach(function (i) { set[i.kategori] = 1; });
    return Object.keys(set);
  }
  function itemRow(i) {
    return '<li class="item"><div style="min-width:0"><div class="t">' + esc(i.nama) + '</div><div class="s">' + esc(i.kategori) + ' · ' + rp(i.jual) + ' · Minimum ' + i.min + '</div></div>' +
      '<div class="stk"><div class="num">' + i.stok + ' <span>' + esc(i.satuan) + '</span></div>' + pill(i) + '</div>' +
      '<div class="acts"><button type="button" class="btn sm" data-act="new-stock" data-id="' + i.id + '">Catat stok</button>' +
      '<button type="button" class="btn ghost sm" data-act="edit-item" data-id="' + i.id + '">Ubah</button>' +
      '<button type="button" class="btn ghost sm danger" data-act="del-item" data-id="' + i.id + '">Hapus</button></div></li>';
  }
  function barangList() {
    var q = state.q.trim().toLowerCase();
    var rows = state.data.items.filter(function (i) {
      return (!state.kat || i.kategori === state.kat) && (!q || i.nama.toLowerCase().indexOf(q) > -1);
    }).sort(urg);
    $('#count').textContent = rows.length + ' dari ' + state.data.items.length + ' barang, stok paling sedikit di atas';
    $('#barang-list').innerHTML = rows.length ? rows.map(itemRow).join('') :
      '<li class="empty">' + (state.data.items.length ? 'Tidak ada barang yang cocok. Ubah kata pencarian atau kategori.' : 'Belum ada barang. Tekan “Tambah barang” untuk mulai.') + '</li>';
  }
  function viewBarang() {
    var opts = '<option value="">Semua kategori</option>' + categories().map(function (k) { return '<option' + (state.kat === k ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('');
    return '<div class="tools"><div class="grow"><label for="cari" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Cari barang</label>' +
      '<input id="cari" class="field" type="search" placeholder="Cari nama barang" value="' + esc(state.q) + '" autocomplete="off"></div>' +
      '<div><label for="kat" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Kategori</label><select id="kat" class="field">' + opts + '</select></div></div>' +
      '<p class="note" id="count" style="margin:12px 0"></p><div class="card"><ul class="list" id="barang-list"></ul></div>';
  }

  function viewRiwayat() {
    var chips = [['semua', 'Semua'], ['masuk', 'Masuk'], ['keluar', 'Keluar']].map(function (c) {
      return '<button type="button" class="chip" data-act="jenis" data-v="' + c[0] + '" aria-pressed="' + (state.jenis === c[0]) + '">' + c[1] + '</button>';
    }).join('');
    var rows = state.data.log.filter(function (l) { return state.jenis === 'semua' || l.jenis === state.jenis; }).sort(function (a, b) { return b.t - a.t; });
    var h = '<div class="chips" role="group" aria-label="Filter jenis">' + chips + '</div><div style="margin-top:16px;display:flex;flex-direction:column;gap:16px">';
    if (!rows.length) return h + '<p class="empty card">Belum ada catatan.</p></div>';
    var groups = [], idx = {};
    rows.forEach(function (l) { var k = dayLabel(l.t); if (!(k in idx)) { idx[k] = groups.length; groups.push([k, []]); } groups[idx[k]][1].push(l); });
    groups.forEach(function (g) {
      h += '<section><h2 class="day">' + esc(g[0]) + '</h2><div class="card"><ul class="list">' + g[1].map(function (l) {
        var m = l.jenis === 'masuk';
        return '<li class="lg"><span class="ico' + (m ? ' in' : '') + '">' + svg(m ? '<path d="M12 5v14M6 13l6 6 6-6"/>' : '<path d="M12 19V5M6 11l6-6 6 6"/>') + '</span>' +
          '<div class="m"><div class="t">' + esc(l.nama) + '</div><div class="s">' + (m ? 'Masuk' : 'Keluar') + ' · ' + timeStr(l.t) + (l.catatan ? ' · ' + esc(l.catatan) : '') + '</div></div>' +
          '<div class="d ' + (m ? 'plus' : 'minus') + '">' + (m ? '+' : '−') + l.jumlah + '</div></li>';
      }).join('') + '</ul></div></section>';
    });
    return h + '</div>';
  }

  function suggest(i) { return Math.max(1, i.min * 2 - i.stok); }
  function cartOf(i) { var c = state.cart[i.id]; if (!c) c = state.cart[i.id] = { on: true, qty: suggest(i) }; return c; }
  function buildMsg() {
    var lines = lowItems().filter(function (i) { var c = cartOf(i); return c.on && c.qty > 0; }).map(function (i, k) { return (k + 1) + '. ' + i.nama + ': ' + cartOf(i).qty + ' ' + i.satuan; });
    return lines.length ? 'Daftar belanja ' + todayStr() + '\n' + lines.join('\n') : '';
  }
  function viewBelanja() {
    var low = lowItems();
    var h = '<p class="note" style="margin-bottom:12px">' + low.length + ' barang di bawah batas minimum. Saran jumlah beli adalah dua kali batas minimum dikurangi sisa stok, dan boleh diubah.</p>';
    if (!low.length) return h + '<p class="empty card">Tidak ada yang perlu dibeli ulang.</p>';
    h += '<div class="card"><ul class="list">' + low.map(function (i) {
      var c = cartOf(i);
      return '<li><div class="buy"><input type="checkbox" id="c-' + i.id + '" data-cart="' + i.id + '"' + (c.on ? ' checked' : '') + ' aria-label="Beli ' + esc(i.nama) + '">' +
        '<label for="c-' + i.id + '" class="m"><span style="display:block;font-weight:700">' + esc(i.nama) + '</span><span style="display:block;font-size:13px;color:var(--muted);margin-top:2px">Sisa ' + i.stok + ' · Minimum ' + i.min + '</span></label>' +
        '<div class="q"><label for="q-' + i.id + '" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Jumlah beli ' + esc(i.nama) + '</label><input id="q-' + i.id + '" type="number" inputmode="numeric" min="0" step="1" value="' + c.qty + '" data-qty="' + i.id + '">' + esc(i.satuan) + '</div></div></li>';
    }).join('') + '</ul></div>';
    h += '<div style="display:flex;flex-direction:column;gap:10px;margin-top:16px"><label for="prev" style="font-weight:700;font-size:14px">Teks yang akan dikirim</label>' +
      '<textarea id="prev" class="prev" readonly></textarea>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><a id="wa" class="btn" href="#belanja" target="_blank" rel="noopener">' + svg('<path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>', 20) + 'Bagikan ke WhatsApp</a>' +
      '<button type="button" class="btn ghost" data-act="copy" id="copy">Salin daftar</button></div>' +
      '<p class="note">Yang dikirim hanya teks daftar barang. Tidak ada data pelanggan.</p></div>';
    return h;
  }
  function refreshBelanja() {
    var p = $('#prev'), a = $('#wa'), c = $('#copy'); if (!p) return;
    var m = buildMsg(); p.value = m || 'Belum ada barang yang dicentang.';
    a.href = m ? 'https://wa.me/?text=' + encodeURIComponent(m) : '#belanja';
    a.setAttribute('aria-disabled', m ? 'false' : 'true'); c.setAttribute('aria-disabled', m ? 'false' : 'true');
  }

  var VIEWS = { ringkasan: viewRingkasan, barang: viewBarang, riwayat: viewRiwayat, belanja: viewBelanja };

  function actionsFor(v) {
    if (v === 'barang') return '<button type="button" class="btn" data-act="add-item">' + svg('<path d="M12 5v14M5 12h14"/>', 20).replace('<svg', '<svg fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"') + 'Tambah barang</button>';
    return '';
  }
  function renderNav() {
    var low = lowItems().length;
    var side = NAV.map(function (x) {
      return '<a href="#' + x[0] + '"' + (state.view === x[0] ? ' aria-current="page"' : '') + '>' + '<svg class="n" viewBox="0 0 24 24" aria-hidden="true">' + x[2] + '</svg>' + x[1] + (x[0] === 'belanja' && low ? '<span class="badge">' + low + '</span>' : '') + '</a>';
    }).join('');
    $('#side-nav').innerHTML = side;
    var tabs = NAV.slice(0, 2).concat([['catat']], NAV.slice(2)).map(function (x) {
      if (x[0] === 'catat') return '<button type="button" class="add" data-act="new-stock" aria-label="Catat stok"><span>' + svg('<path d="M12 5v14M5 12h14"/>').replace('<svg', '<svg fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"') + '</span></button>';
      return '<a href="#' + x[0] + '"' + (state.view === x[0] ? ' aria-current="page"' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true">' + x[2] + '</svg>' + x[1] + (x[0] === 'belanja' && low ? '<span class="badge">' + low + '</span>' : '') + '</a>';
    }).join('');
    $('#tabs').innerHTML = tabs;
  }
  function render() {
    var v = state.view;
    $('#title').textContent = TITLES[v];
    $('#actions').innerHTML = actionsFor(v);
    $('#view').innerHTML = VIEWS[v]();
    if (v === 'barang') barangList();
    if (v === 'belanja') refreshBelanja();
    renderNav();
  }
  function route() {
    var h = (location.hash || '').slice(1);
    state.view = VIEWS[h] ? h : 'ringkasan';
    render();
  }

  /* ---------- modal ---------- */
  function datalist() { return '<datalist id="kat-list">' + categories().map(function (k) { return '<option value="' + esc(k) + '">'; }).join('') + '</datalist>'; }
  function itemModal(id) {
    var it = id ? find(id) : null;
    var v = it || { nama: '', kategori: '', satuan: 'pcs', beli: 0, jual: 0, stok: 0, min: 5 };
    return '<div class="ov" data-act="close-bg"><form class="dlg" id="item-form" data-id="' + (it ? it.id : '') + '" role="dialog" aria-modal="true" aria-labelledby="dt" novalidate>' +
      '<h2 id="dt">' + (it ? 'Ubah barang' : 'Tambah barang') + '</h2>' +
      '<div class="fg"><label for="f-nama">Nama barang</label><input id="f-nama" class="field" maxlength="60" value="' + esc(v.nama) + '" data-autofocus autocomplete="off"></div>' +
      '<div class="grid2"><div class="fg"><label for="f-kat">Kategori</label><input id="f-kat" class="field" list="kat-list" maxlength="30" value="' + esc(v.kategori) + '" autocomplete="off"></div>' +
      '<div class="fg"><label for="f-sat">Satuan</label><input id="f-sat" class="field" maxlength="15" value="' + esc(v.satuan) + '" autocomplete="off"></div></div>' + datalist() +
      '<div class="grid2"><div class="fg"><label for="f-beli">Harga beli (Rp)</label><input id="f-beli" class="field" type="number" inputmode="numeric" min="0" step="1" value="' + v.beli + '"></div>' +
      '<div class="fg"><label for="f-jual">Harga jual (Rp)</label><input id="f-jual" class="field" type="number" inputmode="numeric" min="0" step="1" value="' + v.jual + '"></div></div>' +
      '<div class="grid2"><div class="fg"><label for="f-min">Batas minimum</label><input id="f-min" class="field" type="number" inputmode="numeric" min="0" step="1" value="' + v.min + '"></div>' +
      (it ? '<div class="fg"><span style="font-size:14px;font-weight:700">Stok sekarang</span><div style="min-height:48px;display:flex;align-items:center;font-weight:800">' + it.stok + ' ' + esc(it.satuan) + '</div><span class="h">Ubah lewat Catat stok</span></div>'
          : '<div class="fg"><label for="f-stok">Stok awal</label><input id="f-stok" class="field" type="number" inputmode="numeric" min="0" step="1" value="0"></div>') + '</div>' +
      '<p class="err" id="ferr" role="alert" hidden></p>' +
      '<div class="btns"><button type="button" class="btn ghost" data-act="close">Batal</button><button type="submit" class="btn">Simpan</button></div></form></div>';
  }
  function delModal(id) {
    var it = find(id); if (!it) return '';
    return '<div class="ov" data-act="close-bg"><div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dt"><h2 id="dt">Hapus ' + esc(it.nama) + '?</h2>' +
      '<p class="note" style="font-size:15px">Barang ini hilang dari daftar. Catatan masuk dan keluarnya tetap ada di riwayat.</p>' +
      '<div class="btns"><button type="button" class="btn ghost" data-act="close" data-autofocus>Batal</button><button type="button" class="btn bad" data-act="confirm-del" data-id="' + it.id + '">Hapus</button></div></div></div>';
  }
  function stockModal(m) {
    var items = state.data.items.slice().sort(function (a, b) { return a.nama.localeCompare(b.nama, 'id'); });
    if (!items.length) return '<div class="ov" data-act="close-bg"><div class="dlg" role="dialog" aria-modal="true"><h2>Catat stok</h2><p class="note" style="font-size:15px">Tambahkan barang dulu di halaman Barang.</p><div class="btns"><button type="button" class="btn" data-act="close" data-autofocus>Tutup</button></div></div></div>';
    var sel = m.itemId || items[0].id;
    return '<div class="ov" data-act="close-bg"><form class="dlg" id="stock-form" role="dialog" aria-modal="true" aria-labelledby="dt" novalidate><h2 id="dt">Catat stok</h2>' +
      '<div class="fg"><label for="s-item">Barang</label><select id="s-item" class="field">' + items.map(function (i) { return '<option value="' + i.id + '"' + (i.id === sel ? ' selected' : '') + '>' + esc(i.nama) + '</option>'; }).join('') + '</select></div>' +
      '<div class="seg" role="group" aria-label="Jenis perubahan"><button type="button" data-act="smode" data-v="masuk" aria-pressed="' + (m.mode === 'masuk') + '">Barang masuk</button><button type="button" data-act="smode" data-v="keluar" aria-pressed="' + (m.mode === 'keluar') + '">Barang keluar</button></div>' +
      '<div class="fg"><label for="s-qty">Jumlah <span id="s-unit" style="font-weight:500;color:var(--muted)"></span></label><div class="stp"><button type="button" class="step" data-act="sq" data-d="-1" aria-label="Kurangi satu">−</button><input id="s-qty" type="number" inputmode="numeric" min="1" step="1" value="1" data-autofocus><button type="button" class="step p" data-act="sq" data-d="1" aria-label="Tambah satu">+</button></div></div>' +
      '<div class="quick" aria-label="Tambah cepat"><button type="button" data-act="sq" data-d="6">+6</button><button type="button" data-act="sq" data-d="12">+12</button><button type="button" data-act="sq" data-d="24">+24</button></div>' +
      '<div class="after" id="s-prev"></div>' +
      '<div class="fg"><label for="s-note">Catatan <span style="font-weight:500;color:var(--muted)">(boleh dikosongkan)</span></label><input id="s-note" class="field" maxlength="80" placeholder="Contoh: kulakan dari agen" autocomplete="off"></div>' +
      '<p class="err" id="ferr" role="alert" hidden></p>' +
      '<div class="btns"><button type="button" class="btn ghost" data-act="close">Batal</button><button type="submit" class="btn">Simpan</button></div></form></div>';
  }
  function stockPreview() {
    var sel = $('#s-item'); if (!sel) return;
    var it = find(sel.value), q = n($('#s-qty').value), mode = state.modal.mode, box = $('#s-prev');
    $('#s-unit').textContent = '(' + it.satuan + ')';
    var after = mode === 'masuk' ? it.stok + q : it.stok - q, cls = 'after', note;
    if (after < 0) { cls += ' bad'; note = 'Stok hanya ' + it.stok + ' ' + it.satuan + ', tidak cukup untuk dikurangi ' + q + '.'; after = 0; }
    else if (after <= it.min) { cls += ' low'; note = 'Di bawah atau sama dengan batas minimum (' + it.min + '). Barang masuk daftar belanja.'; }
    else note = 'Di atas batas minimum (' + it.min + ').';
    box.className = cls;
    box.innerHTML = 'Stok setelah disimpan<b>' + after + ' ' + esc(it.satuan) + '</b><span style="font-size:13px;font-weight:600">' + esc(note) + '</span>';
  }
  function renderModal() {
    var root = $('#modal'), m = state.modal;
    if (!m) { root.hidden = true; root.innerHTML = ''; if (state.lastFocus && document.contains(state.lastFocus)) state.lastFocus.focus(); return; }
    root.innerHTML = m.type === 'item' ? itemModal(m.id) : m.type === 'del' ? delModal(m.id) : stockModal(m);
    root.hidden = false;
    var f = root.querySelector('[data-autofocus]'); if (f) f.focus();
    if (m.type === 'stock') stockPreview();
  }
  function openModal(m) { state.lastFocus = document.activeElement; state.modal = m; renderModal(); }
  function closeModal() { state.modal = null; renderModal(); }
  function formErr(msg) { var e = $('#ferr'); e.textContent = msg; e.hidden = false; }

  function submitItem(form) {
    var id = form.getAttribute('data-id'), nama = $('#f-nama').value.trim(), kat = $('#f-kat').value.trim() || 'Lainnya', sat = $('#f-sat').value.trim() || 'pcs';
    if (!nama) return formErr('Isi nama barang dulu.');
    var beli = n($('#f-beli').value), jual = n($('#f-jual').value), min = n($('#f-min').value);
    if (id) {
      var it = find(id); it.nama = nama; it.kategori = kat; it.satuan = sat; it.beli = beli; it.jual = jual; it.min = min;
      toast('Barang diperbarui');
    } else {
      state.data.items.push({ id: uid(), nama: nama, kategori: kat, satuan: sat, beli: beli, jual: jual, stok: n($('#f-stok').value), min: min });
      toast('Barang ditambahkan');
    }
    save(); closeModal(); render();
  }
  function submitStock() {
    var it = find($('#s-item').value), q = n($('#s-qty').value), mode = state.modal.mode;
    if (q < 1) return formErr('Jumlah minimal 1.');
    if (mode === 'keluar' && q > it.stok) return formErr('Stok hanya ' + it.stok + ' ' + it.satuan + ', tidak cukup untuk dikurangi ' + q + '.');
    it.stok += mode === 'masuk' ? q : -q;
    state.data.log.push({ id: uid(), t: Date.now(), itemId: it.id, nama: it.nama, jenis: mode, jumlah: q, catatan: $('#s-note').value.trim() });
    delete state.cart[it.id];
    save(); closeModal(); render(); toast('Stok ' + it.nama + ' sekarang ' + it.stok + ' ' + it.satuan);
  }

  /* ---------- event ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var a = el.getAttribute('data-act'), id = el.getAttribute('data-id');
    if (a === 'close-bg') { if (e.target === el) closeModal(); return; }
    if (a === 'new-stock') openModal({ type: 'stock', itemId: id || '', mode: 'masuk' });
    else if (a === 'add-item') openModal({ type: 'item', id: '' });
    else if (a === 'edit-item') openModal({ type: 'item', id: id });
    else if (a === 'del-item') openModal({ type: 'del', id: id });
    else if (a === 'confirm-del') { state.data.items = state.data.items.filter(function (i) { return i.id !== id; }); delete state.cart[id]; save(); closeModal(); render(); toast('Barang dihapus'); }
    else if (a === 'close') closeModal();
    else if (a === 'smode') { state.modal.mode = el.getAttribute('data-v'); document.querySelectorAll('[data-act="smode"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); stockPreview(); }
    else if (a === 'sq') { var inp = $('#s-qty'); inp.value = Math.max(1, n(inp.value) + Number(el.getAttribute('data-d'))); stockPreview(); }
    else if (a === 'jenis') { state.jenis = el.getAttribute('data-v'); render(); }
    else if (a === 'copy') {
      var m = buildMsg(); if (!m) return;
      var fallback = function () { var p = $('#prev'); p.focus(); p.select(); toast('Teks dipilih. Salin dengan Ctrl+C atau tahan lama di HP.'); };
      try { navigator.clipboard.writeText(m).then(function () { toast('Daftar disalin'); }, fallback); } catch (err) { fallback(); }
    }
    else if (a === 'reset') {
      var b = $('#reset-btn');
      if (!state.resetArm) { state.resetArm = true; b.textContent = 'Klik lagi untuk menghapus semua perubahan'; setTimeout(function () { state.resetArm = false; if (b) b.textContent = 'Kembalikan data contoh'; }, 4000); }
      else { state.resetArm = false; state.data = seed(); state.cart = {}; save(); render(); b.textContent = 'Kembalikan data contoh'; toast('Data contoh dipulihkan'); }
    }
  });
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    if (e.target.id === 'item-form') submitItem(e.target);
    else if (e.target.id === 'stock-form') submitStock();
  });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'cari') { state.q = t.value; barangList(); }
    else if (t.id === 's-qty') stockPreview();
    else if (t.hasAttribute && t.hasAttribute('data-qty')) { state.cart[t.getAttribute('data-qty')].qty = n(t.value); refreshBelanja(); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'kat') { state.kat = t.value; barangList(); }
    else if (t.id === 's-item') stockPreview();
    else if (t.hasAttribute && t.hasAttribute('data-cart')) { state.cart[t.getAttribute('data-cart')].on = t.checked; refreshBelanja(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.modal) closeModal(); });
  window.addEventListener('hashchange', route);

  state.data = load();
  $('#date').textContent = todayStr();
  route();
})();
</script>

</body></html>
