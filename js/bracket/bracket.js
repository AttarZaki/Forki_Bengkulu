'use strict';

let _editBktId=null;

/* ── OPEN (ADMIN) ────────────────────────────────────── */
function openBracketAdmin(evtId) {
  _setupBktModal(evtId);
  openModal('modal-bracket');
}
/* ── OPEN (USER/PUBLIC) ─────────────────────────────── */
function openBracketView(evtId) { _setupBktModal(evtId); openModal('modal-bracket'); }

function _setupBktModal(evtId) {
  const e=getEvents().find(x=>x.id===evtId); if(!e) return;
  document.getElementById('bkt-event-name').textContent=e.name;
  document.getElementById('bkt-event-id').value=evtId;
  _populateBktCats(evtId);
  document.getElementById('bkt-content').innerHTML=`<div class="bkt-placeholder"><div style="font-size:48px">🏆</div><p>Pilih kategori untuk melihat bagan</p></div>`;
}
function _populateBktCats(evtId) {
  const regs=getRegs().filter(r=>r.eventId===evtId&&r.status!=='rejected');
  const bkts=getBrackets().filter(b=>b.eventId===evtId);
  const cats=[...new Set(regs.map(r=>r.category))].filter(Boolean);
  document.getElementById('bkt-cat-sel').innerHTML=`<option value="">— Pilih Kategori —</option>`
    +cats.map(c=>`<option value="${c}">${c}${bkts.some(b=>b.category===c)?' ✓':''}</option>`).join('');
}
function loadBktForCat() {
  const evtId=document.getElementById('bkt-event-id').value;
  const cat=document.getElementById('bkt-cat-sel').value;
  if(!cat) return;
  const bkt=getBrackets().find(b=>b.eventId===evtId&&b.category===cat);
  const regs=getRegs().filter(r=>r.eventId===evtId&&r.category===cat&&r.status!=='rejected');
  if(bkt) renderBkt(bkt);
  else if(currentRole==='admin') renderBktCreator(evtId,cat,regs);
  else document.getElementById('bkt-content').innerHTML=`<div class="bkt-placeholder"><div style="font-size:40px">📋</div><p>Bagan untuk <strong>${cat}</strong> belum tersedia.</p><p style="font-size:13px;color:var(--text-muted)">${regs.length} peserta terdaftar</p></div>`;
}

/* ── CREATOR ─────────────────────────────────────────── */
function renderBktCreator(evtId,cat,regs) {
  document.getElementById('bkt-content').innerHTML=`
    <div class="bkt-creator">
      <h3 class="bkt-creator-title">Buat Bagan: <em>${cat}</em></h3>
      <p class="bkt-creator-sub">${regs.length} peserta terdaftar di kategori ini</p>
      <div style="margin-bottom:14px">
        <button class="btn-sm btn-edit" onclick="openSeedingModal('${evtId}','${cat.replace(/'/g,"\\'")}')">🎯 Atur Seeding / Unggulan</button>
      </div>
      <div class="bkt-mode-cards">
        <div class="bkt-mode-card" onclick="renderAutoMode('${evtId}','${cat}')">
          <div class="bkt-mode-icon">⚡</div>
          <div class="bkt-mode-name">Otomatis</div>
          <div class="bkt-mode-desc">Sistem acak & isi bracket dari peserta terdaftar (${regs.length} orang). Seeding akan diterapkan jika ada.</div>
        </div>
        <div class="bkt-mode-card" onclick="renderManualMode('${evtId}','${cat}')">
          <div class="bkt-mode-icon">✏️</div>
          <div class="bkt-mode-name">Manual</div>
          <div class="bkt-mode-desc">Admin isi sendiri setiap slot nama peserta & dojo. Bebas atur.</div>
        </div>
      </div>
    </div>`;
}

