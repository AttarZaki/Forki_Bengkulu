/* ═══════════════════════════════════════════════
   KarateChamp Bengkulu — events.js
   Event display, landing, user app, registration
═══════════════════════════════════════════════ */

'use strict';

// ── LANDING PAGE ───────────────────────────────

function renderHeroStats() {
  const evts = getPublished();
  const regs = getRegs();
  const open = evts.filter(e => e.status === 'open').length;
  const soon = evts.filter(e => e.status === 'soon').length;
  const maCount = new Set(evts.map(e => e.martialArt).filter(Boolean)).size;
  const hs = document.getElementById('hero-stats');
  if (!hs) return;
  hs.innerHTML = `
    <div class="hero-stat"><div class="hs-num">${evts.length}</div><div class="hs-lbl">Total Event</div></div>
    <div class="hero-stat"><div class="hs-num" style="color:var(--green)">${open}</div><div class="hs-lbl">Pendaftaran Dibuka</div></div>
    <div class="hero-stat"><div class="hs-num" style="color:var(--accent)">${soon}</div><div class="hs-lbl">Segera Dibuka</div></div>
    <div class="hero-stat"><div class="hs-num" style="color:var(--blue)">${maCount || 1}+</div><div class="hs-lbl">Cabang Olahraga</div></div>
    <div class="hero-stat"><div class="hs-num" style="color:#a855f7">${regs.length}</div><div class="hs-lbl">Total Peserta</div></div>`;
}

function renderLandingTicker() {
  const evts = getPublished().filter(e => e.status === 'open' || e.status === 'soon');
  const inner = document.getElementById('ticker-inner');
  if (!inner || !evts.length) return;
  const items = evts.map(e =>
    `<span class="ticker-item">${maIcon(e.martialArt)} ${e.name} — ${e.location} — Deadline: ${fmt(e.deadline)}</span>`
  );
  inner.innerHTML = [...items, ...items].join('');
}

function renderLPPills() {
  const c = document.getElementById('lp-pills'); if (!c) return;
  // Martial arts pills
  const maKeys = ['all', ...MARTIAL_ARTS.map(m => m.key)];
  c.innerHTML = maKeys.map(key => {
    const ma = MARTIAL_ARTS.find(m => m.key === key);
    const label = key === 'all' ? '🏅 Semua Cabang' : `${ma?.icon || ''} ${ma?.label || key}`;
    return `<button class="pill ${lpMaFilter===key?'active':''}" onclick="lpMaFilter='${key}';renderLPPills();renderLandingGrid()">${label}</button>`;
  }).join('');
}

function renderLPStatusPills() {
  const c = document.getElementById('lp-status-pills'); if (!c) return;
  c.innerHTML = Object.entries(STATS_MAP).map(([k,v]) =>
    `<button class="pill pill-status ${lpStatusFilter===k?'active':''}" onclick="lpStatusFilter='${k}';renderLPStatusPills();renderLandingGrid()">${v}</button>`
  ).join('');
}

function renderLPKabupatenFilter() {
  const sel = document.getElementById('lp-kabupaten'); if (!sel) return;
  sel.innerHTML = KABUPATEN_BENGKULU.map(k =>
    `<option value="${k === 'Semua Wilayah' ? '' : k}">${k}</option>`
  ).join('');
}

function renderLandingGrid() {
  let evts = getPublished();
  if (lpMaFilter !== 'all') evts = evts.filter(e => e.martialArt === lpMaFilter);
  if (lpStatusFilter !== 'all') evts = evts.filter(e => e.status === lpStatusFilter);
  const kab = document.getElementById('lp-kabupaten')?.value || '';
  if (kab) evts = evts.filter(e => e.kabupaten === kab);
  const q = document.getElementById('lp-search')?.value?.toLowerCase() || '';
  if (q) evts = evts.filter(e => e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.martialArt||'').toLowerCase().includes(q));
  const sort = document.getElementById('lp-sort')?.value || 'newest';
  if (sort === 'newest') evts.sort((a,b) => b.createdAt - a.createdAt);
  if (sort === 'oldest') evts.sort((a,b) => a.createdAt - b.createdAt);
  if (sort === 'name')   evts.sort((a,b) => a.name.localeCompare(b.name));
  if (sort === 'date')   evts.sort((a,b) => (a.dateStart||'').localeCompare(b.dateStart||''));
  renderEventGrid('lp-event-grid', evts, false);
}

// ── USER APP ───────────────────────────────────

