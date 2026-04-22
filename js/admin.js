/* ═══════════════════════════════════════════════
   KarateChamp Bengkulu — admin.js
   Admin panel: dashboard, events, participants, payments, results
═══════════════════════════════════════════════ */

'use strict';

let editingEvtId  = null;
let confirmCb     = null;
let chartCat      = null;
let chartStat     = null;
let chartReg      = null;
let chartMa       = null;
let evtSortField  = 'name';
let evtSortDir    = 1;

// ── ENTER ADMIN APP ────────────────────────────
function enterAdminApp() {
  showPage('page-admin-app');
  switchAdminTab('dashboard');
}

function switchAdminTab(tab) {
  ['dashboard','events','participants','payments','results'].forEach(t => {
    const el = document.getElementById('atab-content-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    const btn = document.getElementById('atab-' + t);
    if (btn) btn.classList.toggle('active', t === tab);
  });
  if (tab === 'dashboard')    renderDashboard();
  if (tab === 'events')       renderAdminTable();
  if (tab === 'participants') { populatePartFilter(); renderParticipants(); }
  if (tab === 'payments')     renderAdminPayments();
  if (tab === 'results')      renderAdminResults();
}

// ── DASHBOARD ─────────────────────────────────
function renderDashboard() {
  const evts = getEvents();
  const regs = getRegs();
  const pays = getPayments();
  const open   = evts.filter(e => e.status === 'open').length;
  const soon   = evts.filter(e => e.status === 'soon').length;
  const closed = evts.filter(e => e.status === 'closed').length;
  const pub    = evts.filter(e => e.published).length;
  const pendingPay = pays.filter(p => p.status === 'pending').length;
  const maCount = new Set(evts.map(e => e.martialArt).filter(Boolean)).size;

  document.getElementById('dash-cards').innerHTML = `
    <div class="dash-stat-card"><div class="dsc-icon" style="background:#eff6ff;color:#2563eb">🗓️</div><div class="dsc-num">${evts.length}</div><div class="dsc-lbl">Total Event</div></div>
    <div class="dash-stat-card"><div class="dsc-icon" style="background:#f0fdf4;color:#16a34a">✅</div><div class="dsc-num" style="color:#16a34a">${open}</div><div class="dsc-lbl">Dibuka</div></div>
    <div class="dash-stat-card"><div class="dsc-icon" style="background:#fffbeb;color:#d97706">⏳</div><div class="dsc-num" style="color:#d97706">${soon}</div><div class="dsc-lbl">Segera</div></div>
    <div class="dash-stat-card"><div class="dsc-icon" style="background:#fef2f2;color:#dc2626">👥</div><div class="dsc-num" style="color:#dc2626">${regs.length}</div><div class="dsc-lbl">Total Peserta</div></div>
    <div class="dash-stat-card" style="cursor:pointer" onclick="switchAdminTab('payments')"><div class="dsc-icon" style="background:#fef9c3;color:#ca8a04">💳</div><div class="dsc-num" style="color:#ca8a04">${pendingPay}</div><div class="dsc-lbl">Pembayaran Pending</div></div>
    <div class="dash-stat-card"><div class="dsc-icon" style="background:#f5f3ff;color:#7c3aed">🥋</div><div class="dsc-num" style="color:#7c3aed">${maCount}</div><div class="dsc-lbl">Cabang Olahraga</div></div>`;

  const COLORS = ['#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#06b6d4'];

  // Martial arts distribution
  const maMap = {};
  evts.forEach(e => { const k = e.martialArt||'Karate'; maMap[k] = (maMap[k]||0) + 1; });

  if (chartMa) chartMa.destroy();
  chartMa = new Chart(document.getElementById('chart-ma'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(maMap).map(k => maLabel(k)),
      datasets: [{ data: Object.values(maMap), backgroundColor: COLORS, borderWidth: 0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{ color:'var(--text-muted)', padding:10, font:{ size:12 } } } } }
  });

  const sm = { open, soon, closed };
  if (chartStat) chartStat.destroy();
  chartStat = new Chart(document.getElementById('chart-stat'), {
    type: 'doughnut',
    data: {
      labels: ['Dibuka','Segera','Ditutup'],
      datasets: [{ data:[sm.open,sm.soon,sm.closed], backgroundColor:['rgba(22,163,74,.85)','rgba(217,119,6,.85)','rgba(148,163,184,.5)'], borderWidth:0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'70%', plugins:{ legend:{ position:'bottom', labels:{ color:'var(--text-muted)', padding:14, font:{ size:13 } } } } }
  });

  const evtLabels = evts.map(e => (e.name.length > 22 ? e.name.substring(0,22)+'…' : e.name));
  const evtCounts = evts.map(e => regCount(e.id));
  if (chartReg) chartReg.destroy();
  chartReg = new Chart(document.getElementById('chart-reg'), {
    type: 'bar',
    data: {
      labels: evtLabels,
      datasets: [{ label:'Peserta', data:evtCounts, backgroundColor:'rgba(37,99,235,.75)', borderRadius:6, borderSkipped:false }]
    },
    options: {
      responsive:true, maintainAspectRatio:false, indexAxis:'y',
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ ticks:{ color:'var(--text-muted)',stepSize:1 }, grid:{ color:'rgba(148,163,184,.15)' } },
        y:{ ticks:{ color:'var(--text-muted)',font:{ size:11 } }, grid:{ display:false } }
      }
    }
  });

  const recent = [...regs].sort((a,b) => b.createdAt - a.createdAt).slice(0, 6);
  const em = {}; evts.forEach(e => { em[e.id] = e; });
  const rl = document.getElementById('recent-list');
  rl.innerHTML = recent.length
    ? recent.map(r => {
        const ev = em[r.eventId];
        return `<div class="recent-row">
          <div class="recent-avatar">${r.name.charAt(0)}</div>
          <div class="recent-info">
            <div class="recent-name">${r.name}</div>
            <div class="recent-event">${maIcon(ev?.martialArt)} ${ev?.name||'—'} — ${r.category}</div>
          </div>
          <div class="recent-time">${timeAgo(r.createdAt)}</div>
        </div>`;
      }).join('')
    : '<div class="empty-mini">Belum ada pendaftar.</div>';
}

