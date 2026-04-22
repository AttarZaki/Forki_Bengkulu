'use strict';

let _editAnnId=null;

/* ── ADMIN TAB ──────────────────────────────────────── */
function renderAdminAnnouncements(){
  const evts=getEvents(); const anns=getAnnouncements();
  const fEvt=document.getElementById('ann-filter-evt')?.value||'';
  const sel=document.getElementById('ann-filter-evt');
  if(sel&&sel.options.length<=1) evts.forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=e.name;sel.appendChild(o);});
  let filtered=fEvt?anns.filter(a=>a.eventId===fEvt):anns;
  filtered=[...filtered].sort((a,b)=>b.createdAt-a.createdAt);
  const em={};evts.forEach(e=>{em[e.id]=e;});
  const c=document.getElementById('admin-ann-list'); if(!c) return;
  if(!filtered.length){c.innerHTML=`<div class="empty-state"><div class="empty-icon">📢</div><h3>Belum Ada Pengumuman</h3><p>Klik + Tambah untuk menambahkan pengumuman.</p></div>`;return;}
  c.innerHTML=filtered.map(a=>`
    <div class="ann-admin-row">
      <div class="ann-admin-tag-col">
        <span class="ann-tag ann-${a.type}">${a.type==='info'?'ℹ️ Info':a.type==='warning'?'⚠️ Peringatan':a.type==='success'?'✅ Sukses':'❌ Penting'}</span>
      </div>
      <div class="ann-admin-body">
        <div class="ann-admin-event">${em[a.eventId]?.name||'—'}</div>
        <div class="ann-admin-title">${a.title}</div>
        <div class="ann-admin-text">${a.body}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${timeAgo(a.createdAt)}</div>
      </div>
      <div class="ann-admin-actions">
        <button class="btn-sm ${a.published?'btn-draft':'btn-publish'}" onclick="toggleAnnPub('${a.id}')">${a.published?'Sembunyikan':'Tampilkan'}</button>
        <button class="btn-sm btn-edit" onclick="editAnn('${a.id}')">Edit</button>
        <button class="btn-sm btn-del"  onclick="deleteAnn('${a.id}')">Hapus</button>
      </div>
    </div>`).join('');
}

/* ── FORM ────────────────────────────────────────────── */
function openAnnForm(){
  _editAnnId=null; _resetAnnForm();
  document.getElementById('ann-form-title').textContent='+ Tambah Pengumuman';
  document.getElementById('ann-form-area').style.display='block';
  document.getElementById('ann-form-area').scrollIntoView({behavior:'smooth'});
}
function editAnn(id){
  const a=getAnnouncements().find(x=>x.id===id); if(!a) return;
  _editAnnId=id;
  document.getElementById('ann-form-title').textContent='Edit Pengumuman';
  document.getElementById('ann-f-evt').value=a.eventId;
  document.getElementById('ann-f-type').value=a.type;
  document.getElementById('ann-f-title').value=a.title;
  document.getElementById('ann-f-body').value=a.body;
  document.getElementById('ann-form-area').style.display='block';
  document.getElementById('ann-form-area').scrollIntoView({behavior:'smooth'});
  // Populate event select if needed
  _populateAnnEvtSel();
}
function cancelAnnForm(){document.getElementById('ann-form-area').style.display='none';_editAnnId=null;}
function _resetAnnForm(){['ann-f-evt','ann-f-type','ann-f-title','ann-f-body'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});}

function _populateAnnEvtSel(){
  const sel=document.getElementById('ann-f-evt'); if(!sel) return;
  if(sel.options.length>1) return;
  getEvents().filter(e=>e.published).forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=e.name;sel.appendChild(o);});
}

function saveAnn(){
  const evtId=document.getElementById('ann-f-evt').value;
  const type=document.getElementById('ann-f-type').value;
  const title=document.getElementById('ann-f-title').value.trim();
  const body=document.getElementById('ann-f-body').value.trim();
  if(!evtId||!title||!body){toast('Harap isi semua field','error');return;}
  const anns=getAnnouncements();
  const obj={eventId:evtId,type:type||'info',title,body,published:true,createdAt:Date.now()};
  if(_editAnnId){const i=anns.findIndex(a=>a.id===_editAnnId);if(i!==-1)anns[i]={...anns[i],...obj};}
  else anns.unshift({id:'ann-'+Date.now(),...obj});
  setAnnouncements(anns); cancelAnnForm(); renderAdminAnnouncements();
  toast('✓ Pengumuman disimpan','success');
}
function deleteAnn(id){showConfirm('Hapus Pengumuman','Hapus pengumuman ini?',()=>{setAnnouncements(getAnnouncements().filter(a=>a.id!==id));renderAdminAnnouncements();toast('Pengumuman dihapus','error');});}
function toggleAnnPub(id){const anns=getAnnouncements();const a=anns.find(x=>x.id===id);if(a){a.published=!a.published;setAnnouncements(anns);renderAdminAnnouncements();toast(a.published?'Pengumuman ditampilkan':'Pengumuman disembunyikan','success');}}
