'use strict';

/* ── HERO STATS ─────────────────────────────────────── */
function renderHeroStats() {
  const evts=getPublished(), regs=getRegs();
  const el=document.getElementById('hero-stats'); if(!el) return;
  el.innerHTML=`
    <div class="hero-stat"><div class="hs-num">${evts.length}</div><div class="hs-lbl">Total Event</div></div>
    <div class="hero-stat"><div class="hs-num" style="color:#4ade80">${evts.filter(e=>e.status==='open').length}</div><div class="hs-lbl">Dibuka</div></div>
    <div class="hero-stat"><div class="hs-num" style="color:#fbbf24">${evts.filter(e=>e.status==='soon').length}</div><div class="hs-lbl">Segera</div></div>
    <div class="hero-stat"><div class="hs-num" style="color:#c4b5fd">${regs.length}</div><div class="hs-lbl">Total Peserta</div></div>`;
}

/* ── TICKER ─────────────────────────────────────────── */
function renderTicker() {
  const evts=getPublished().filter(e=>e.status==='open'||e.status==='soon');
  const inner=document.getElementById('ticker-inner'); if(!inner||!evts.length) return;
  const items=evts.map(e=>`<span class="ticker-item">🥋 ${e.name} — ${e.location} — Deadline: ${fmt(e.deadline)}</span>`);
  inner.innerHTML=[...items,...items].join('');
}

/* ── PILLS (fixed: no toString hack) ────────────────── */
function renderLPPills() {
  const el=document.getElementById('lp-pills'); if(!el) return;
  el.innerHTML=EVT_CATS.map(c=>`
    <button class="pill ${lpCatFilter===c?'active':''}" onclick="lpCatFilter='${c}';renderLPPills();renderLandingGrid()">
      ${c==='all'?'Semua Kategori':c}
    </button>`).join('');
}
function renderLPStatusPills() {
  const el=document.getElementById('lp-status-pills'); if(!el) return;
  el.innerHTML=Object.entries(EVT_STATUS).map(([k,v])=>`
    <button class="pill pill-status ${lpStatusFilter===k?'active':''}" onclick="lpStatusFilter='${k}';renderLPStatusPills();renderLandingGrid()">
      ${v}
    </button>`).join('');
}
function renderUAPills() {
  const el=document.getElementById('ua-pills'); if(!el) return;
  el.innerHTML=EVT_CATS.map(c=>`
    <button class="pill ${uaCatFilter===c?'active':''}" onclick="uaCatFilter='${c}';renderUAPills();renderUserGrid()">
      ${c==='all'?'Semua Kategori':c}
    </button>`).join('');
}
function renderUAStatusPills() {
  const el=document.getElementById('ua-status-pills'); if(!el) return;
  el.innerHTML=Object.entries(EVT_STATUS).map(([k,v])=>`
    <button class="pill pill-status ${uaStatusFilter===k?'active':''}" onclick="uaStatusFilter='${k}';renderUAStatusPills();renderUserGrid()">
      ${v}
    </button>`).join('');
}
function renderKabFilter() {
  const el=document.getElementById('lp-kabupaten'); if(!el) return;
  el.innerHTML=KABUPATEN.map(k=>`<option value="${k==='Semua Wilayah'?'':k}">${k}</option>`).join('');
}

/* ── LANDING GRID ───────────────────────────────────── */
function renderLandingGrid() {
  let evts=getPublished();
  if(lpCatFilter!=='all')    evts=evts.filter(e=>e.category===lpCatFilter);
  if(lpStatusFilter!=='all') evts=evts.filter(e=>e.status===lpStatusFilter);
  const kab=document.getElementById('lp-kabupaten')?.value||'';
  if(kab) evts=evts.filter(e=>e.kabupaten===kab);
  const q=document.getElementById('lp-search')?.value?.toLowerCase()||'';
  if(q) evts=evts.filter(e=>e.name.toLowerCase().includes(q)||e.location.toLowerCase().includes(q)||e.category.toLowerCase().includes(q));
  sortEvts(evts, document.getElementById('lp-sort')?.value||'newest');
  renderGrid('lp-event-grid',evts,false);
}

