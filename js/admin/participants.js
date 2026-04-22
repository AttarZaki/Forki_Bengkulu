'use strict';

function populatePartFilter(){
  const sel=document.getElementById('part-event-filter'); if(!sel) return;
  sel.innerHTML=`<option value="">— Semua Event —</option>`+getEvents().map(e=>`<option value="${e.id}">🥋 ${e.name}</option>`).join('');
}
function setPartFilter(id){const sel=document.getElementById('part-event-filter');if(sel){sel.value=id;renderParticipants();}}

function renderParticipants(){
  const fEvt=document.getElementById('part-event-filter')?.value||'';
  const fStatus=document.getElementById('part-status-filter')?.value||'';
  const q=(document.getElementById('part-search')?.value||'').toLowerCase();
  let regs=[...getRegs()];
  if(fEvt)   regs=regs.filter(r=>r.eventId===fEvt);
  if(fStatus) regs=regs.filter(r=>(r.status||'approved')===fStatus);
  else regs=regs.filter(r=>r.status!=='cancelled');
  if(q)      regs=regs.filter(r=>r.name.toLowerCase().includes(q)||r.email.toLowerCase().includes(q)||(r.dojo||'').toLowerCase().includes(q));
  regs.sort((a,b)=>b.createdAt-a.createdAt);

  const em={};getEvents().forEach(e=>{em[e.id]=e;});
  const pm={};getPayments().forEach(p=>{pm[p.regId]=p;});
  const ci={};getCheckins().forEach(c=>{ci[c.regId]=c;});

  const summEl=document.getElementById('parts-summary');
  if(summEl){
    const catC={};regs.forEach(r=>{catC[r.category]=(catC[r.category]||0)+1;});
    summEl.innerHTML=`<div class="parts-summary-bar"><span><strong>${regs.length}</strong> peserta</span>${Object.entries(catC).slice(0,4).map(([c,n])=>`<span class="summ-pill">${c.length>20?c.substring(0,20)+'…':c}: <strong>${n}</strong></span>`).join('')}</div>`;
  }

  const tbody=document.getElementById('parts-tbody');
  const emptyEl=document.getElementById('parts-empty');
  if(!regs.length){if(tbody)tbody.innerHTML='';if(emptyEl)emptyEl.style.display='block';return;}
  if(emptyEl)emptyEl.style.display='none';

  tbody.innerHTML=regs.map((r,i)=>{
    const pay=pm[r.id]; const checkedIn=ci[r.id];
    const regNum=typeof getRegNumber==='function'?getRegNumber(r.id,r.eventId):null;
    return `<tr class="${r.status==='pending'?'row-pending':''}">
      <td>${i+1}</td>
      <td>${regNum?`<span class="reg-number-badge">#${regNum}</span>`:'—'}</td>
      <td><strong>${r.name}</strong></td>
      <td>${r.email}</td>
      <td>${r.phone}</td>
      <td>${r.dojo||'—'}</td>
      <td><span class="cat-badge-sm">${r.category}</span></td>
      <td>${r.belt||'—'}</td>
      <td>${r.age}</td>
      <td>${r.regency||'—'}</td>
      <td><span style="font-size:11px">${(em[r.eventId]?.name||'—').substring(0,22)}…</span></td>
      <td>${approvalBadge(r.status)}</td>
      <td>${pay?payBadge(pay.status):'<span style="font-size:11px;color:var(--text-light)">Belum</span>'}</td>
      <td>${checkedIn?`<span style="font-size:11px;font-weight:700;color:#15803d">✓ Check-in</span>`:`<button class="btn-sm btn-green" onclick="doCheckin('${r.id}')">Check-in</button>`}</td>
      <td><span style="font-size:11px;color:var(--text-muted)">${timeAgo(r.createdAt)}</span></td>
      <td><div class="action-btns">
        ${r.status==='pending'?`<button class="btn-sm btn-green" onclick="approveReg('${r.id}')">✓</button><button class="btn-sm btn-del" onclick="rejectReg('${r.id}')">✕</button>`:''}
        <button class="btn-sm btn-del" onclick="confirmDelReg('${r.id}')">Hapus</button>
      </div></td>
    </tr>`;
  }).join('');
}

function approveReg(id){
  const regs=getRegs(); const r=regs.find(x=>x.id===id);
  if(r){r.status='approved';setRegs(regs);renderParticipants();toast(`✓ ${r.name} diterima`,'success');}
}
function rejectReg(id){
  const regs=getRegs(); const r=regs.find(x=>x.id===id);
  if(r){r.status='rejected';setRegs(regs);renderParticipants();toast(`${r.name} ditolak`,'error');}
}
function doCheckin(regId){
  const ci=getCheckins();
  if(ci.find(c=>c.regId===regId)){toast('Sudah check-in sebelumnya','error');return;}
  ci.push({id:'ci-'+Date.now(),regId,checkedInAt:Date.now(),checkedInBy:'admin'});
  setCheckins(ci); renderParticipants(); toast('✓ Check-in berhasil','success');
}
function confirmDelReg(id){
  const r=getRegs().find(x=>x.id===id);
  showConfirm('Hapus Peserta',`Hapus data "${r?.name}"?`,()=>{setRegs(getRegs().filter(x=>x.id!==id));renderParticipants();toast('Peserta dihapus','error');});
}