// ── EVENTS TABLE ───────────────────────────────
function renderAdminTable() {
  const q  = (document.getElementById('adm-search')?.value||'').toLowerCase();
  const sf = document.getElementById('adm-status-filter')?.value||'';
  const maf= document.getElementById('adm-ma-filter')?.value||'';
  let evts = [...getEvents()];
  if (q)   evts = evts.filter(e => e.name.toLowerCase().includes(q)||e.category.toLowerCase().includes(q)||e.location.toLowerCase().includes(q));
  if (sf)  evts = evts.filter(e => e.status === sf);
  if (maf) evts = evts.filter(e => e.martialArt === maf);
  evts.sort((a,b) => {
    const av = a[evtSortField]||'', bv = b[evtSortField]||'';
    return typeof av === 'string' ? av.localeCompare(bv)*evtSortDir : (av-bv)*evtSortDir;
  });
  const count = document.getElementById('adm-count');
  if (count) count.textContent = `${evts.length} event`;
  const tbody = document.getElementById('adm-tbody');
  if (!evts.length) { tbody.innerHTML = `<tr><td colspan="9" class="td-empty">Tidak ada event ditemukan.</td></tr>`; return; }
  tbody.innerHTML = evts.map(e => `
    <tr>
      <td>
        <div class="td-evt-cell">
          ${e.photo ? `<img class="td-thumb" src="${e.photo}" alt="foto"/>` : `<div class="td-thumb td-thumb-empty">${maIcon(e.martialArt)}</div>`}
          <div>
            <div class="td-name">${e.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${maIcon(e.martialArt)} ${maLabel(e.martialArt)}</div>
          </div>
        </div>
      </td>
      <td><span class="card-cat">${e.category}</span></td>
      <td class="td-mono">${fmt(e.dateStart)}</td>
      <td class="td-loc">${e.location}</td>
      <td>${sBadge(e.status)}</td>
      <td><span class="reg-badge">${regCount(e.id)}</span></td>
      <td><span class="pub-badge ${e.published?'pub-on':'pub-off'}">${e.published?'● Publik':'○ Draft'}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-pub ${e.published?'on':''}" onclick="togglePub('${e.id}')">${e.published?'Draft':'Publish'}</button>
          <button class="btn-sm btn-edit" onclick="openEventModal('${e.id}')">Edit</button>
          <button class="btn-sm" style="background:#eff6ff;color:#2563eb;border:none;padding:5px 8px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px" onclick="openBracketModal('${e.id}')">🏆 Bagan</button>
          <button class="btn-sm" style="background:#f5f3ff;color:#7c3aed;border:none;padding:5px 8px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px" onclick="openResultsModal('${e.id}')">🏅 Hasil</button>
          <button class="btn-sm btn-del" onclick="confirmDel('${e.id}')">Hapus</button>
        </div>
      </td>
    </tr>`).join('');
}