/* ── USER APP ───────────────────────────────────────── */
function enterUserApp() {
  document.getElementById('user-welcome-name').textContent=currentUser.name.split(' ')[0];
  showPage('page-user-app');
  if (typeof initViewToggle === 'function') initViewToggle();
  if (typeof initCountdowns === 'function') setTimeout(initCountdowns, 200);
  renderUserDashboard();
}
function renderUserDashboard() {
  renderUserStats(); renderUAPills(); renderUAStatusPills(); renderUserGrid();
}
function renderUserStats() {
  const evts=getPublished(); const my=getRegs().filter(r=>r.userId===currentUser.id);
  document.getElementById('us-total').textContent=evts.length;
  document.getElementById('us-open').textContent=evts.filter(e=>e.status==='open').length;
  document.getElementById('us-soon').textContent=evts.filter(e=>e.status==='soon').length;
  document.getElementById('us-myregs').textContent=my.length;
}
function renderUserGrid() {
  let evts=getPublished();
  if(uaCatFilter!=='all')    evts=evts.filter(e=>e.category===uaCatFilter);
  if(uaStatusFilter!=='all') evts=evts.filter(e=>e.status===uaStatusFilter);
  const q=document.getElementById('ua-search')?.value?.toLowerCase()||'';
  if(q) evts=evts.filter(e=>e.name.toLowerCase().includes(q)||e.location.toLowerCase().includes(q));
  sortEvts(evts,document.getElementById('ua-sort')?.value||'newest');
  renderGrid('ua-event-grid',evts,true);
}

function sortEvts(evts,mode) {
  if(mode==='newest') evts.sort((a,b)=>b.createdAt-a.createdAt);
  if(mode==='oldest') evts.sort((a,b)=>a.createdAt-b.createdAt);
  if(mode==='name')   evts.sort((a,b)=>a.name.localeCompare(b.name));
  if(mode==='date')   evts.sort((a,b)=>(a.dateStart||'').localeCompare(b.dateStart||''));
}

/* ── GRID / LIST RENDER ──────────────────────────────── */
function renderGrid(cid,evts,userMode) {
  const grid=document.getElementById(cid); if(!grid) return;
  if(!evts.length){
    grid.innerHTML=`<div class="empty-state"><div class="empty-icon">🗂️</div><h3>Tidak Ada Event</h3><p>Belum ada event yang sesuai filter Anda.</p></div>`;
    grid.style.display='block'; return;
  }
  grid.style.display='';
  const myIds=(userMode&&currentUser)?getRegs().filter(r=>r.userId===currentUser.id&&r.status!=='cancelled').map(r=>r.eventId):[];
  const mode = typeof getViewMode==='function' ? getViewMode() : 'grid';
  if (mode==='list') {
    grid.className='event-list-view';
    grid.innerHTML=evts.map(e=>buildListItem(e,userMode,myIds)).join('');
  } else {
    grid.className='event-grid';
    grid.innerHTML=evts.map(e=>buildCard(e,userMode,myIds)).join('');
  }
  // Start mini card countdowns
  if(typeof startCardCountdowns==='function') startCardCountdowns();
}

