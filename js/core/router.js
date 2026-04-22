'use strict';

/* ── GLOBAL STATE ───────────────────────────────────── */
let currentUser=null, currentRole=null;
let lpCatFilter='all', lpStatusFilter='all';
let uaCatFilter='all', uaStatusFilter='all';

/* ── ROUTING ────────────────────────────────────────── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  closeMobNav(); buildNavbar(id); window.scrollTo(0,0);
}
function goLanding() {
  showPage('page-landing');
  renderHeroStats(); renderTicker();
  renderLPPills(); renderLPStatusPills(); renderKabFilter();
  renderLandingGrid();
  if (typeof renderProvinceStats === 'function') renderProvinceStats();
  if (typeof initViewToggle === 'function') initViewToggle();
  if (typeof initCountdowns === 'function') setTimeout(initCountdowns, 200);
}

/* ── NAVBAR ─────────────────────────────────────────── */
function buildNavbar(pageId) {
  const nl=document.getElementById('nav-links');
  const nr=document.getElementById('nav-right');
  const darkBtn=`<button class="btn-dark" onclick="toggleDark()" title="Toggle Dark Mode"><span id="dark-icon">${document.body.classList.contains('dark')?'☀️':'🌙'}</span></button>`;

  if (pageId==='page-user-app' && currentRole==='user') {
    nl.innerHTML=`
      <button class="nav-link active" onclick="showPage('page-user-app');renderUserDashboard()">🏠 Event</button>
      <button class="nav-link" onclick="showPage('page-user-profile');renderUserProfile()">👤 Profil</button>
      <button class="nav-link" onclick="openUserPaymentsModal()">💳 Pembayaran</button>
      <button class="nav-link" onclick="openModal('modal-leaderboard');renderLeaderboard()">🏅 Leaderboard</button>`;
    nr.innerHTML=`<span class="nav-badge badge-user">PESERTA</span>
      <span class="nav-username">${currentUser.name.split(' ')[0]}</span>
      ${darkBtn}<button class="btn-logout" onclick="doLogout()">Keluar</button>`;
    buildMobNav('user');
  } else if (pageId==='page-admin-app' && currentRole==='admin') {
    nl.innerHTML=`
      <button class="nav-link active" id="nl-dash"  onclick="switchAdminTab('dashboard');setNL(this)">📊 Dashboard</button>
      <button class="nav-link" id="nl-evt"   onclick="switchAdminTab('events');setNL(this)">🗓️ Event</button>
      <button class="nav-link" id="nl-parts" onclick="switchAdminTab('participants');setNL(this)">👥 Peserta</button>
      <button class="nav-link" id="nl-pay"   onclick="switchAdminTab('payments');setNL(this)">💳 Bayar</button>
      <button class="nav-link" id="nl-res"   onclick="switchAdminTab('results');setNL(this)">🏅 Hasil</button>
      <button class="nav-link" id="nl-tat"   onclick="switchAdminTab('tatami');setNL(this)">📋 Tatami</button>
      <button class="nav-link" id="nl-ann"   onclick="switchAdminTab('announcements');setNL(this)">📢 Pengumuman</button>`;
    nr.innerHTML=`<span class="nav-badge badge-admin">ADMIN</span>
      ${darkBtn}<button class="btn-logout" onclick="doLogout()">Keluar</button>`;
    buildMobNav('admin');
  } else {
    nl.innerHTML='';
    nr.innerHTML=`${darkBtn}<button class="btn-nav-login" onclick="showPage('page-user-login')">Masuk</button>`;
    buildMobNav('guest');
  }
}
function setNL(el){document.querySelectorAll('.nav-link').forEach(b=>b.classList.remove('active'));el.classList.add('active');}
function toggleMobNav(){document.getElementById('mobile-nav').classList.toggle('open');}
function closeMobNav(){document.getElementById('mobile-nav').classList.remove('open');}
function buildMobNav(role) {
  const mn=document.getElementById('mobile-nav');
  if(role==='user') mn.innerHTML=`
    <button class="mob-link" onclick="showPage('page-user-app');renderUserDashboard();closeMobNav()">🏠 Event</button>
    <button class="mob-link" onclick="showPage('page-user-profile');renderUserProfile();closeMobNav()">👤 Profil</button>
    <button class="mob-link" onclick="openUserPaymentsModal();closeMobNav()">💳 Pembayaran</button>
    <button class="mob-link" onclick="openModal('modal-leaderboard');renderLeaderboard();closeMobNav()">🏅 Leaderboard</button>
    <hr class="mob-sep"><button class="mob-link" onclick="toggleDark();closeMobNav()">🌙 Dark Mode</button>
    <button class="mob-link mob-danger" onclick="doLogout()">🚪 Keluar</button>`;
  else if(role==='admin') mn.innerHTML=`
    <button class="mob-link" onclick="switchAdminTab('dashboard');closeMobNav()">📊 Dashboard</button>
    <button class="mob-link" onclick="switchAdminTab('events');closeMobNav()">🗓️ Event</button>
    <button class="mob-link" onclick="switchAdminTab('participants');closeMobNav()">👥 Peserta</button>
    <button class="mob-link" onclick="switchAdminTab('payments');closeMobNav()">💳 Pembayaran</button>
    <button class="mob-link" onclick="switchAdminTab('results');closeMobNav()">🏅 Hasil</button>
    <button class="mob-link" onclick="switchAdminTab('tatami');closeMobNav()">📋 Tatami</button>
    <button class="mob-link" onclick="switchAdminTab('announcements');closeMobNav()">📢 Pengumuman</button>
    <hr class="mob-sep"><button class="mob-link mob-danger" onclick="doLogout()">🚪 Keluar</button>`;
  else mn.innerHTML=`
    <button class="mob-link" onclick="showPage('page-user-login');closeMobNav()">👤 Masuk</button>
    <button class="mob-link" onclick="switchAuthTab('register');showPage('page-user-login');closeMobNav()">📝 Daftar</button>
    <hr class="mob-sep">
    <button class="mob-link" onclick="showPage('page-admin-login');closeMobNav()">🛡️ Admin Portal</button>
    <button class="mob-link" onclick="toggleDark();closeMobNav()">🌙 Dark Mode</button>`;
}

