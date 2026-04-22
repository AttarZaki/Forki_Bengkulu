'use strict';

let _editEvtId=null, _evtSortF='name', _evtSortD=1;

function enterAdminApp(){showPage('page-admin-app');switchAdminTab('dashboard');}

function switchAdminTab(tab){
  const tabs=['dashboard','events','participants','payments','results','tatami','announcements'];
  tabs.forEach(t=>{
    const content=document.getElementById('atab-content-'+t);
    const btn=document.getElementById('atab-'+t);
    if(content) content.style.display=t===tab?'block':'none';
    if(btn) btn.classList.toggle('active',t===tab);
  });
  // Update page title
  const titles={dashboard:'Dashboard',events:'Kelola Event',participants:'Data Peserta',payments:'Pembayaran',results:'Input Hasil',tatami:'Jadwal Tatami',announcements:'Pengumuman'};
  const titleEl=document.getElementById('admin-page-title');
  if(titleEl) titleEl.textContent=titles[tab]||tab;
  // Sync sidebar badge numbers
  const pendReg=getRegs().filter(r=>r.status==='pending').length;
  const pendPay=getPayments().filter(p=>p.status==='pending').length;
  const set=(id,n)=>{const el=document.getElementById(id);if(el){el.textContent=n;el.classList.toggle('show',n>0);}};
  set('sb-badge-parts',pendReg); set('sb-badge-pay',pendPay); set('sb-badge-events',getEvents().length);
  if(tab==='dashboard')     renderDashboard();
  if(tab==='events')        renderAdminEvtTable();
  if(tab==='participants')  {populatePartFilter();renderParticipants();}
  if(tab==='payments')      renderAdminPayments();
  if(tab==='results')       renderAdminResultsTab();
  if(tab==='tatami')        renderAdminTatamiTab();
  if(tab==='announcements') {renderAdminAnnouncements();_populateAnnEvtSel();}
}

function updateSidebarBadges(){
  const pendReg = getRegs().filter(r=>r.status==='pending').length;
  const pendPay = getPayments().filter(p=>p.status==='pending').length;
  const total   = getEvents().length;
  const set = (id, n) => {
    const el = document.getElementById(id); if(!el) return;
    el.textContent = n;
    el.classList.toggle('show', n > 0);
  };
  set('sb-badge-parts',  pendReg);
  set('sb-badge-pay',    pendPay);
  set('sb-badge-events', total);
  // Also update tab active state
  ['dashboard','events','participants','payments','results','tatami','announcements'].forEach(t=>{
    const b=document.getElementById('atab-'+t);
    if(b) b.classList.remove('active');
  });
}