/* ── LIST ITEM ───────────────────────────────────────── */
function buildListItem(e,userMode,myIds) {
  const cnt=approvedRegCount(e.id);
  const soon=isDeadlineSoon(e.deadline);
  const days=daysUntil(e.deadline);
  const already=myIds.includes(e.id);
  const full=e.maxParticipants&&cnt>=e.maxParticipants;
  const hasGallery = typeof getEventGallery==='function' && getEventGallery(e.id).length>0;
  const hasDocs    = typeof getEventDocs==='function'    && getEventDocs(e.id).length>0;

  const photoHTML = e.photo
    ? `<div class="list-item-photo" style="background-image:url('${e.photo}')"></div>`
    : `<div class="list-item-photo-default"><span>🥋</span></div>`;

  let primaryBtn='';
  if(userMode){
    if(already)    primaryBtn=`<button class="btn-sm" style="background:#f0fdf4;color:#15803d" disabled>✓ Daftar</button>`;
    else if(full)  primaryBtn=`<button class="btn-sm" style="background:#fef2f2;color:#b91c1c" disabled>Penuh</button>`;
    else if(e.status==='open') primaryBtn=`<button class="btn-sm btn-green" onclick="openRegModal('${e.id}')">Daftar</button>`;
  } else {
    primaryBtn=`<button class="btn-sm btn-edit" onclick="openEventDetail('${e.id}')">Detail</button>`;
  }

  return `
  <div class="event-list-item ${soon?'item-urgent':''}">
    ${photoHTML}
    <div class="list-item-main">
      <div class="list-item-top">
        <span class="cat-badge">${e.category}</span>
        ${statusBadge(e.status)}
        ${soon?`<span class="deadline-badge" style="position:static;font-size:10px;padding:2px 8px">⏰ ${days===0?'Hari Ini':days+' hari'}</span>`:''}
        ${full?'<span class="quota-badge">Penuh</span>':''}
      </div>
      <div class="list-item-name">${e.name}</div>
      <div class="list-item-meta">
        <span>📅 ${fmt(e.dateStart)} – ${fmt(e.dateEnd)}</span>
        <span>📍 ${e.location}</span>
        <span>💰 ${e.fee||'Gratis'}</span>
        <span>👥 ${cnt}${e.maxParticipants?'/'+e.maxParticipants:''}</span>
      </div>
    </div>
    <div class="list-item-actions">
      ${primaryBtn}
      <button class="btn-sm btn-edit" onclick="openEventDetail('${e.id}')">···</button>
      <button class="btn-sm" style="background:#eff6ff;color:#1d4ed8" onclick="${currentRole==='admin'?`openBracketAdmin`:`openBracketView`}('${e.id}')">🏆</button>
      <button class="btn-sm" style="background:#f0fdf4;color:#15803d" onclick="openTatamiView('${e.id}')">📋</button>
      ${hasGallery?`<button class="btn-sm" style="background:#fdf2f8;color:#9d174d" onclick="openGalleryModal('${e.id}')">🖼️</button>`:''}
    </div>
  </div>`;
}