function enterUserApp() {
  document.getElementById('user-welcome-name').textContent = currentUser.name.split(' ')[0];
  showPage('page-user-app');
  renderUserStats();
  renderUAPills();
  renderUAStatusPills();
  renderUserAppGrid();
}

function renderUserStats() {
  const evts = getPublished();
  const myRegs = getRegs().filter(r => r.userId === currentUser.id);
  const myPays = getPayments().filter(p => p.userId === currentUser.id && p.status === 'verified');
  document.getElementById('us-total').textContent  = evts.length;
  document.getElementById('us-open').textContent   = evts.filter(e => e.status === 'open').length;
  document.getElementById('us-soon').textContent   = evts.filter(e => e.status === 'soon').length;
  document.getElementById('us-myregs').textContent = myRegs.length;
}

function renderUAPills() {
  const c = document.getElementById('ua-pills'); if (!c) return;
  const maKeys = ['all', ...MARTIAL_ARTS.map(m => m.key)];
  c.innerHTML = maKeys.map(key => {
    const ma = MARTIAL_ARTS.find(m => m.key === key);
    const label = key === 'all' ? '🏅 Semua Cabang' : `${ma?.icon || ''} ${ma?.label || key}`;
    return `<button class="pill ${uaMaFilter===key?'active':''}" onclick="uaMaFilter='${key}';renderUAPills();renderUserAppGrid()">${label}</button>`;
  }).join('');
}

function renderUAStatusPills() {
  const c = document.getElementById('ua-status-pills'); if (!c) return;
  c.innerHTML = Object.entries(STATS_MAP).map(([k,v]) =>
    `<button class="pill pill-status ${uaStatusFilter===k?'active':''}" onclick="uaStatusFilter='${k}';renderUAStatusPills();renderUserAppGrid()">${v}</button>`
  ).join('');
}

function renderUserAppGrid() {
  let evts = getPublished();
  if (uaMaFilter !== 'all') evts = evts.filter(e => e.martialArt === uaMaFilter);
  if (uaStatusFilter !== 'all') evts = evts.filter(e => e.status === uaStatusFilter);
  const q = document.getElementById('ua-search')?.value?.toLowerCase() || '';
  if (q) evts = evts.filter(e => e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || (e.martialArt||'').toLowerCase().includes(q));
  const sort = document.getElementById('ua-sort')?.value || 'newest';
  if (sort === 'newest') evts.sort((a,b) => b.createdAt - a.createdAt);
  if (sort === 'name')   evts.sort((a,b) => a.name.localeCompare(b.name));
  if (sort === 'date')   evts.sort((a,b) => (a.dateStart||'').localeCompare(b.dateStart||''));
  renderEventGrid('ua-event-grid', evts, true);
}

// ── CARD RENDERING ─────────────────────────────

