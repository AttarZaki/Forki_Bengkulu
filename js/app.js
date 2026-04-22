/* ═══════════════════════════════════════════════
   KarateChamp Bengkulu — app.js
   Main router, navbar, page management
═══════════════════════════════════════════════ */

'use strict';

// ── STATE ──────────────────────────────────────
let currentUser    = null;
let currentRole    = null;
let lpMaFilter     = 'all';
let lpStatusFilter = 'all';
let uaMaFilter     = 'all';
let uaStatusFilter = 'all';

// ── PAGE ROUTING ───────────────────────────────

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  closeMob();
  updateNavbar(id);
  window.scrollTo(0, 0);
}

function goLanding() {
  showPage('page-landing');
  renderHeroStats();
  renderLandingTicker();
  renderLandingGrid();
  renderLPPills();
  renderLPStatusPills();
  renderLPKabupatenFilter();
}

// ── NAVBAR ─────────────────────────────────────

function updateNavbar(pageId) {
  const nr = document.getElementById('nav-right');
  const nl = document.getElementById('nav-links');
  const di = document.getElementById('dark-icon');
  if (di) di.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';

  if (pageId === 'page-user-app' && currentUser && currentRole === 'user') {
    nl.innerHTML = `<span class="nav-link active">🏠 Event</span>
      <button class="nav-link" onclick="showPage('page-user-profile')">👤 Profil</button>
      <button class="nav-link" onclick="openAdminPayments?openUserPayments():null">💳 Pembayaran Saya</button>`;
    nr.innerHTML = `<span class="nav-badge user">PESERTA</span>
      <span class="nav-username">${currentUser.name.split(' ')[0]}</span>
      <button class="btn-dark-toggle" onclick="toggleDark()"><span id="dark-icon">${document.body.classList.contains('dark')?'☀️':'🌙'}</span></button>
      <button class="btn-logout" onclick="doLogout()">Keluar</button>`;
    buildMobileNav('user');
  } else if (pageId === 'page-admin-app' && currentRole === 'admin') {
    nl.innerHTML = `
      <button class="nav-link active" id="nl-dash" onclick="switchAdminTab('dashboard');setNL(this)">📊 Dashboard</button>
      <button class="nav-link" id="nl-evts" onclick="switchAdminTab('events');setNL(this)">🗓️ Event</button>
      <button class="nav-link" id="nl-parts" onclick="switchAdminTab('participants');setNL(this)">👥 Peserta</button>
      <button class="nav-link" id="nl-payments" onclick="switchAdminTab('payments');setNL(this)">💳 Pembayaran</button>
      <button class="nav-link" id="nl-results" onclick="switchAdminTab('results');setNL(this)">🏅 Hasil</button>`;
    nr.innerHTML = `<span class="nav-badge admin">ADMIN</span>
      <button class="btn-dark-toggle" onclick="toggleDark()"><span id="dark-icon">${document.body.classList.contains('dark')?'☀️':'🌙'}</span></button>
      <button class="btn-logout" onclick="doLogout()">Keluar</button>`;
    buildMobileNav('admin');
  } else {
    nl.innerHTML = '';
    nr.innerHTML = `
      <button class="btn-dark-toggle" onclick="toggleDark()"><span id="dark-icon">${document.body.classList.contains('dark')?'☀️':'🌙'}</span></button>
      <button class="btn-nav-login" onclick="showPage('page-user-login')">Masuk</button>`;
    buildMobileNav('guest');
  }
}