function sortEvt(f) {
  if (evtSortField === f) evtSortDir *= -1; else { evtSortField = f; evtSortDir = 1; }
  renderAdminTable();
}

// ── EVENT MODAL ────────────────────────────────
function openEventModal(id) {
  editingEvtId = id || null;
  document.getElementById('evt-modal-title').textContent = editingEvtId ? 'Edit Event' : 'Tambah Event Baru';
  document.getElementById('evt-photo-preview').style.display = 'none';
  document.getElementById('evt-photo-preview').src = '';
  document.getElementById('ef-photo-input').value = '';

  // Populate martial arts select
  const maEl = document.getElementById('ef-ma');
  if (maEl) maEl.innerHTML = MARTIAL_ARTS.map(m => `<option value="${m.key}">${m.icon} ${m.label}</option>`).join('');

  if (editingEvtId) {
    const e = getEvents().find(ev => ev.id === editingEvtId);
    if (maEl) maEl.value = e.martialArt || 'Karate';
    document.getElementById('ef-name').value   = e.name;
    document.getElementById('ef-cat').value    = e.category;
    document.getElementById('ef-status').value = e.status;
    document.getElementById('ef-ds').value     = e.dateStart;
    document.getElementById('ef-de').value     = e.dateEnd;
    document.getElementById('ef-dl').value     = e.deadline||'';
    document.getElementById('ef-fee').value    = e.fee||'';
    document.getElementById('ef-loc').value    = e.location;
    document.getElementById('ef-org').value    = e.organizer||'';
    document.getElementById('ef-desc').value   = e.desc||'';
    document.getElementById('ef-kab').value    = e.kabupaten||'';
    if (e.photo) { document.getElementById('evt-photo-preview').src = e.photo; document.getElementById('evt-photo-preview').style.display = 'block'; }
  } else {
    ['ef-name','ef-ds','ef-de','ef-dl','ef-fee','ef-loc','ef-org','ef-desc','ef-kab'].forEach(fid => document.getElementById(fid).value = '');
    document.getElementById('ef-cat').value    = '';
    document.getElementById('ef-status').value = 'open';
  }
  document.getElementById('event-modal').classList.add('open');
}

async function handlePhotoChange(input) {
  if (!input.files[0]) return;
  if (input.files[0].size > 3*1024*1024) { toast('File foto maks 3MB','error'); input.value=''; return; }
  const b64 = await fileToBase64(input.files[0]);
  document.getElementById('evt-photo-preview').src = b64;
  document.getElementById('evt-photo-preview').style.display = 'block';
}