function toggleAdminSidebar(){
  document.querySelector('.admin-sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}
function closeAdminSidebar(){
  document.querySelector('.admin-sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('show');
}

/* ── EVENTS TABLE ────────────────────────────────────── */
function renderAdminEvtTable(){
  const q=(document.getElementById('adm-search')?.value||'').toLowerCase();
  const sf=document.getElementById('adm-status-filter')?.value||'';
  let evts=[...getEvents()];
  if(q)  evts=evts.filter(e=>e.name.toLowerCase().includes(q)||e.location.toLowerCase().includes(q));
  if(sf) evts=evts.filter(e=>e.status===sf);
  evts.sort((a,b)=>{const av=a[_evtSortF]||'',bv=b[_evtSortF]||'';return typeof av==='string'?av.localeCompare(bv)*_evtSortD:(av-bv)*_evtSortD;});
  const cnt=document.getElementById('adm-count'); if(cnt) cnt.textContent=`${evts.length} event`;
  const tbody=document.getElementById('adm-tbody');
  if(!evts.length){tbody.innerHTML=`<tr><td colspan="8" class="td-empty">Tidak ada event ditemukan.</td></tr>`;return;}
  tbody.innerHTML=evts.map(e=>`<tr>
    <td><div class="td-evt-cell">
      ${e.photo?`<img class="td-thumb" src="${e.photo}" alt="foto"/>`:`<div class="td-thumb td-thumb-def">🥋</div>`}
      <div>
        <div class="td-name">${e.name}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:1px">
          Kuota: ${e.maxParticipants||'∞'} &nbsp;|&nbsp; ${e.registrationApproval?'✓ Approval':'Auto Approve'}
        </div>
      </div>
    </div></td>
    <td><span class="cat-badge">${e.category}</span></td>
    <td class="td-mono">${fmt(e.dateStart)}</td>
    <td class="td-loc">${e.location}</td>
    <td>${statusBadge(e.status)}</td>
    <td><span class="reg-count-badge">${approvedRegCount(e.id)}</span></td>
    <td><span class="pub-badge ${e.published?'pub-on':'pub-off'}">${e.published?'● Publik':'○ Draft'}</span></td>
    <td><div class="action-btns">
      <button class="btn-sm ${e.published?'btn-draft':'btn-publish'}" onclick="togglePub('${e.id}')">${e.published?'Draft':'Publish'}</button>
      <button class="btn-sm btn-edit" onclick="openEvtModal('${e.id}')">Edit</button>
      <button class="btn-sm" style="background:#eff6ff;color:#1d4ed8" onclick="openBracketAdmin('${e.id}')">🏆</button>
      <button class="btn-sm" style="background:#f5f3ff;color:#7c3aed" onclick="openResultsModal('${e.id}')">🏅</button>
      <button class="btn-sm" style="background:#f0fdf4;color:#15803d" onclick="openTatamiAdmin('${e.id}')">📋</button>
      <button class="btn-sm" style="background:#fdf2f8;color:#9d174d" onclick="openGalleryModal('${e.id}')">🖼️</button>
      <button class="btn-sm" style="background:#eff6ff;color:#1d4ed8" onclick="openDocsModal('${e.id}')">📎</button>
      <button class="btn-sm" style="background:#fefce8;color:#a16207" onclick="openWeighinModal('${e.id}')">⚖️</button>
      <button class="btn-sm btn-del" onclick="confirmDelEvt('${e.id}')">Hapus</button>
    </div></td>
  </tr>`).join('');
}
function sortEvt(f){if(_evtSortF===f)_evtSortD*=-1;else{_evtSortF=f;_evtSortD=1;}renderAdminEvtTable();}

/* ── EVENT MODAL ─────────────────────────────────────── */
function openEvtModal(id){
  _editEvtId=id||null;
  document.getElementById('evt-modal-title').textContent=_editEvtId?'Edit Event':'Tambah Event Baru';
  const prev=document.getElementById('evt-photo-prev'); prev.style.display='none'; prev.src='';
  document.getElementById('ef-photo-input').value='';
  if(_editEvtId){
    const e=getEvents().find(x=>x.id===_editEvtId); if(!e) return;
    document.getElementById('ef-name').value  =e.name;
    document.getElementById('ef-cat').value   =e.category;
    document.getElementById('ef-status').value=e.status;
    document.getElementById('ef-ds').value    =e.dateStart;
    document.getElementById('ef-de').value    =e.dateEnd;
    document.getElementById('ef-dl').value    =e.deadline||'';
    document.getElementById('ef-fee').value   =e.fee||'';
    document.getElementById('ef-loc').value   =e.location;
    document.getElementById('ef-org').value   =e.organizer||'';
    document.getElementById('ef-desc').value  =e.desc||'';
    document.getElementById('ef-kab').value   =e.kabupaten||'';
    document.getElementById('ef-quota').value =e.maxParticipants||'';
    document.getElementById('ef-approval').checked=e.registrationApproval||false;
    if(e.photo){prev.src=e.photo;prev.style.display='block';}
  } else {
    ['ef-name','ef-ds','ef-de','ef-dl','ef-fee','ef-loc','ef-org','ef-desc','ef-quota'].forEach(id=>{document.getElementById(id).value='';});
    document.getElementById('ef-cat').value=''; document.getElementById('ef-status').value='open';
    document.getElementById('ef-kab').value=''; document.getElementById('ef-approval').checked=false;
  }
  openModal('modal-event-form');
}
async function handlePhotoUpload(input){
  if(!input.files[0]) return;
  if(input.files[0].size>3*1024*1024){toast('File foto maks. 3MB','error');input.value='';return;}
  const b64=await fileToBase64(input.files[0]);
  const prev=document.getElementById('evt-photo-prev'); prev.src=b64; prev.style.display='block';
}
function saveEvent(){
  const name=document.getElementById('ef-name').value.trim();
  const cat=document.getElementById('ef-cat').value;
  const ds=document.getElementById('ef-ds').value;
  const de=document.getElementById('ef-de').value;
  const loc=document.getElementById('ef-loc').value.trim();
  if(!name||!cat||!ds||!de||!loc){toast('Harap isi field wajib (*)','error');return;}
  const prev=document.getElementById('evt-photo-prev');
  const photo=prev.style.display!=='none'&&prev.src?prev.src:null;
  const quota=parseInt(document.getElementById('ef-quota').value)||null;
  const data={name,category:cat,status:document.getElementById('ef-status').value,dateStart:ds,dateEnd:de,
    deadline:document.getElementById('ef-dl').value||null,fee:document.getElementById('ef-fee').value.trim()||null,
    location:loc,organizer:document.getElementById('ef-org').value.trim()||null,
    desc:document.getElementById('ef-desc').value.trim()||null,kabupaten:document.getElementById('ef-kab').value||null,
    photo,published:true,maxParticipants:quota,registrationApproval:document.getElementById('ef-approval').checked};
  const evts=getEvents();
  if(_editEvtId){const i=evts.findIndex(e=>e.id===_editEvtId);if(i!==-1)evts[i]={...evts[i],...data};}
  else evts.unshift({id:'evt-'+Date.now(),createdAt:Date.now(),...data});
  setEvents(evts); closeModal('modal-event-form'); renderAdminEvtTable();
  toast(`✓ Event ${_editEvtId?'diperbarui':'ditambahkan'}`, 'success');
}
function togglePub(id){const evts=getEvents();const e=evts.find(x=>x.id===id);if(!e)return;e.published=!e.published;setEvents(evts);renderAdminEvtTable();toast(`Event ${e.published?'dipublikasikan':'dijadikan draft'}`,'success');}
function confirmDelEvt(id){const e=getEvents().find(x=>x.id===id);showConfirm('Hapus Event',`Hapus "${e?.name}"?`,()=>{setEvents(getEvents().filter(x=>x.id!==id));renderAdminEvtTable();toast('Event dihapus','error');});}

/* ── ADMIN RESULTS TAB ───────────────────────────────── */
function renderAdminResultsTab(){
  const fEvt=document.getElementById('res-admin-filter')?.value||'';
  const evts=getEvents(); const em={};evts.forEach(e=>{em[e.id]=e;});
  const sel=document.getElementById('res-admin-filter');
  if(sel&&sel.options.length<=1) evts.forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=e.name;sel.appendChild(o);});
  let results=[...getResults()].sort((a,b)=>b.createdAt-a.createdAt);
  if(fEvt) results=results.filter(r=>(r.evtId||r.eventId)===fEvt);
  const c=document.getElementById('admin-results-list'); if(!c) return;
  if(!results.length){c.innerHTML=`<div class="empty-state"><div class="empty-icon">🏅</div><h3>Belum Ada Hasil</h3><p>Gunakan tombol 🏅 pada tabel Event untuk input hasil.</p></div>`;return;}
  c.innerHTML=results.map(r=>{
    const evt=em[r.evtId||r.eventId];
    return `<div class="result-admin-card">
      <div class="result-admin-header">
        <div><div class="result-admin-event">${evt?.name||'—'}</div><div class="result-admin-cat">${r.category}</div></div>
        <div class="action-btns">
          <button class="btn-sm btn-edit" onclick="openResultsModal('${r.evtId||r.eventId}');setTimeout(()=>openResForm('${r.id}','${r.evtId||r.eventId}'),300)">Edit</button>
          <button class="btn-sm" style="background:#eff6ff;color:#1d4ed8" onclick="printCertificates('${r.id}')">🎖️</button>
          <button class="btn-sm btn-del" onclick="deleteResult('${r.id}','${r.evtId||r.eventId}');renderAdminResultsTab()">Hapus</button>
        </div>
      </div>
      <div class="result-podium">
        <div class="podium-item gold"><span class="podium-medal">🥇</span><div><div class="podium-name">${r.gold?.name||'—'}</div><div class="podium-dojo">${r.gold?.dojo||''}</div></div></div>
        <div class="podium-item silver"><span class="podium-medal">🥈</span><div><div class="podium-name">${r.silver?.name||'—'}</div><div class="podium-dojo">${r.silver?.dojo||''}</div></div></div>
        ${r.bronze1?`<div class="podium-item bronze"><span class="podium-medal">🥉</span><div><div class="podium-name">${r.bronze1.name}</div><div class="podium-dojo">${r.bronze1.dojo||''}</div></div></div>`:''}
      </div>
    </div>`;
  }).join('');
}