/* ── EVENT CARD ─────────────────────────────────────── */
function buildCard(e,userMode,myIds) {
  const cnt=approvedRegCount(e.id);
  const soon=isDeadlineSoon(e.deadline);
  const days=daysUntil(e.deadline);
  const already=myIds.includes(e.id);
  const hasRes=getResults().some(r=>r.eventId===e.id&&r.published);
  const anns=getAnnouncements().filter(a=>a.eventId===e.id&&a.published);
  const hasGallery = typeof getEventGallery==='function' && getEventGallery(e.id).length>0;
  const quota=e.maxParticipants;
  const full=quota&&cnt>=quota;

  const photoHTML=e.photo
    ?`<div class="card-photo" style="background-image:url('${e.photo}')"></div>`
    :`<div class="card-photo card-photo-default"><span>🥋</span></div>`;

  const deadlineBadge=soon?`<span class="deadline-badge">⏰ ${days===0?'Hari Ini!':days+' Hari Lagi'}</span>`:'';
  const quotaBadge=full?`<span class="quota-badge">🔴 Kuota Penuh</span>`:quota?`<span class="quota-avail">${quota-cnt} slot tersisa</span>`:'';
  const countdownHTML = typeof buildCardCountdown==='function' ? buildCardCountdown(e) : '';

  let primaryBtn='';
  if(userMode){
    if(already) primaryBtn=`<button class="btn-registered" disabled>✓ Sudah Mendaftar</button>`;
    else if(full) primaryBtn=`<button class="btn-full" disabled>Kuota Penuh</button>`;
    else if(e.status==='open') primaryBtn=`<button class="btn-register" onclick="openRegModal('${e.id}')">Daftar Sekarang</button>`;
    else primaryBtn=`<button class="btn-detail" onclick="openEventDetail('${e.id}')">Lihat Detail</button>`;
  } else {
    primaryBtn=`<button class="btn-detail" onclick="openEventDetail('${e.id}')">Lihat Detail</button>`;
  }

  const annBanner=anns.length?`<div class="card-ann-strip ann-${anns[0].type}">📢 ${anns[0].title}</div>`:'';

  return `
  <div class="event-card ${soon?'card-urgent':''} ${full?'card-full':''}">
    ${photoHTML}${deadlineBadge}
    ${annBanner}
    <div class="card-body">
      <div class="card-top">
        <span class="cat-badge">${e.category}</span>
        ${statusBadge(e.status)}
        ${quotaBadge}
      </div>
      <h3 class="card-title">${e.name}</h3>
      <div class="card-meta">
        <div class="meta-row"><span>📅</span> ${fmt(e.dateStart)} – ${fmt(e.dateEnd)}</div>
        <div class="meta-row"><span>📍</span> ${e.location}</div>
        <div class="meta-row"><span>🏢</span> ${e.organizer||'—'}</div>
        <div class="meta-row"><span>💰</span> ${e.fee||'Gratis'} &nbsp;|&nbsp; <span>👥</span> ${cnt}${quota?'/'+quota:''} peserta</div>
      </div>
      ${countdownHTML}
      <div class="card-actions">
        ${primaryBtn}
        <button class="btn-act bkt" onclick="${currentRole==='admin'?`openBracketAdmin`:`openBracketView`}('${e.id}')">🏆</button>
        <button class="btn-act tat"  onclick="openTatamiView('${e.id}')">📋</button>
        ${hasGallery?`<button class="btn-act gal" onclick="openGalleryModal('${e.id}')">🖼️</button>`:''}
        ${hasDocs?`<button class="btn-act" style="border-color:#e0e7ff;background:#eef2ff;color:#4338ca" onclick="openDocsModal('${e.id}')">📎</button>`:''}
        ${hasRes?`<button class="btn-act res" onclick="openResultsModal('${e.id}')">🏅</button>`:''}
        <button class="btn-act" onclick="openEventDetail('${e.id}')">···</button>
      </div>
    </div>
  </div>`;
}