function saveEvent() {
  const name = document.getElementById('ef-name').value.trim();
  const cat  = document.getElementById('ef-cat').value;
  const ds   = document.getElementById('ef-ds').value;
  const de   = document.getElementById('ef-de').value;
  const loc  = document.getElementById('ef-loc').value.trim();
  if (!name || !cat || !ds || !de || !loc) { toast('Harap isi field wajib (*)','error'); return; }

  const photo = document.getElementById('evt-photo-preview').style.display !== 'none'
    ? document.getElementById('evt-photo-preview').src : null;

  const evts = getEvents();
  const obj = {
    martialArt: document.getElementById('ef-ma')?.value || 'Karate',
    name, category:cat, status:document.getElementById('ef-status').value,
    dateStart:ds, dateEnd:de, deadline:document.getElementById('ef-dl').value||null,
    fee:document.getElementById('ef-fee').value.trim()||null,
    location:loc, organizer:document.getElementById('ef-org').value.trim()||null,
    desc:document.getElementById('ef-desc').value.trim()||null,
    kabupaten:document.getElementById('ef-kab').value||null, photo,
    published: true
  };

  if (editingEvtId) {
    const idx = evts.findIndex(e => e.id === editingEvtId);
    evts[idx] = { ...evts[idx], ...obj };
  } else {
    evts.unshift({ id:'evt-'+Date.now(), createdAt:Date.now(), ...obj });
  }
  setEvents(evts);
  closeModal('event-modal');
  renderAdminTable();
  toast(`✓ Event ${editingEvtId ? 'diperbarui' : 'ditambahkan'}`, 'success');
}

function togglePub(id) {
  const evts = getEvents();
  const e = evts.find(ev => ev.id === id);
  if (e) { e.published = !e.published; setEvents(evts); renderAdminTable(); toast(`Event ${e.published?'dipublikasikan':'dijadikan draft'}`, 'success'); }
}

function confirmDel(id) {
  const e = getEvents().find(ev => ev.id === id);
  document.getElementById('conf-icon').textContent = '🗑️';
  document.getElementById('conf-title').textContent = 'Hapus Event';
  document.getElementById('conf-msg').textContent   = `Hapus "${e?.name}"? Aksi ini tidak dapat dibatalkan.`;
  confirmCb = () => {
    setEvents(getEvents().filter(ev => ev.id !== id));
    renderAdminTable(); closeConfirm();
    toast('Event dihapus', 'error');
  };
  document.getElementById('conf-ok').onclick = confirmCb;
  document.getElementById('confirm-overlay').style.display = 'flex';
}
function closeConfirm() { document.getElementById('confirm-overlay').style.display = 'none'; }

// ── PARTICIPANTS ────────────────────────────────
function populatePartFilter() {
  const sel = document.getElementById('part-event-filter'); if (!sel) return;
  const evts = getEvents();
  sel.innerHTML = `<option value="">— Semua Event —</option>` +
    evts.map(e => `<option value="${e.id}">${maIcon(e.martialArt)} ${e.name}</option>`).join('');
}
function setPartFilter(id) { const sel = document.getElementById('part-event-filter'); if (sel) { sel.value = id; renderParticipants(); } }

