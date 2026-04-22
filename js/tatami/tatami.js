'use strict';

let _editTatId=null;

/* ── ADMIN ──────────────────────────────────────────── */
function openTatamiAdmin(evtId) {
  const e=getEvents().find(x=>x.id===evtId); if(!e) return;
  document.getElementById('tat-admin-event-name').textContent=e.name;
  document.getElementById('tat-evt-id').value=evtId;
  _buildDateOpts('tat-filter-date',e.dateStart,e.dateEnd,true);
  _buildDateOpts('tat-form-date',  e.dateStart,e.dateEnd,false);
  _editTatId=null; _resetTatForm();
  renderTatamiAdmin(evtId);
  openModal('modal-tatami-admin');
}

function _buildDateOpts(selId,start,end,addAll){
  const sel=document.getElementById(selId); if(!sel) return;
  const dates=[]; const cur=new Date(start); const last=new Date(end);
  while(cur<=last){dates.push(cur.toISOString().split('T')[0]);cur.setDate(cur.getDate()+1);}
  sel.innerHTML=(addAll?'<option value="">Semua Hari</option>':'')
    +dates.map(d=>`<option value="${d}">${fmtFull(d)}</option>`).join('');
}

function renderTatamiAdmin(evtId) {
  const fd=document.getElementById('tat-filter-date')?.value||'';
  const ft=document.getElementById('tat-filter-tatami')?.value||'';
  let ss=getTatami().filter(s=>s.eventId===evtId);
  if(fd) ss=ss.filter(s=>s.date===fd);
  if(ft) ss=ss.filter(s=>String(s.tatami)===ft);
  ss.sort((a,b)=>a.date.localeCompare(b.date)||a.tatami-b.tatami||a.timeStart.localeCompare(b.timeStart));

  const el=document.getElementById('tat-admin-list');
  if(!ss.length){el.innerHTML=`<div class="tat-empty"><div style="font-size:36px;margin-bottom:8px">📋</div><p>Belum ada jadwal. Klik <strong>+ Tambah Sesi</strong>.</p></div>`;return;}

  const byDate={};ss.forEach(s=>{(byDate[s.date]=byDate[s.date]||[]).push(s);});
  el.innerHTML=Object.entries(byDate).map(([date,rows])=>`
    <div class="tat-date-group">
      <div class="tat-date-header">📅 ${fmtFull(date)}</div>
      ${rows.map(s=>`
        <div class="tat-row">
          <div class="tat-tatami-badge">Tatami ${s.tatami}</div>
          <div class="tat-row-body">
            <div class="tat-row-time">${s.timeStart}${s.timeEnd?' – '+s.timeEnd:''}</div>
            <div class="tat-row-cat">${s.category}</div>
            <div class="tat-row-meta">
              ${s.referee?`<span>👤 ${s.referee}</span>`:''}
              ${s.notes?`<span>📝 ${s.notes}</span>`:''}
            </div>
          </div>
          <div class="tat-row-actions">
            <button class="btn-sm btn-edit" onclick="editTatSession('${s.id}')">Edit</button>
            <button class="btn-sm btn-del"  onclick="deleteTatSession('${s.id}','${evtId}')">Hapus</button>
          </div>
        </div>`).join('')}
    </div>`).join('');
}

