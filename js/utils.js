/* ═══════════════════════════════════════════════
   KarateChamp Bengkulu — utils.js
   Helper functions, storage, formatting, toasts
═══════════════════════════════════════════════ */

'use strict';

// ── STORAGE ────────────────────────────────────
function getUsers() {
  const r = localStorage.getItem('kc_users');
  if (!r) {
    const def = [{ id:'u-demo', username:'user', email:'user@demo.com', password:'user123', name:'Peserta Demo', phone:'082177889900', dojo:'Dojo Rafflesia Bengkulu', createdAt:Date.now() }];
    localStorage.setItem('kc_users', JSON.stringify(def)); return def;
  }
  return JSON.parse(r);
}
function setUsers(a) { localStorage.setItem('kc_users', JSON.stringify(a)); }

function getEvents() {
  const r = localStorage.getItem('kc_events');
  if (!r) { setEvents(SEED_EVENTS); return SEED_EVENTS; }
  return JSON.parse(r);
}
function setEvents(a) { localStorage.setItem('kc_events', JSON.stringify(a)); }

function getRegs() {
  const r = localStorage.getItem('kc_regs');
  if (!r) { setRegs(SEED_REGS); return SEED_REGS; }
  return JSON.parse(r);
}
function setRegs(a) { localStorage.setItem('kc_regs', JSON.stringify(a)); }

function getResults() {
  const r = localStorage.getItem('kc_results');
  if (!r) { setResults(SEED_RESULTS); return SEED_RESULTS; }
  return JSON.parse(r);
}
function setResults(a) { localStorage.setItem('kc_results', JSON.stringify(a)); }

function getPayments() {
  const r = localStorage.getItem('kc_payments');
  if (!r) { setPayments(SEED_PAYMENTS); return SEED_PAYMENTS; }
  return JSON.parse(r);
}
function setPayments(a) { localStorage.setItem('kc_payments', JSON.stringify(a)); }

function getBrackets() {
  const r = localStorage.getItem('kc_brackets');
  if (!r) return [];
  return JSON.parse(r);
}
function setBrackets(a) { localStorage.setItem('kc_brackets', JSON.stringify(a)); }

function getPublished() { return getEvents().filter(e => e.published); }
function regCount(id)   { return getRegs().filter(r => r.eventId === id).length; }

// ── DATE / TIME ────────────────────────────────
function fmt(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const M = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${parseInt(day)} ${M[parseInt(m)-1]} ${y}`;
}
function fmtFull(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const M = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${parseInt(day)} ${M[parseInt(m)-1]} ${y}`;
}
function timeAgo(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60)    return 'baru saja';
  if (d < 3600)  return `${Math.floor(d/60)} menit lalu`;
  if (d < 86400) return `${Math.floor(d/3600)} jam lalu`;
  return `${Math.floor(d/86400)} hari lalu`;
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - new Date()) / 86400000;
  return Math.ceil(diff);
}
function isDeadlineSoon(dateStr) {
  const d = daysUntil(dateStr);
  return d !== null && d >= 0 && d <= 7;
}

// ── MARTIAL ART HELPERS ────────────────────────
function maIcon(key) {
  const ma = MARTIAL_ARTS.find(m => m.key === key);
  return ma ? ma.icon : '🏅';
}
function maLabel(key) {
  const ma = MARTIAL_ARTS.find(m => m.key === key);
  return ma ? ma.label : key || 'Bela Diri';
}

// ── STATUS BADGE ───────────────────────────────
function sBadge(s) {
  const M = { open:['s-open','Dibuka'], soon:['s-soon','Segera'], closed:['s-closed','Ditutup'] };
  const [c, l] = M[s] || ['s-closed','—'];
  return `<span class="ev-status ${c}">${l}</span>`;
}

function payBadge(status) {
  const M = { verified:['pay-verified','✓ Lunas'], pending:['pay-pending','⏳ Menunggu'], rejected:['pay-rejected','✕ Ditolak'] };
  const [c, l] = M[status] || ['pay-pending','Belum Bayar'];
  return `<span class="pay-badge-small ${c}">${l}</span>`;
}

// ── TOAST ──────────────────────────────────────
function toast(msg, type = '') {
  const c  = document.getElementById('toast-ct');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = msg;
  c.appendChild(el);
  setTimeout(() => { el.classList.add('fade-out'); setTimeout(() => el.remove(), 400); }, 3000);
}

// ── EXPORT CSV ─────────────────────────────────
function dlCSV(rows, fn) {
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = fn; a.click(); URL.revokeObjectURL(a.href);
}
function exportEventsCSV() {
  const evts = getEvents();
  const h = ['ID','Cabang','Nama','Kategori','Tgl Mulai','Tgl Selesai','Deadline','Biaya','Lokasi','Penyelenggara','Status','Publikasi','Peserta'];
  const rows = evts.map(e => [e.id, e.martialArt||'Karate', e.name, e.category, e.dateStart, e.dateEnd, e.deadline||'', e.fee||'', e.location, e.organizer||'', e.status, e.published?'Publik':'Draft', regCount(e.id)]);
  dlCSV([h, ...rows], 'events_karatechamp_bengkulu.csv');
  toast('✓ Data event diekspor', 'success');
}
function exportPartsCSV() {
  const eid = document.getElementById('part-event-filter')?.value || '';
  let regs = [...getRegs()]; if (eid) regs = regs.filter(r => r.eventId === eid);
  const em = {}; getEvents().forEach(e => { em[e.id] = e.name; });
  const pm = {}; getPayments().forEach(p => { pm[p.regId] = p.status; });
  const h = ['ID','Nama','Email','No. HP','Dojo','Kategori','Sabuk','Usia','Kabupaten','Event','Status Bayar','Catatan','Waktu'];
  const rows = regs.map(r => [r.id, r.name, r.email, r.phone, r.dojo||'', r.category, r.belt||'', r.age, r.regency||'', em[r.eventId]||'', pm[r.id]||'pending', r.note||'', new Date(r.createdAt).toLocaleString('id-ID')]);
  dlCSV([h, ...rows], 'peserta_karatechamp_bengkulu.csv');
  toast('✓ Data peserta diekspor', 'success');
}

// ── DARK MODE ──────────────────────────────────
function initDarkMode() {
  const saved = localStorage.getItem('kc_dark');
  if (saved === 'true') document.body.classList.add('dark');
}
function toggleDark() {
  document.body.classList.toggle('dark');
  localStorage.setItem('kc_dark', document.body.classList.contains('dark'));
  const icon = document.getElementById('dark-icon');
  if (icon) icon.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
}

// ── IMAGE HELPERS ──────────────────────────────
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = () => rej(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}