function renderEventGrid(containerId, evts, userMode) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  if (!evts.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🗂️</div><h3>Tidak Ada Event</h3><p>Belum ada event yang sesuai dengan filter Anda.</p></div>`;
    grid.style.display = 'block'; return;
  }
  grid.style.display = '';
  const myRegs = userMode && currentUser ? getRegs().filter(r => r.userId === currentUser.id).map(r => r.eventId) : [];
  grid.innerHTML = evts.map(e => buildEventCard(e, userMode, myRegs)).join('');
}

function buildEventCard(e, userMode, myRegs) {
  const count    = regCount(e.id);
  const soon     = isDeadlineSoon(e.deadline);
  const alreadyR = myRegs.includes(e.id);
  const days     = daysUntil(e.deadline);
  const hasResults = getResults().some(r => r.eventId === e.id && r.published);

  const photoHTML = e.photo
    ? `<div class="card-photo" style="background-image:url('${e.photo}')"></div>`
    : `<div class="card-photo card-photo-default"><span>${maIcon(e.martialArt)}</span></div>`;

  const deadlineBadge = soon
    ? `<span class="deadline-badge">⏰ Deadline ${days === 0 ? 'Hari Ini!' : `${days} Hari Lagi`}</span>` : '';

  const maBadge = `<span class="ma-badge ma-${(e.martialArt||'Karate').toLowerCase().replace(/\s/g,'-')}">${maIcon(e.martialArt)} ${maLabel(e.martialArt)}</span>`;

  const btnHTML = userMode
    ? (alreadyR
        ? `<button class="btn-card-registered" disabled>✓ Sudah Mendaftar</button>`
        : (e.status === 'open'
            ? `<button class="btn-card-register" onclick="openRegModal('${e.id}')">Daftar Sekarang</button>`
            : `<button class="btn-card-detail" onclick="openDetail('${e.id}')">Lihat Detail</button>`))
    : `<button class="btn-card-detail" onclick="openDetail('${e.id}')">Lihat Detail</button>`;

  return `
  <div class="event-card ${soon ? 'card-urgent' : ''}">
    ${photoHTML}
    ${deadlineBadge}
    <div class="card-body">
      <div class="card-top">
        ${maBadge}
        <span class="card-cat">${e.category}</span>
        ${sBadge(e.status)}
      </div>
      <h3 class="card-title">${e.name}</h3>
      <div class="card-meta">
        <div class="card-meta-row"><span class="meta-icon">📅</span> ${fmt(e.dateStart)} – ${fmt(e.dateEnd)}</div>
        <div class="card-meta-row"><span class="meta-icon">📍</span> ${e.location}</div>
        <div class="card-meta-row"><span class="meta-icon">🏢</span> ${e.organizer || '—'}</div>
        <div class="card-meta-row"><span class="meta-icon">💰</span> ${e.fee || 'Gratis'} &nbsp;|&nbsp; <span class="reg-count"><span class="meta-icon">👥</span> ${count} peserta</span></div>
      </div>
      <div class="card-actions">
        ${btnHTML}
        ${hasResults ? `<button class="btn-card-results" onclick="openResultsModal('${e.id}')">🏅 Hasil</button>` : `<button class="btn-card-secondary" onclick="openDetail('${e.id}')">Detail →</button>`}
        <button class="btn-card-bracket" onclick="${userMode||!currentRole?`viewPublicBrackets`:`openBracketModal`}('${e.id}')">🏆 Bagan</button>
      </div>
    </div>
  </div>`;
}

// ── DETAIL MODAL ───────────────────────────────

function openDetail(id) {
  const e = getEvents().find(ev => ev.id === id);
  if (!e) return;
  const count = regCount(id);
  const alreadyR = currentUser ? getRegs().some(r => r.eventId === id && r.userId === currentUser.id) : false;
  const daysLeft = daysUntil(e.deadline);
  const results = getResults().filter(r => r.eventId === id && r.published);

  let resultsHTML = '';
  if (results.length) {
    resultsHTML = `
      <div class="detail-results-section">
        <div class="di-label">🏅 Hasil Pertandingan</div>
        ${results.slice(0,3).map(r => `
          <div class="result-mini">
            <div class="result-mini-cat">${r.category}</div>
            <div class="result-mini-list">
              <span>🥇 ${r.gold?.name}</span>
              <span>🥈 ${r.silver?.name}</span>
              ${r.bronze1 ? `<span>🥉 ${r.bronze1.name}</span>` : ''}
            </div>
          </div>`).join('')}
        ${results.length > 3 ? `<button class="btn-sm" style="margin-top:8px" onclick="closeModal('detail-modal');openResultsModal('${id}')">Lihat semua hasil →</button>` : ''}
      </div>`;
  }

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-wrap">
      ${e.photo ? `<div class="detail-photo" style="background-image:url('${e.photo}')"></div>` : `<div class="detail-photo detail-photo-default"><span>${maIcon(e.martialArt)}</span></div>`}
      <div class="detail-body">
        <div class="detail-badges">
          <span class="ma-badge ma-${(e.martialArt||'Karate').toLowerCase().replace(/\s/g,'-')}">${maIcon(e.martialArt)} ${maLabel(e.martialArt)}</span>
          <span class="card-cat">${e.category}</span>
          ${sBadge(e.status)}
          ${isDeadlineSoon(e.deadline) ? `<span class="deadline-badge">⏰ ${daysLeft === 0 ? 'Deadline Hari Ini!' : `Deadline ${daysLeft} Hari Lagi`}</span>` : ''}
        </div>
        <h2 class="detail-title">${e.name}</h2>
        <div class="detail-grid">
          <div class="detail-item"><div class="di-label">Tanggal Pelaksanaan</div><div class="di-val">📅 ${fmtFull(e.dateStart)} – ${fmtFull(e.dateEnd)}</div></div>
          <div class="detail-item"><div class="di-label">Deadline Pendaftaran</div><div class="di-val">⏳ ${e.deadline ? fmtFull(e.deadline) : 'Tidak ditentukan'}</div></div>
          <div class="detail-item"><div class="di-label">Lokasi</div><div class="di-val">📍 ${e.location}</div></div>
          <div class="detail-item"><div class="di-label">Penyelenggara</div><div class="di-val">🏢 ${e.organizer || '—'}</div></div>
          <div class="detail-item"><div class="di-label">Biaya Pendaftaran</div><div class="di-val">💰 ${e.fee || 'Gratis'}</div></div>
          <div class="detail-item"><div class="di-label">Total Pendaftar</div><div class="di-val">👥 ${count} orang</div></div>
        </div>
        ${e.desc ? `<div class="detail-desc"><div class="di-label">Deskripsi Event</div><p>${e.desc}</p></div>` : ''}
        ${resultsHTML}
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px">
          ${currentUser && !alreadyR && e.status === 'open' && currentRole !== 'admin'
            ? `<button class="btn-primary" onclick="openRegModal('${id}');closeModal('detail-modal')">🥋 Daftar Sekarang</button>`
            : (alreadyR ? `<div class="registered-notice">✓ Anda sudah mendaftar event ini</div>` : '')}
          <button class="btn-secondary-outline" onclick="closeModal('detail-modal');viewPublicBrackets('${id}')">🏆 Lihat Bagan</button>
          <button class="btn-secondary-outline" onclick="closeModal('detail-modal');openResultsModal('${id}')">🏅 Lihat Hasil</button>
        </div>
      </div>
    </div>`;
  document.getElementById('detail-modal').classList.add('open');
}