/* ── AUTO MODE ──────────────────────────────────────── */
function renderAutoMode(evtId,cat) {
  const regs=getRegs().filter(r=>r.eventId===evtId&&r.category===cat&&r.status!=='rejected');
  if(regs.length<2){toast('Minimal 2 peserta','error');return;}
  const sizes=[2,4,8,16].filter(s=>s>=regs.length);
  document.getElementById('bkt-content').innerHTML=`
    <div class="bkt-creator">
      <button class="btn-back-sm" onclick="loadBktForCat()">← Kembali</button>
      <h3 class="bkt-creator-title" style="margin-top:12px">⚡ Mode Otomatis</h3>
      <p class="bkt-creator-sub">${regs.length} peserta akan diacak secara otomatis.</p>
      <div class="form-group" style="max-width:220px;margin-bottom:16px">
        <label>Ukuran Bracket</label>
        <select id="auto-size" class="form-select">
          ${[2,4,8,16].map(s=>`<option value="${s}" ${sizes[0]===s?'selected':''}>${s} slot (${Math.max(0,s-regs.length)} BYE)</option>`).join('')}
        </select>
      </div>
      <div class="bkt-preview">
        <div class="bkt-preview-title">Peserta (akan diacak):</div>
        ${regs.map((r,i)=>`<div class="bkt-preview-row"><span class="bkt-slot-num">${i+1}</span><span>${r.name}</span><span class="bkt-preview-dojo">${r.dojo||'—'}</span></div>`).join('')}
      </div>
      <button class="btn-primary" style="margin-top:16px" onclick="genAutoBkt('${evtId}','${cat}')">⚡ Generate Bagan</button>
    </div>`;
}
function genAutoBkt(evtId,cat) {
  const regs=getRegs().filter(r=>r.eventId===evtId&&r.category===cat&&r.status!=='rejected');
  const size=parseInt(document.getElementById('auto-size')?.value||'4');
  if(size<regs.length){toast(`Ukuran terlalu kecil (min ${regs.length})`, 'error');return;}

  // Map to participant objects first
  let parts=[...regs].map(r=>({name:r.name,dojo:r.dojo||'—',regId:r.id}));

  // Apply seeding if available
  if (typeof applySeeding === 'function') {
    parts = applySeeding(evtId, cat, parts);
  } else {
    parts = parts.sort(()=>Math.random()-.5);
  }

  // Pad with BYEs to reach target size
  while(parts.length<size) parts.push(null);

  const bkt=_buildBktStruct(evtId,cat,parts,'auto');
  _saveBkt(bkt); _populateBktCats(evtId);
  toast('✓ Bagan berhasil dibuat!','success'); renderBkt(bkt);
}

/* ── MANUAL MODE ────────────────────────────────────── */
function renderManualMode(evtId,cat) {
  const regs=getRegs().filter(r=>r.eventId===evtId&&r.category===cat&&r.status!=='rejected');
  document.getElementById('bkt-content').innerHTML=`
    <div class="bkt-creator">
      <button class="btn-back-sm" onclick="loadBktForCat()">← Kembali</button>
      <h3 class="bkt-creator-title" style="margin-top:12px">✏️ Mode Manual</h3>
      <div class="form-group" style="max-width:200px;margin-bottom:14px">
        <label>Jumlah Slot</label>
        <select id="manual-size" class="form-select" onchange="renderManualSlots('${evtId}','${cat}')">
          ${[2,4,8,16].map(s=>`<option value="${s}">${s} peserta</option>`).join('')}
        </select>
      </div>
      <div id="manual-slots"></div>
      <button class="btn-primary" style="margin-top:14px" onclick="genManualBkt('${evtId}','${cat}')">✏️ Buat Bagan</button>
    </div>`;
  renderManualSlots(evtId,cat);
}
function renderManualSlots(evtId,cat) {
  const size=parseInt(document.getElementById('manual-size')?.value||'4');
  const regs=getRegs().filter(r=>r.eventId===evtId&&r.category===cat&&r.status!=='rejected');
  let html=`<div class="manual-slots">`;
  for(let i=0;i<size;i++){
    const ref=regs[i];
    html+=`<div class="manual-slot-row">
      <span class="bkt-slot-num">${i+1}</span>
      <input type="text" class="manual-name" id="ms-name-${i}" placeholder="Nama peserta" value="${ref?ref.name:''}"/>
      <input type="text" class="manual-dojo" id="ms-dojo-${i}" placeholder="Dojo / Klub"   value="${ref?ref.dojo||'':''}"/>
    </div>`;
  }
  html+=`</div>${regs.length?'<p style="font-size:12px;color:var(--text-muted);margin-top:8px">💡 Nama peserta terdaftar diisi otomatis. Anda bisa mengubahnya.</p>':''}`;
  document.getElementById('manual-slots').innerHTML=html;
}
function genManualBkt(evtId,cat) {
  const size=parseInt(document.getElementById('manual-size')?.value||'4');
  const parts=[]; let has=false;
  for(let i=0;i<size;i++){
    const n=document.getElementById(`ms-name-${i}`)?.value.trim()||'';
    const d=document.getElementById(`ms-dojo-${i}`)?.value.trim()||'—';
    if(n){parts.push({name:n,dojo:d,regId:null});has=true;} else parts.push(null);
  }
  if(!has||parts.filter(Boolean).length<2){toast('Minimal 2 peserta','error');return;}
  const bkt=_buildBktStruct(evtId,cat,parts,'manual');
  _saveBkt(bkt); _populateBktCats(evtId);
  toast('✓ Bagan manual dibuat!','success'); renderBkt(bkt);
}