/* ── CONFIRM DIALOG ─────────────────────────────────── */
let _confirmCb=null;
function showConfirm(title,msg,cb){
  document.getElementById('conf-title').textContent=title;
  document.getElementById('conf-msg').textContent=msg;
  _confirmCb=cb; openModal('confirm-dialog');
}
function closeConfirm(){closeModal('confirm-dialog');_confirmCb=null;}
function doConfirm(){if(_confirmCb)_confirmCb();closeConfirm();}

/* ── USER PROFILE ───────────────────────────────────── */
function renderUserProfile() {
  if(!currentUser) return;
  document.getElementById('prof-name').textContent    = currentUser.name;
  document.getElementById('prof-username').textContent= '@'+currentUser.username;
  document.getElementById('prof-email').textContent   = currentUser.email;
  document.getElementById('prof-phone').textContent   = currentUser.phone||'—';
  document.getElementById('prof-dojo').textContent    = currentUser.dojo||'—';

  const myRegs=getRegs().filter(r=>r.userId===currentUser.id&&r.status!=='cancelled');
  const evtMap={};getEvents().forEach(e=>{evtMap[e.id]=e;});
  const payMap={};getPayments().forEach(p=>{payMap[p.regId]=p;});
  const ciMap ={};getCheckins().forEach(c=>{ciMap[c.regId]=c;});

  // Profile stats
  const statEl=document.getElementById('prof-stats');
  if(statEl){
    const lunas=myRegs.filter(r=>{const p=payMap[r.id];return p?.status==='verified';}).length;
    const medals=getResults().filter(r=>
      r.gold?.name===currentUser.name||r.silver?.name===currentUser.name||
      r.bronze1?.name===currentUser.name||r.bronze2?.name===currentUser.name
    ).length;
    statEl.innerHTML=`
      <div class="profile-stat"><div class="profile-stat-num">${myRegs.length}</div><div class="profile-stat-lbl">Pendaftaran</div></div>
      <div class="profile-stat"><div class="profile-stat-num">${lunas}</div><div class="profile-stat-lbl">Lunas</div></div>
      <div class="profile-stat"><div class="profile-stat-num">${medals}</div><div class="profile-stat-lbl">Prestasi</div></div>`;
  }

  const el=document.getElementById('my-reg-list');
  if(!myRegs.length){el.innerHTML='<div class="empty-mini">Belum ada pendaftaran aktif.</div>';return;}

  el.innerHTML=myRegs.sort((a,b)=>b.createdAt-a.createdAt).map(r=>{
    const ev=evtMap[r.eventId]; const pay=payMap[r.id]; const ci=ciMap[r.id];
    const regNum=typeof getRegNumber==='function'?getRegNumber(r.id,r.eventId):null;
    const canCancel = ev?.deadline && Date.now()<new Date(ev.deadline).getTime() && pay?.status!=='verified' && r.status!=='rejected';
    return `<div class="reg-hist-row">
      <div class="reg-hist-info">
        ${regNum?`<div class="reg-num-col">No. ${regNum}</div>`:''}
        <div class="reg-hist-event">${ev?.name||'—'}</div>
        <div class="reg-hist-detail">📋 ${r.category} &nbsp;•&nbsp; 🥋 ${r.belt||'—'} &nbsp;•&nbsp; ${timeAgo(r.createdAt)}</div>
        ${ci?'<div class="checkin-ok">✅ Check-in Hari H</div>':''}
      </div>
      <div class="reg-hist-status">
        ${approvalBadge(r.status)}
        ${pay ? payBadge(pay.status) : `<button class="btn-pay-now" onclick="openPaymentModal('${r.id}','${r.eventId}')">💳 Bayar</button>`}
        <button class="btn-sm btn-edit" onclick="openParticipantCard('${r.id}')" title="Kartu Peserta">🪪</button>
        <button class="btn-wa" onclick="shareWhatsApp('${r.id}','${r.eventId}')" title="WhatsApp">📲</button>
        ${canCancel?`<button class="btn-cancel-reg" onclick="cancelRegistration('${r.id}')">✕ Batal</button>`:''}
      </div>
    </div>`;
  }).join('');
}
function openEditProfile(){
  document.getElementById('edit-name').value =currentUser.name||'';
  document.getElementById('edit-phone').value=currentUser.phone||'';
  document.getElementById('edit-dojo').value =currentUser.dojo||'';
  openModal('modal-edit-profile');
}
function saveProfile(){
  const name=document.getElementById('edit-name').value.trim();
  if(!name){toast('Nama tidak boleh kosong','error');return;}
  const users=getUsers(); const i=users.findIndex(u=>u.id===currentUser.id);
  users[i]={...users[i],name,phone:document.getElementById('edit-phone').value.trim(),dojo:document.getElementById('edit-dojo').value.trim()};
  setUsers(users); currentUser=users[i];
  sessionStorage.setItem('kc_session',JSON.stringify({id:currentUser.id,role:'user'}));
  closeModal('modal-edit-profile'); renderUserProfile();
  document.getElementById('user-welcome-name').textContent=currentUser.name.split(' ')[0];
  toast('✓ Profil diperbarui','success');
}

/* ── INIT ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  initDarkMode(); tryRestoreSession();
  if(currentRole==='admin') enterAdminApp();
  else if(currentRole==='user') enterUserApp();
  else goLanding();
  // Deep link handler (must run after page init)
  if (typeof checkDeepLink === 'function') setTimeout(checkDeepLink, 400);
});