function openTatForm(){_editTatId=null;_resetTatForm();document.getElementById('tat-form-title').textContent='+ Tambah Sesi';document.getElementById('tat-form-area').style.display='block';document.getElementById('tat-form-area').scrollIntoView({behavior:'smooth'});}
function editTatSession(id){
  const s=getTatami().find(x=>x.id===id); if(!s) return;
  _editTatId=id;
  document.getElementById('tat-form-title').textContent='Edit Sesi';
  document.getElementById('tat-form-date').value=s.date;
  document.getElementById('tat-form-tatami').value=s.tatami;
  document.getElementById('tat-form-ts').value=s.timeStart;
  document.getElementById('tat-form-te').value=s.timeEnd||'';
  const cats=KAT_ALL;
  if(cats.includes(s.category)){document.getElementById('tat-form-cat').value=s.category;document.getElementById('tat-custom-wrap').style.display='none';}
  else{document.getElementById('tat-form-cat').value='__custom__';document.getElementById('tat-form-custom-cat').value=s.category;document.getElementById('tat-custom-wrap').style.display='block';}
  document.getElementById('tat-form-referee').value=s.referee||'';
  document.getElementById('tat-form-notes').value=s.notes||'';
  document.getElementById('tat-form-area').style.display='block';
  document.getElementById('tat-form-area').scrollIntoView({behavior:'smooth'});
}
function _resetTatForm(){['tat-form-date','tat-form-tatami','tat-form-ts','tat-form-te','tat-form-cat','tat-form-custom-cat','tat-form-referee','tat-form-notes'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});const w=document.getElementById('tat-custom-wrap');if(w)w.style.display='none';}
function onTatCatChange(){const v=document.getElementById('tat-form-cat').value;const w=document.getElementById('tat-custom-wrap');if(w)w.style.display=v==='__custom__'?'block':'none';}
function cancelTatForm(){document.getElementById('tat-form-area').style.display='none';_editTatId=null;}

function saveTatSession(){
  const evtId=document.getElementById('tat-evt-id').value;
  const date=document.getElementById('tat-form-date').value;
  const tatami=parseInt(document.getElementById('tat-form-tatami').value);
  const ts=document.getElementById('tat-form-ts').value;
  const catSel=document.getElementById('tat-form-cat').value;
  const cat=catSel==='__custom__'?document.getElementById('tat-form-custom-cat').value.trim():catSel;
  if(!date||!tatami||!ts||!cat){toast('Harap isi Tanggal, Tatami, Jam Mulai, dan Kategori','error');return;}
  const obj={eventId:evtId,date,tatami,timeStart:ts,timeEnd:document.getElementById('tat-form-te').value||'',category:cat,referee:document.getElementById('tat-form-referee').value.trim()||'',notes:document.getElementById('tat-form-notes').value.trim()||''};
  const all=getTatami();
  if(_editTatId){const i=all.findIndex(s=>s.id===_editTatId);if(i!==-1)all[i]={...all[i],...obj};}
  else all.push({id:'tat-'+Date.now(),createdAt:Date.now(),...obj});
  setTatami(all); _editTatId=null;
  document.getElementById('tat-form-area').style.display='none'; _resetTatForm();
  renderTatamiAdmin(evtId); toast('✓ Sesi disimpan','success');
}
function deleteTatSession(id,evtId){showConfirm('Hapus Sesi','Hapus jadwal ini?',()=>{setTatami(getTatami().filter(s=>s.id!==id));renderTatamiAdmin(evtId);toast('Sesi dihapus','error');});}
function exportTatamiCSV(evtId){
  const e=getEvents().find(x=>x.id===evtId);
  const ss=getTatami().filter(s=>s.eventId===evtId).sort((a,b)=>a.date.localeCompare(b.date)||a.tatami-b.tatami||a.timeStart.localeCompare(b.timeStart));
  downloadCSV([['Tanggal','Tatami','Jam Mulai','Jam Selesai','Kategori','Wasit','Catatan'],...ss.map(s=>[fmtFull(s.date),'Tatami '+s.tatami,s.timeStart,s.timeEnd||'',s.category,s.referee||'',s.notes||''])],`jadwal_tatami_${e?.name||evtId}.csv`);
  toast('✓ Jadwal diekspor','success');
}

