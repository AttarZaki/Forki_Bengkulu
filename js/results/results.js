'use strict';

let _editResId=null;

/* ── OPEN RESULTS MODAL ─────────────────────────────── */
function openResultsModal(evtId) {
  const e=getEvents().find(x=>x.id===evtId); if(!e) return;
  document.getElementById('res-event-name').textContent=e.name;
  document.getElementById('res-event-id').value=evtId;
  renderResultsList(evtId);
  document.getElementById('res-form-area').style.display='none';
  _editResId=null;
  openModal('modal-results');
}

/* ── RENDER LIST ────────────────────────────────────── */
function renderResultsList(evtId) {
  const results=getResults().filter(r=>r.eventId===evtId);
  const isAdmin=currentRole==='admin';
  let html='';
  if(isAdmin) html+=`<button class="btn-primary" style="margin-bottom:16px" onclick="openResForm(null,'${evtId}')">＋ Tambah Hasil</button>`;
  if(!results.length){
    html+=`<div style="text-align:center;padding:24px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">🏅</div><p>${isAdmin?'Belum ada hasil. Tambahkan di atas.':'Belum ada hasil dipublikasikan.'}</p></div>`;
  } else {
    html+=results.map(r=>buildResultCard(r,isAdmin,evtId)).join('');
  }
  document.getElementById('res-list').innerHTML=html;
}

function buildResultCard(r,isAdmin,evtId) {
  return `<div class="result-card">
    <div class="result-cat-header">
      <span>${r.category}</span>
      ${isAdmin?`<div style="display:flex;gap:6px">
        <button class="btn-sm btn-edit" onclick="openResForm('${r.id}','${evtId}')">Edit</button>
        <button class="btn-sm btn-del" onclick="deleteResult('${r.id}','${evtId}')">Hapus</button>
        <button class="btn-sm" style="background:#eff6ff;color:#1d4ed8" onclick="printCertificates('${r.id}')">🎖️ Sertifikat</button>
      </div>`:'<button class="btn-sm" style="background:#eff6ff;color:#1d4ed8" onclick="printCertificates(\''+r.id+'\')">🎖️ Sertifikat</button>'}
    </div>
    <div class="result-podium">
      <div class="podium-item gold"><span class="podium-medal">🥇</span><div><div class="podium-name">${r.gold?.name||'—'}</div><div class="podium-dojo">${r.gold?.dojo||''}</div></div></div>
      <div class="podium-item silver"><span class="podium-medal">🥈</span><div><div class="podium-name">${r.silver?.name||'—'}</div><div class="podium-dojo">${r.silver?.dojo||''}</div></div></div>
      ${r.bronze1?`<div class="podium-item bronze"><span class="podium-medal">🥉</span><div><div class="podium-name">${r.bronze1.name}</div><div class="podium-dojo">${r.bronze1.dojo||''}</div></div></div>`:''}
      ${r.bronze2?`<div class="podium-item bronze"><span class="podium-medal">🥉</span><div><div class="podium-name">${r.bronze2.name}</div><div class="podium-dojo">${r.bronze2.dojo||''}</div></div></div>`:''}
    </div>
  </div>`;
}

/* ── RESULT FORM ────────────────────────────────────── */
function openResForm(resultId,evtId) {
  _editResId=resultId;
  document.getElementById('res-form-title').textContent=resultId?'Edit Hasil':'Tambah Hasil Kategori';
  if(resultId){
    const r=getResults().find(x=>x.id===resultId); if(!r) return;
    document.getElementById('rf-cat').value=r.category;
    document.getElementById('rf-gold').value=r.gold?.name||'';
    document.getElementById('rf-gold-d').value=r.gold?.dojo||'';
    document.getElementById('rf-sil').value=r.silver?.name||'';
    document.getElementById('rf-sil-d').value=r.silver?.dojo||'';
    document.getElementById('rf-b1').value=r.bronze1?.name||'';
    document.getElementById('rf-b1-d').value=r.bronze1?.dojo||'';
    document.getElementById('rf-b2').value=r.bronze2?.name||'';
    document.getElementById('rf-b2-d').value=r.bronze2?.dojo||'';
  } else {
    ['rf-cat','rf-gold','rf-gold-d','rf-sil','rf-sil-d','rf-b1','rf-b1-d','rf-b2','rf-b2-d'].forEach(id=>{document.getElementById(id).value='';});
  }
  document.getElementById('res-form-area').style.display='block';
  document.getElementById('res-form-area').scrollIntoView({behavior:'smooth'});
}
function closeResForm(){document.getElementById('res-form-area').style.display='none';_editResId=null;}
function saveResult(){
  const evtId=document.getElementById('res-event-id').value;
  const cat=document.getElementById('rf-cat').value.trim();
  const gn=document.getElementById('rf-gold').value.trim();
  const sn=document.getElementById('rf-sil').value.trim();
  if(!cat||!gn||!sn){toast('Kategori, Juara 1 dan 2 wajib diisi','error');return;}
  const g=id=>document.getElementById(id)?.value.trim()||'';
  const obj={evtId,eventId:evtId,category:cat,
    gold:{name:gn,dojo:g('rf-gold-d')},
    silver:{name:sn,dojo:g('rf-sil-d')},
    bronze1:g('rf-b1')?{name:g('rf-b1'),dojo:g('rf-b1-d')}:null,
    bronze2:g('rf-b2')?{name:g('rf-b2'),dojo:g('rf-b2-d')}:null,
    published:true,createdAt:Date.now()};
  const results=getResults();
  if(_editResId){const i=results.findIndex(r=>r.id===_editResId);if(i!==-1)results[i]={...results[i],...obj};}
  else results.unshift({id:'res-'+Date.now(),...obj});
  setResults(results);
  closeResForm(); renderResultsList(evtId);
  toast('✓ Hasil disimpan','success');
}
function deleteResult(id,evtId){
  showConfirm('Hapus Hasil','Hapus data hasil ini?',()=>{
    setResults(getResults().filter(r=>r.id!==id));
    renderResultsList(evtId); toast('Hasil dihapus','error');
  });
}