/* ── BUILD STRUCTURE ────────────────────────────────── */
function _buildBktStruct(evtId,cat,parts,mode) {
  const rounds=[]; let slots=[...parts]; let rn=1;
  while(slots.length>1){
    const matches=[];
    for(let i=0;i<slots.length;i+=2){
      const p1=slots[i],p2=slots[i+1];
      const auto=(p1&&!p2)?'p1':(!p1&&p2)?'p2':null;
      matches.push({id:`m${rn}-${i/2}`,p1,p2,winner:auto});
    }
    rounds.push({round:rn,label:_roundLabel(rn,Math.log2(parts.length)),matches});
    slots=matches.map(m=>m.winner==='p1'?m.p1:m.winner==='p2'?m.p2:null);
    rn++;
  }
  return {id:'bkt-'+Date.now(),evtId,category:cat,mode,rounds,finalized:false,createdAt:Date.now()};
}
function _roundLabel(n,total){
  const fe=total-n;
  if(fe===0)return 'FINAL';if(fe===1)return 'SEMIFINAL';if(fe===2)return 'PEREMPAT FINAL';return `BABAK ${n}`;
}
function _saveBkt(bkt){
  const all=getBrackets().filter(b=>!(b.evtId===bkt.evtId&&b.category===bkt.category));
  setBrackets([...all,bkt]);
}

/* ── RENDER BRACKET ─────────────────────────────────── */
function renderBkt(bkt) {
  const isAdmin=currentRole==='admin';
  const total=bkt.rounds.length;
  let html=`
    <div class="bkt-info-bar">
      <span class="bkt-cat-tag">${bkt.category}</span>
      ${bkt.finalized?'<span class="bkt-state-tag bkt-done">✓ Selesai</span>':'<span class="bkt-state-tag bkt-live">🔴 Live</span>'}
      <span class="bkt-mode-tag-sm">${bkt.mode==='manual'?'✏️ Manual':'⚡ Otomatis'}</span>
      ${isAdmin?`<div style="margin-left:auto;display:flex;gap:6px">
        ${!bkt.finalized?`<button class="btn-sm btn-green" onclick="finalizeBkt('${bkt.id}')">✓ Finalisasi</button>`:''}
        <button class="btn-sm btn-edit" onclick="resetBkt('${bkt.id}','${bkt.evtId}','${bkt.category}')">🔄 Reset</button>
        <button class="btn-sm btn-del" onclick="deleteBkt('${bkt.id}','${bkt.evtId}')">Hapus</button>
        <button class="btn-sm" style="background:#f0fdf4;color:#15803d" onclick="printBkt('${bkt.id}')">🖨️ Cetak</button>
      </div>`:''}
    </div>
    ${isAdmin&&!bkt.finalized?'<p class="bkt-hint">💡 Klik nama peserta untuk menentukan pemenang</p>':''}
    <div class="bracket-tree" id="bkt-tree-${bkt.id}">`;

  bkt.rounds.forEach((round,ri)=>{
    html+=`<div class="bracket-round"><div class="bracket-round-label">${round.label||_roundLabel(ri+1,total)}</div><div class="bracket-matches">`;
    round.matches.forEach(m=>{
      const p1=m.p1,p2=m.p2,w=m.winner;
      const canClick=isAdmin&&!bkt.finalized&&p1&&p2;
      html+=`<div class="bracket-match ${(p1&&!p2)||(!p1&&p2)?'match-bye':''}">
        <div class="match-player ${w?w==='p1'?'match-win':'match-lose':''}" ${canClick?`onclick="setBktWinner('${bkt.id}',${round.round},'${m.id}','p1')"`:''}>
          ${p1?`<div class="mp-info"><span class="mp-name">${p1.name}</span><span class="mp-dojo">${p1.dojo}</span></div>`:'<span class="mp-bye">— BYE —</span>'}
          ${w==='p1'?'<span class="mp-crown">👑</span>':''}
        </div>
        <div class="match-vs">VS</div>
        <div class="match-player ${w?w==='p2'?'match-win':'match-lose':''}" ${canClick?`onclick="setBktWinner('${bkt.id}',${round.round},'${m.id}','p2')"`:''}>
          ${p2?`<div class="mp-info"><span class="mp-name">${p2.name}</span><span class="mp-dojo">${p2.dojo}</span></div>`:'<span class="mp-bye">— BYE —</span>'}
          ${w==='p2'?'<span class="mp-crown">👑</span>':''}
        </div>
      </div>`;
    });
    html+=`</div></div>`;
  });

  html+=`</div>`;

  // Champion
  const fm=bkt.rounds[bkt.rounds.length-1]?.matches[0];
  const champ=fm?.winner?(fm.winner==='p1'?fm.p1:fm.p2):null;
  if(champ) html+=`<div class="bkt-champion"><div class="champ-crown">👑</div><div class="champ-label">JUARA 1</div><div class="champ-name">${champ.name}</div><div class="champ-dojo">${champ.dojo}</div></div>`;

  document.getElementById('bkt-content').innerHTML=html;
}