/* ── PUBLIC VIEW ────────────────────────────────────── */
function openTatamiView(evtId){
  const e=getEvents().find(x=>x.id===evtId); if(!e) return;
  document.getElementById('tat-view-event-name').textContent=e.name;
  document.getElementById('tat-view-evt-id').value=evtId;
  _buildDateOpts('tat-view-date',e.dateStart,e.dateEnd,true);
  renderTatamiView(evtId);
  openModal('modal-tatami-view');
}
function renderTatamiView(evtId){
  const fd=document.getElementById('tat-view-date')?.value||'';
  const ft=document.getElementById('tat-view-tatami')?.value||'';
  let ss=getTatami().filter(s=>s.eventId===evtId);
  if(fd) ss=ss.filter(s=>s.date===fd);
  if(ft) ss=ss.filter(s=>String(s.tatami)===ft);
  ss.sort((a,b)=>a.date.localeCompare(b.date)||a.tatami-b.tatami||a.timeStart.localeCompare(b.timeStart));
  const c=document.getElementById('tat-view-content');
  if(!ss.length){c.innerHTML=`<div class="tat-empty"><div style="font-size:40px;margin-bottom:8px">📋</div><p>Belum ada jadwal tersedia.</p></div>`;return;}
  if(fd) _renderTatGrid(ss,fd,c); else _renderTatDayList(ss,c);
}
function _renderTatGrid(ss,date,c){
  const tats=[...new Set(ss.map(s=>s.tatami))].sort((a,b)=>a-b);
  c.innerHTML=`<div class="tat-grid-date-label">📅 ${fmtFull(date)}</div>
    <div class="tat-grid-wrap"><div class="tat-grid" style="grid-template-columns:repeat(${tats.length},minmax(170px,1fr))">
    ${tats.map(t=>{
      const ts=ss.filter(s=>s.tatami===t).sort((a,b)=>a.timeStart.localeCompare(b.timeStart));
      return `<div class="tat-col"><div class="tat-col-header">Tatami ${t}</div>
        ${ts.map(s=>`<div class="tat-cell"><div class="tat-cell-time">${s.timeStart}${s.timeEnd?' – '+s.timeEnd:''}</div><div class="tat-cell-cat">${s.category}</div>${s.referee?`<div class="tat-cell-ref">👤 ${s.referee}</div>`:''}${s.notes?`<div class="tat-cell-notes">📝 ${s.notes}</div>`:''}</div>`).join('')}
      </div>`;
    }).join('')}
    </div></div>`;
}
function _renderTatDayList(ss,c){
  const byDate={};ss.forEach(s=>{(byDate[s.date]=byDate[s.date]||[]).push(s);});
  c.innerHTML=Object.entries(byDate).map(([date,rows])=>{
    const tats=[...new Set(rows.map(s=>s.tatami))].sort((a,b)=>a-b);
    return `<div class="tat-day-section"><div class="tat-date-header">📅 ${fmtFull(date)}</div>
      <div class="tat-grid-wrap"><div class="tat-grid" style="grid-template-columns:repeat(${tats.length},minmax(160px,1fr))">
      ${tats.map(t=>{
        const ts=rows.filter(s=>s.tatami===t).sort((a,b)=>a.timeStart.localeCompare(b.timeStart));
        return `<div class="tat-col"><div class="tat-col-header">Tatami ${t}</div>
          ${ts.map(s=>`<div class="tat-cell"><div class="tat-cell-time">${s.timeStart}${s.timeEnd?' – '+s.timeEnd:''}</div><div class="tat-cell-cat">${s.category}</div>${s.referee?`<div class="tat-cell-ref">👤 ${s.referee}</div>`:''}</div>`).join('')}
        </div>`;
      }).join('')}
      </div></div></div>`;
  }).join('');
}

/* ── ADMIN TAB: ALL EVENTS ──────────────────────────── */
function renderAdminTatamiTab(){
  const evts=getEvents().filter(e=>e.published);
  const ss=getTatami(); const c=document.getElementById('admin-tatami-list'); if(!c) return;
  if(!evts.length){c.innerHTML=`<div class="empty-state"><div class="empty-icon">📋</div><h3>Belum ada event</h3></div>`;return;}
  c.innerHTML=evts.map(e=>{
    const cnt=ss.filter(s=>s.eventId===e.id).length;
    const dates=[...new Set(ss.filter(s=>s.eventId===e.id).map(s=>s.date))].sort();
    return `<div class="tat-event-row">
      <div class="tat-event-info">
        <div class="tat-event-name">${e.name}</div>
        <div class="tat-event-meta">📅 ${fmt(e.dateStart)} – ${fmt(e.dateEnd)} &nbsp;|&nbsp; 📋 ${cnt} sesi${dates.length?' &nbsp;|&nbsp; Hari: '+dates.map(d=>fmt(d)).join(', '):''}
        </div>
      </div>
      <button class="btn-sm btn-edit" onclick="openTatamiAdmin('${e.id}')">✏️ Kelola Jadwal</button>
    </div>`;
  }).join('');
}