/* ── DIGITAL CERTIFICATE ────────────────────────────── */
function printCertificates(resultId) {
  const r=getResults().find(x=>x.id===resultId); if(!r) return;
  const evtId=r.evtId||r.eventId;
  const evt=getEvents().find(e=>e.id===evtId);
  const winners=[
    r.gold    ? {name:r.gold.name,    dojo:r.gold.dojo||'',    rank:'JUARA 1',    medal:'🥇',color:'#f59e0b'} : null,
    r.silver  ? {name:r.silver.name,  dojo:r.silver.dojo||'',  rank:'JUARA 2',    medal:'🥈',color:'#94a3b8'} : null,
    r.bronze1 ? {name:r.bronze1.name, dojo:r.bronze1.dojo||'', rank:'JUARA 3',    medal:'🥉',color:'#c2410c'} : null,
    r.bronze2 ? {name:r.bronze2.name, dojo:r.bronze2.dojo||'', rank:'JUARA 3',    medal:'🥉',color:'#c2410c'} : null,
  ].filter(Boolean);

  const certHTML=winners.map(w=>`
    <div class="cert-page">
      <div class="cert-border">
        <div class="cert-header">
          <div class="cert-logo">🥋</div>
          <div class="cert-org">FORKI PROVINSI BENGKULU</div>
          <div class="cert-title">SERTIFIKAT PENGHARGAAN</div>
        </div>
        <div class="cert-body">
          <p class="cert-presents">Dengan bangga memberikan penghargaan kepada</p>
          <div class="cert-medal">${w.medal}</div>
          <div class="cert-name">${w.name}</div>
          <div class="cert-dojo">${w.dojo}</div>
          <div class="cert-rank" style="color:${w.color}">${w.rank}</div>
          <div class="cert-category">Kategori: ${r.category}</div>
          <div class="cert-event">${evt?.name||'—'}</div>
          <div class="cert-date">${fmtFull(evt?.dateStart||'')} – ${fmtFull(evt?.dateEnd||'')}</div>
          <div class="cert-location">${evt?.location||'—'}</div>
        </div>
        <div class="cert-footer">
          <div class="cert-sign">
            <div class="cert-sign-line"></div>
            <div class="cert-sign-title">Ketua Umum FORKI Bengkulu</div>
          </div>
        </div>
      </div>
    </div>`).join('');

  const win=window.open('','_blank','width=900,height=700');
  win.document.write(`<!DOCTYPE html><html><head><title>Sertifikat - ${r.category}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Georgia',serif;background:#f5f5f5;}
    .cert-page{width:210mm;min-height:148mm;margin:20px auto;background:#fff;page-break-after:always;}
    .cert-border{border:8px double #1e3a5f;margin:16px;padding:24px;height:calc(100%-32px);}
    .cert-header{text-align:center;border-bottom:2px solid #1e3a5f;padding-bottom:14px;margin-bottom:18px;}
    .cert-logo{font-size:42px;margin-bottom:4px;}
    .cert-org{font-size:13px;font-weight:bold;color:#1e3a5f;letter-spacing:2px;text-transform:uppercase;}
    .cert-title{font-size:22px;font-weight:bold;color:#1e3a5f;margin-top:6px;letter-spacing:3px;}
    .cert-body{text-align:center;}
    .cert-presents{font-size:13px;color:#555;font-style:italic;margin-bottom:10px;}
    .cert-medal{font-size:48px;margin-bottom:6px;}
    .cert-name{font-size:26px;font-weight:bold;color:#1e3a5f;border-bottom:2px solid #e8a020;padding-bottom:4px;display:inline-block;margin-bottom:4px;}
    .cert-dojo{font-size:13px;color:#666;margin-bottom:10px;}
    .cert-rank{font-size:20px;font-weight:bold;letter-spacing:2px;margin-bottom:8px;}
    .cert-category{font-size:14px;font-weight:bold;color:#333;margin-bottom:4px;}
    .cert-event{font-size:13px;color:#1e3a5f;font-weight:bold;margin-bottom:4px;}
    .cert-date,.cert-location{font-size:12px;color:#666;margin-bottom:2px;}
    .cert-footer{margin-top:20px;text-align:right;}
    .cert-sign-line{border-top:1px solid #333;width:160px;margin-left:auto;margin-bottom:4px;}
    .cert-sign-title{font-size:11px;color:#555;}
    @media print{.cert-page{margin:0;box-shadow:none;}.cert-page+.cert-page{margin-top:0;}}
  </style></head><body>${certHTML}
  <script>window.onload=()=>{window.print();}<\/script>
  </body></html>`);
  win.document.close();
}