/* ── EVENT DETAIL MODAL ─────────────────────────────── */
function openEventDetail(evtId) {
  const e=getEvents().find(x=>x.id===evtId); if(!e) return;
  const cnt=approvedRegCount(evtId);
  const days=daysUntil(e.deadline);
  const already=currentUser?getRegs().some(r=>r.eventId===evtId&&r.userId===currentUser.id):false;
  const results=getResults().filter(r=>r.eventId===evtId&&r.published);
  const anns=getAnnouncements().filter(a=>a.eventId===evtId&&a.published);
  const full=e.maxParticipants&&cnt>=e.maxParticipants;
  const galleryHTML = typeof buildGalleryPreview==='function' ? buildGalleryPreview(evtId) : '';
  const docsHTML    = typeof buildDocsPreview==='function'    ? buildDocsPreview(evtId)    : '';
  const mapsHTML    = typeof buildMapsEmbed==='function'      ? buildMapsEmbed(e.location)  : '';
  const shareURL    = typeof getEventPublicURL==='function'   ? getEventPublicURL(evtId)    : '';

  const annHTML=anns.length?anns.map(a=>`
    <div class="ann-banner ann-${a.type}">
      <strong>📢 ${a.title}</strong>
      <p>${a.body}</p>
    </div>`).join(''):'';

  const resHTML=results.length?`
    <div class="detail-results">
      <div class="detail-sec-title">🏅 Hasil Pertandingan</div>
      ${results.slice(0,3).map(r=>`
        <div class="result-mini">
          <div class="result-mini-cat">${r.category}</div>
          <div class="result-mini-pod">
            <span>🥇 ${r.gold?.name||'—'}</span>
            <span>🥈 ${r.silver?.name||'—'}</span>
            ${r.bronze1?`<span>🥉 ${r.bronze1.name}</span>`:''}
          </div>
        </div>`).join('')}
      ${results.length>3?`<button class="btn-link" onclick="closeModal('modal-detail');openResultsModal('${evtId}')">Lihat semua →</button>`:''}
    </div>`:'';

  document.getElementById('detail-content').innerHTML=`
    <div class="detail-wrap">
      ${e.photo?`<div class="detail-photo" style="background-image:url('${e.photo}')"></div>`:`<div class="detail-photo detail-photo-default"><span>🥋</span></div>`}
      <div class="detail-body">
        ${annHTML}
        <div class="detail-badges">
          <span class="cat-badge">${e.category}</span>
          ${statusBadge(e.status)}
          ${isDeadlineSoon(e.deadline)?`<span class="deadline-badge">⏰ ${days===0?'Hari Ini!':days+' Hari Lagi'}</span>`:''}
          ${full?'<span class="quota-badge">🔴 Kuota Penuh</span>':''}
        </div>
        <h2 class="detail-title">${e.name}</h2>
        <div class="detail-grid">
          <div class="detail-item"><div class="di-lbl">Tanggal Pelaksanaan</div><div class="di-val">📅 ${fmtFull(e.dateStart)} – ${fmtFull(e.dateEnd)}</div></div>
          <div class="detail-item"><div class="di-lbl">Deadline Pendaftaran</div><div class="di-val">⏳ ${e.deadline?fmtFull(e.deadline):'Tidak ditentukan'}</div></div>
          <div class="detail-item"><div class="di-lbl">Lokasi</div><div class="di-val">📍 ${e.location}</div></div>
          <div class="detail-item"><div class="di-lbl">Penyelenggara</div><div class="di-val">🏢 ${e.organizer||'—'}</div></div>
          <div class="detail-item"><div class="di-lbl">Biaya Pendaftaran</div><div class="di-val">💰 ${e.fee||'Gratis'}</div></div>
          <div class="detail-item"><div class="di-lbl">Peserta / Kuota</div><div class="di-val">👥 ${cnt}${e.maxParticipants?' / '+e.maxParticipants:''} orang</div></div>
        </div>
        ${e.desc?`<div class="detail-desc"><div class="di-lbl">Deskripsi</div><p>${e.desc}</p></div>`:''}
        ${docsHTML}
        ${galleryHTML}
        ${resHTML}
        ${mapsHTML}
        ${shareURL?`
        <div class="share-url-strip">
          <span class="share-url-text">${shareURL}</span>
          <div class="share-url-btns">
            <button class="btn-copy-url" onclick="copyEventURL('${evtId}')">📋 Salin Link</button>
            <button class="btn-wa-share" onclick="shareEventWA('${evtId}')">📲 WhatsApp</button>
          </div>
        </div>`:''}
        <div class="detail-actions">
          ${currentUser&&!already&&e.status==='open'&&!full&&currentRole!=='admin'
            ?`<button class="btn-primary" onclick="openRegModal('${evtId}');closeModal('modal-detail')">🥋 Daftar Sekarang</button>`:''}
          ${already?`<div class="registered-notice">✓ Anda sudah mendaftar event ini</div>`:''}
          ${currentUser&&!already&&e.status==='open'&&!full&&currentRole!=='admin'
            ?`<button class="btn-outline" style="border-color:var(--primary);color:var(--primary)" onclick="openMultiRegModal('${evtId}');closeModal('modal-detail')">📋 Daftar Multi-Kategori</button>`:``}
          <button class="btn-outline" onclick="closeModal('modal-detail');openBracketView('${evtId}')">🏆 Bagan</button>
          <button class="btn-outline" onclick="closeModal('modal-detail');openTatamiView('${evtId}')">📋 Tatami</button>
          <button class="btn-outline" onclick="closeModal('modal-detail');openGalleryModal('${evtId}')">🖼️ Galeri</button>
          <button class="btn-outline" onclick="closeModal('modal-detail');openResultsModal('${evtId}')">🏅 Hasil</button>
          <button class="btn-outline" onclick="closeModal('modal-detail');openDocsModal('${evtId}')">📎 Dokumen</button>
        </div>
      </div>
    </div>`;
  openModal('modal-detail');
}