function setNL(el) {
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function toggleMob() { document.getElementById('mobile-nav').classList.toggle('open'); }
function closeMob()  { document.getElementById('mobile-nav').classList.remove('open'); }

function buildMobileNav(role) {
  const mn = document.getElementById('mobile-nav');
  if (role === 'user') {
    mn.innerHTML = `
      <button class="mob-link active" onclick="closeMob()">🏠 Event Aktif</button>
      <button class="mob-link" onclick="showPage('page-user-profile');closeMob()">👤 Profil Saya</button>
      <button class="mob-link" onclick="openUserPayments();closeMob()">💳 Pembayaran Saya</button>
      <hr class="mob-sep">
      <button class="mob-link" onclick="toggleDark();closeMob()">🌙 Dark Mode</button>
      <button class="mob-link danger" onclick="doLogout();closeMob()">🚪 Keluar</button>`;
  } else if (role === 'admin') {
    mn.innerHTML = `
      <button class="mob-link active" onclick="switchAdminTab('dashboard');closeMob()">📊 Dashboard</button>
      <button class="mob-link" onclick="switchAdminTab('events');closeMob()">🗓️ Kelola Event</button>
      <button class="mob-link" onclick="switchAdminTab('participants');closeMob()">👥 Data Peserta</button>
      <button class="mob-link" onclick="switchAdminTab('payments');closeMob()">💳 Pembayaran</button>
      <button class="mob-link" onclick="switchAdminTab('results');closeMob()">🏅 Hasil</button>
      <hr class="mob-sep">
      <button class="mob-link danger" onclick="doLogout();closeMob()">🚪 Keluar</button>`;
  } else {
    mn.innerHTML = `
      <button class="mob-link" onclick="showPage('page-user-login');closeMob()">👤 Masuk sebagai Peserta</button>
      <button class="mob-link" onclick="switchAuthTab('register');showPage('page-user-login');closeMob()">📝 Daftar Baru</button>
      <hr class="mob-sep">
      <button class="mob-link" onclick="showPage('page-admin-login');closeMob()">🛡️ Admin Portal</button>
      <button class="mob-link" onclick="toggleDark();closeMob()">🌙 Dark Mode</button>`;
  }
}

// ── MODAL HELPERS ──────────────────────────────
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── USER PROFILE PAGE ──────────────────────────
function showUserProfile() { showPage('page-user-profile'); renderUserProfile(); }

function renderUserProfile() {
  if (!currentUser) return;
  document.getElementById('prof-name').textContent    = currentUser.name;
  document.getElementById('prof-username').textContent = '@' + currentUser.username;
  document.getElementById('prof-email').textContent   = currentUser.email;
  document.getElementById('prof-phone').textContent   = currentUser.phone || '—';
  document.getElementById('prof-dojo').textContent    = currentUser.dojo || '—';

  const myRegs = getRegs().filter(r => r.userId === currentUser.id);
  const evts   = getEvents(); const em = {}; evts.forEach(e => { em[e.id] = e; });
  const payments = getPayments(); const pm = {}; payments.forEach(p => { pm[p.regId] = p; });
  const myRegList = document.getElementById('my-reg-list');

  if (!myRegs.length) {
    myRegList.innerHTML = '<div class="empty-mini">Belum ada pendaftaran event.</div>';
    return;
  }
  myRegList.innerHTML = myRegs.sort((a,b) => b.createdAt - a.createdAt).map(r => {
    const ev = em[r.eventId];
    const pay = pm[r.id];
    return `
    <div class="my-reg-row">
      <div class="my-reg-info">
        <div class="my-reg-name">${ev ? ev.name : '—'}</div>
        <div class="my-reg-detail">${maIcon(ev?.martialArt)} ${maLabel(ev?.martialArt)} • ${r.category} • ${r.belt||'—'} • ${timeAgo(r.createdAt)}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        ${ev ? sBadge(ev.status) : ''}
        ${pay ? payBadge(pay.status) : `<button class="btn-pay-now" onclick="showPaymentModal('${r.id}','${r.eventId}')">💳 Bayar</button>`}
      </div>
    </div>`;
  }).join('');
}

function openUserPayments() {
  if (!currentUser) return;
  const pays = getPayments().filter(p => p.userId === currentUser.id);
  const regs = getRegs(); const rm = {}; regs.forEach(r => { rm[r.id] = r; });
  const evts = getEvents(); const em = {}; evts.forEach(e => { em[e.id] = e; });

  let html = pays.length ? pays.sort((a,b)=>b.createdAt-a.createdAt).map(p => {
    const r = rm[p.regId]; const ev = em[p.eventId];
    return `<div class="my-reg-row">
      <div class="my-reg-info">
        <div class="my-reg-name">${ev?.name || '—'}</div>
        <div class="my-reg-detail">${r?.category || ''} • ${p.amount}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        ${payBadge(p.status)}
        ${p.status !== 'verified' ? `<button class="btn-sm btn-edit" onclick="closeModal('user-pay-modal');showPaymentModal('${p.regId}','${p.eventId}')">Upload Bukti</button>` : ''}
      </div>
    </div>`;
  }).join('') : '<div class="empty-mini">Belum ada data pembayaran.</div>';

  document.getElementById('user-pay-list').innerHTML = html;
  document.getElementById('user-pay-modal').classList.add('open');
}

function saveProfile() {
  const name  = document.getElementById('edit-name').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();
  const dojo  = document.getElementById('edit-dojo').value.trim();
  if (!name) { toast('Nama tidak boleh kosong', 'error'); return; }
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === currentUser.id);
  users[idx]  = { ...users[idx], name, phone, dojo };
  setUsers(users); currentUser = users[idx];
  sessionStorage.setItem('kc_session', JSON.stringify({ id: currentUser.id, role: 'user' }));
  closeModal('edit-profile-modal');
  renderUserProfile();
  document.getElementById('user-welcome-name').textContent = currentUser.name.split(' ')[0];
  toast('✓ Profil berhasil diperbarui', 'success');
}

function openEditProfile() {
  document.getElementById('edit-name').value  = currentUser.name || '';
  document.getElementById('edit-phone').value = currentUser.phone || '';
  document.getElementById('edit-dojo').value  = currentUser.dojo || '';
  document.getElementById('edit-profile-modal').classList.add('open');
}

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  tryRestoreSession();
  if (currentRole === 'admin') enterAdminApp();
  else if (currentRole === 'user') enterUserApp();
  else goLanding();
});