function renderParticipants() {
  const eid = document.getElementById('part-event-filter')?.value||'';
  const q   = (document.getElementById('part-search')?.value||'').toLowerCase();
  let regs  = [...getRegs()];
  if (eid) regs = regs.filter(r => r.eventId === eid);
  if (q)   regs = regs.filter(r => r.name.toLowerCase().includes(q)||r.email.toLowerCase().includes(q)||(r.dojo||'').toLowerCase().includes(q));
  regs.sort((a,b) => b.createdAt - a.createdAt);

  const em = {}; getEvents().forEach(e => { em[e.id] = e; });
  const pm = {}; getPayments().forEach(p => { pm[p.regId] = p; });

  const summary = document.getElementById('parts-summary');
  if (summary) {
    const catCounts = {};
    regs.forEach(r => { catCounts[r.category] = (catCounts[r.category]||0)+1; });
    summary.innerHTML = `<div class="parts-summary-bar">
      <span><strong>${regs.length}</strong> peserta</span>
      ${Object.entries(catCounts).slice(0,4).map(([c,n]) => `<span class="summ-pill">${c}: ${n}</span>`).join('')}
    </div>`;
  }

  const tbody = document.getElementById('parts-tbody');
  const empty = document.getElementById('parts-empty');
  if (!regs.length) {
    if (tbody) tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  tbody.innerHTML = regs.map((r,i) => {
    const pay = pm[r.id]; const ev = em[r.eventId];
    return `<tr>
      <td>${i+1}</td>
      <td><strong>${r.name}</strong></td>
      <td>${r.email}</td>
      <td>${r.phone}</td>
      <td>${r.dojo||'—'}</td>
      <td><span class="card-cat">${r.category}</span></td>
      <td>${r.belt||'—'}</td>
      <td>${r.age}</td>
      <td>${r.regency||'—'}</td>
      <td><small>${ev?.name?.substring(0,20)||'—'}…</small></td>
      <td>${pay ? payBadge(pay.status) : '<span style="font-size:11px;color:var(--text-muted)">Belum</span>'}</td>
      <td>${timeAgo(r.createdAt)}</td>
      <td><button class="btn-sm btn-del" onclick="deleteReg('${r.id}')">Hapus</button></td>
    </tr>`;
  }).join('');
}

function deleteReg(id) {
  confirmCb = () => {
    setRegs(getRegs().filter(r => r.id !== id));
    renderParticipants(); closeConfirm();
    toast('Peserta dihapus', 'error');
  };
  document.getElementById('conf-icon').textContent = '🗑️';
  document.getElementById('conf-title').textContent = 'Hapus Peserta';
  document.getElementById('conf-msg').textContent = 'Hapus data peserta ini?';
  document.getElementById('conf-ok').onclick = confirmCb;
  document.getElementById('confirm-overlay').style.display = 'flex';
}

// ── ADMIN RESULTS TAB ──────────────────────────
function renderAdminResults() {
  const results = getResults();
  const evts = getEvents(); const em = {}; evts.forEach(e => { em[e.id] = e; });
  const filterEvt = document.getElementById('res-filter-event')?.value || '';
  let filtered = [...results].sort((a,b) => b.createdAt - a.createdAt);
  if (filterEvt) filtered = filtered.filter(r => r.eventId === filterEvt);

  // Populate event filter
  const sel = document.getElementById('res-filter-event');
  if (sel && sel.innerHTML === '' || sel?.options.length <= 1) {
    sel.innerHTML = `<option value="">— Semua Event —</option>` + evts.map(e => `<option value="${e.id}">${maIcon(e.martialArt)} ${e.name}</option>`).join('');
  }

  const container = document.getElementById('admin-results-list');
  if (!container) return;

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🏅</div><h3>Belum Ada Hasil</h3><p>Gunakan tombol "Kelola Hasil" pada tabel event untuk menginput hasil pertandingan.</p></div>`;
    return;
  }

  container.innerHTML = filtered.map(r => {
    const ev = em[r.eventId];
    return `
      <div class="result-admin-row">
        <div class="result-admin-header">
          <div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px">${maIcon(ev?.martialArt)} ${ev?.name || '—'}</div>
            <div style="font-weight:700;font-size:16px">${r.category}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn-sm btn-edit" onclick="openResultsModal('${r.eventId}');setTimeout(()=>openResultForm('${r.id}','${r.eventId}'),300)">Edit</button>
            <button class="btn-sm btn-del" onclick="deleteResult('${r.id}','${r.eventId}');renderAdminResults()">Hapus</button>
          </div>
        </div>
        <div class="result-podium" style="padding-top:8px">
          <div class="podium-item gold">🥇 <span class="podium-name">${r.gold?.name||'—'}</span> <span class="podium-dojo">${r.gold?.dojo||''}</span></div>
          <div class="podium-item silver">🥈 <span class="podium-name">${r.silver?.name||'—'}</span> <span class="podium-dojo">${r.silver?.dojo||''}</span></div>
          ${r.bronze1 ? `<div class="podium-item bronze">🥉 <span class="podium-name">${r.bronze1.name}</span> <span class="podium-dojo">${r.bronze1.dojo||''}</span></div>` : ''}
        </div>
      </div>`;
  }).join('');
}