// ── REGISTRATION ───────────────────────────────

function openRegModal(id) {
  if (!currentUser) { showPage('page-user-login'); return; }
  const e = getEvents().find(ev => ev.id === id);
  if (!e) return;
  document.getElementById('reg-event-label').textContent = e.name;
  document.getElementById('reg-ma-label').textContent    = `${maIcon(e.martialArt)} ${maLabel(e.martialArt)}`;
  document.getElementById('reg-fee-label').textContent   = e.fee || 'Gratis';
  document.getElementById('reg-eid').value = id;
  document.getElementById('r-name').value  = currentUser.name || '';
  document.getElementById('r-email').value = currentUser.email || '';
  document.getElementById('r-phone').value = currentUser.phone || '';
  document.getElementById('r-dojo').value  = currentUser.dojo || '';
  document.getElementById('r-age').value   = '';
  document.getElementById('r-belt').value  = '';
  document.getElementById('r-cat').value   = '';
  document.getElementById('r-regency').value = '';
  document.getElementById('r-note').value  = '';

  // Build category options based on martial art
  buildRegCategories(e.martialArt, e.category);
  document.getElementById('reg-modal').classList.add('open');
}

function buildRegCategories(ma, evtCat) {
  const catSel = document.getElementById('r-cat');
  const karateCats = ['Kata Perorangan Putra','Kata Perorangan Putri','Kata Beregu Putra','Kata Beregu Putri','Kumite -55kg Putra','Kumite -60kg Putra','Kumite -67kg Putra','Kumite -75kg Putra','Kumite +75kg Putra','Kumite -50kg Putri','Kumite -55kg Putri','Kumite -61kg Putri','Kumite +61kg Putri'];
  const tkdCats = ['Poomsae Perorangan Putra','Poomsae Perorangan Putri','Kyorugi -58kg','Kyorugi -63kg','Kyorugi -68kg','Kyorugi -74kg','Kyorugi -80kg','Kyorugi +80kg','Kyorugi Putri -46kg','Kyorugi Putri -49kg','Kyorugi Putri -53kg'];
  const judoCats = ['Judo -60kg','Judo -66kg','Judo -73kg','Judo -81kg','Judo -90kg','Judo +90kg','Judo Putri -48kg','Judo Putri -52kg','Judo Putri -57kg'];
  const bjjCats = ['BJJ Gi Pemula','BJJ Gi Menengah','BJJ No-Gi Pemula','BJJ No-Gi Menengah','BJJ Gi Sabuk Biru','BJJ No-Gi Sabuk Biru'];
  const kbCats = ['Light Contact -60kg','Light Contact -65kg','Light Contact -70kg','Light Contact -75kg','Light Contact +75kg','Full Contact -63kg','Full Contact -69kg','Full Contact -74kg','Full Contact +74kg'];
  const otherCats = ['Open Perorangan Putra','Open Perorangan Putri','Open Beregu'];

  const catMap = { Karate:karateCats, Taekwondo:tkdCats, Judo:judoCats, BJJ:bjjCats, Kickboxing:kbCats };
  const cats = catMap[ma] || otherCats;
  catSel.innerHTML = `<option value="">— pilih kategori —</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join('');

  // Belt options per MA
  const beltSel = document.getElementById('r-belt');
  const karateBelts = ['Putih','Kuning','Jingga','Hijau','Biru','Coklat','Hitam'];
  const tkdBelts = ['Putih','Kuning','Hijau','Biru','Merah','Sabuk Merah','Hitam'];
  const judoBelts = ['Putih (6-Kyu)','Kuning (5-Kyu)','Jingga (4-Kyu)','Hijau (3-Kyu)','Biru (2-Kyu)','Coklat (1-Kyu)','Hitam (1-Dan)'];
  const bjjBelts = ['Putih','Biru','Ungu','Coklat','Hitam'];
  const beltMap = { Karate:karateBelts, Taekwondo:tkdBelts, Judo:judoBelts, BJJ:bjjBelts };
  const belts = beltMap[ma] || ['Pemula','Menengah','Lanjutan'];
  beltSel.innerHTML = `<option value="">— pilih —</option>` + belts.map(b => `<option>${b}</option>`).join('');
}

function submitReg() {
  const eid   = document.getElementById('reg-eid').value;
  const name  = document.getElementById('r-name').value.trim();
  const age   = parseInt(document.getElementById('r-age').value);
  const email = document.getElementById('r-email').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const cat   = document.getElementById('r-cat').value;

  if (!name || !age || !email || !phone || !cat) { toast('Harap isi semua field wajib (*)', 'error'); return; }
  if (age < 5 || age > 80) { toast('Usia harus antara 5–80 tahun', 'error'); return; }

  const regs = getRegs();
  if (regs.some(r => r.eventId === eid && r.userId === currentUser.id)) { toast('Anda sudah mendaftar event ini', 'error'); return; }

  const newReg = {
    id: 'reg-' + Date.now(), eventId: eid, userId: currentUser.id,
    name, age, email, phone,
    dojo:     document.getElementById('r-dojo').value.trim(),
    belt:     document.getElementById('r-belt').value,
    category: cat,
    regency:  document.getElementById('r-regency').value,
    note:     document.getElementById('r-note').value.trim(),
    createdAt: Date.now()
  };
  regs.unshift(newReg);
  setRegs(regs);
  closeModal('reg-modal');

  // Show payment modal
  const ev = getEvents().find(e => e.id === eid);
  showPaymentInstructions(newReg.id, eid, ev);
  renderUserStats();
  renderUserAppGrid();
}

function showPaymentInstructions(regId, eventId, ev) {
  document.getElementById('pi-event-name').textContent = ev?.name || '—';
  document.getElementById('pi-amount').textContent     = ev?.fee || 'Gratis';
  document.getElementById('pi-reg-id').value  = regId;
  document.getElementById('pi-event-id').value = eventId;
  document.getElementById('pi-bank').textContent    = PAYMENT_BANK.bank;
  document.getElementById('pi-account').textContent = PAYMENT_BANK.account;
  document.getElementById('pi-accname').textContent = PAYMENT_BANK.name;
  document.getElementById('pi-note').textContent    = PAYMENT_BANK.note;
  document.getElementById('pay-instr-modal').classList.add('open');
  toast('🥋 Pendaftaran berhasil! Lanjutkan pembayaran.', 'success');
}

function submitFromInstruction() {
  const regId   = document.getElementById('pi-reg-id').value;
  const eventId = document.getElementById('pi-event-id').value;
  const ev      = getEvents().find(e => e.id === eventId);
  const fileEl  = document.getElementById('pi-bukti');

  const doSave = (buktiUrl) => {
    const payments = getPayments();
    payments.unshift({ id:'pay-'+Date.now(), regId, eventId, userId:currentUser.id, amount:ev?.fee||'—', status:'pending', buktiUrl, createdAt:Date.now(), verifiedAt:null });
    setPayments(payments);
    closeModal('pay-instr-modal');
    toast('✓ Bukti bayar terkirim! Admin akan memverifikasi segera.', 'success');
    if (typeof renderUserProfile === 'function') renderUserProfile();
  };

  if (fileEl?.files[0]) {
    if (fileEl.files[0].size > 3*1024*1024) { toast('File maks 3MB','error'); return; }
    fileToBase64(fileEl.files[0]).then(doSave);
  } else { doSave(null); }
}