/* ── SET WINNER ─────────────────────────────────────── */
function setBktWinner(bktId,roundNum,matchId,winner) {
  const bkts=getBrackets(); const bkt=bkts.find(b=>b.id===bktId); if(!bkt) return;
  const round=bkt.rounds.find(r=>r.round===parseInt(roundNum));
  const match=round?.matches.find(m=>m.id===matchId); if(!match) return;
  const winObj=winner==='p1'?match.p1:match.p2;
  match.winner=winner;
  const nxt=bkt.rounds.find(r=>r.round===parseInt(roundNum)+1);
  if(nxt){
    const mi=round.matches.indexOf(match);
    const nm=nxt.matches[Math.floor(mi/2)];
    if(nm){
      if(mi%2===0)nm.p1=winObj; else nm.p2=winObj;
      nm.winner=(nm.p1&&!nm.p2)?'p1':(!nm.p1&&nm.p2)?'p2':null;
    }
  }
  setBrackets(bkts); renderBkt(bkt); toast('✓ Pemenang dicatat','success');
}

function finalizeBkt(id){ const bkts=getBrackets(); const b=bkts.find(x=>x.id===id); if(b){b.finalized=true;setBrackets(bkts);renderBkt(b);} toast('✓ Bagan difinalisasi','success'); }
function resetBkt(id,evtId,cat){ showConfirm('Reset Bagan',`Reset bagan "${cat}"? Semua hasil dihapus.`,()=>{setBrackets(getBrackets().filter(b=>b.id!==id));_populateBktCats(evtId);loadBktForCat();toast('Bagan direset','error');}); }
function deleteBkt(id,evtId){ showConfirm('Hapus Bagan','Hapus bagan ini?',()=>{setBrackets(getBrackets().filter(b=>b.id!==id));_populateBktCats(evtId);document.getElementById('bkt-content').innerHTML='<div class="bkt-placeholder"><div style="font-size:40px">🗑️</div><p>Bagan dihapus.</p></div>';toast('Bagan dihapus','error');}); }

/* ── PRINT BRACKET ──────────────────────────────────── */
function printBkt(bktId) {
  const bkt=getBrackets().find(b=>b.id===bktId); if(!bkt) return;
  const evtId=bkt.evtId||bkt.eventId;
  const evt=getEvents().find(e=>e.id===evtId);
  const treeEl=document.getElementById('bkt-tree-'+bktId);
  if(!treeEl) return;
  const win=window.open('','_blank','width=1100,height=700');
  win.document.write(`<!DOCTYPE html><html><head><title>Bagan - ${bkt.category}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:24px;background:#fff;}
    h2{margin:0 0 4px;font-size:20px;}p{margin:0 0 16px;color:#555;font-size:13px;}
    .bracket-tree{display:flex;gap:20px;overflow-x:auto;}
    .bracket-round{min-width:180px;}
    .bracket-round-label{font-size:10px;font-weight:bold;text-transform:uppercase;text-align:center;padding:6px 0;border-bottom:2px solid #ccc;margin-bottom:8px;color:#555;}
    .bracket-matches{display:flex;flex-direction:column;gap:12px;}
    .bracket-match{border:1.5px solid #ccc;border-radius:8px;overflow:hidden;}
    .match-player{padding:8px 10px;font-size:11px;border-bottom:1px solid #eee;}
    .match-player:last-child{border-bottom:none;}
    .mp-name{font-weight:bold;}
    .mp-dojo{font-size:10px;color:#888;}
    .match-vs{text-align:center;font-size:9px;color:#aaa;padding:2px;background:#f8f8f8;border-bottom:1px solid #eee;}
    .match-win{background:#f0fdf4;border-left:3px solid #16a34a;}
    .match-lose{opacity:.5;}
    .mp-bye{font-style:italic;color:#bbb;font-size:10px;}
  </style></head><body>
  <h2>Bagan Pertandingan</h2>
  <p>${evt?.name||''} &mdash; ${bkt.category}</p>
  ${treeEl.outerHTML}
  </body></html>`);
  win.document.close(); win.focus(); setTimeout(()=>{win.print();win.close();},500);
}
