'use strict';

/* ── USER: OPEN PAYMENT MODAL ───────────────────────── */
function openPaymentModal(regId, evtId) {
  const evt=getEvents().find(e=>e.id===evtId);
  const reg=getRegs().find(r=>r.id===regId);
  const pay=getPayments().find(p=>p.regId===regId);

  document.getElementById('pay-reg-name').textContent =reg?.name||'—';
  document.getElementById('pay-event-name').textContent=evt?.name||'—';
  document.getElementById('pay-amount').textContent    =evt?.fee||'Gratis';
  document.getElementById('pay-reg-id').value =regId;
  document.getElementById('pay-event-id').value=evtId;
  resetJpgInput('pay-bukti','pay-bukti-label','pay-bukti-err');

  const statusEl=document.getElementById('pay-status-box');
  const uploadEl=document.getElementById('pay-upload-section');
  if(pay){
    if(pay.status==='verified'){
      statusEl.innerHTML=`<div class="pay-status-notice verified">✅ Pembayaran Terverifikasi — Terima kasih!</div>`;
      uploadEl.style.display='none';
    } else if(pay.status==='rejected'){
      statusEl.innerHTML=`<div class="pay-status-notice rejected">❌ Pembayaran Ditolak — Silakan upload ulang bukti bayar</div>`;
      uploadEl.style.display='block';
    } else {
      statusEl.innerHTML=`<div class="pay-status-notice pending">⏳ Menunggu Verifikasi Admin</div>`;
      uploadEl.style.display='block';
    }
  } else { statusEl.innerHTML=''; uploadEl.style.display='block'; }

  openModal('modal-payment');
}

async function submitPaymentProof() {
  const regId=document.getElementById('pay-reg-id').value;
  const evtId=document.getElementById('pay-event-id').value;
  const evt=getEvents().find(e=>e.id===evtId);
  const file=document.getElementById('pay-bukti')?.files[0];

  const save=(url)=>{
    const pays=getPayments();
    const ex=pays.find(p=>p.regId===regId);
    const obj={regId,eventId:evtId,userId:currentUser?.id,amount:evt?.fee||'—',status:'pending',buktiUrl:url,createdAt:Date.now(),verifiedAt:null};
    if(ex) Object.assign(ex,{...obj,id:ex.id}); else pays.unshift({id:'pay-'+Date.now(),...obj});
    setPayments(pays); closeModal('modal-payment');
    toast('✓ Bukti bayar terkirim! Admin akan memverifikasi segera.','success');
    renderUserProfile();
  };

  if(file){const v=validateJPG(file);if(!v.ok){toast(v.msg,'error');return;}const b64=await fileToBase64(file);save(b64);}
  else save(null);
}

/* ── USER: PAYMENTS LIST MODAL ──────────────────────── */
function openUserPaymentsModal() {
  if(!currentUser) return;
  const pays=getPayments().filter(p=>p.userId===currentUser.id);
  const rm={};getRegs().forEach(r=>{rm[r.id]=r;});
  const em={};getEvents().forEach(e=>{em[e.id]=e;});
  let html='';
  if(!pays.length){html='<div class="empty-mini">Belum ada data pembayaran.</div>';}
  else html=pays.sort((a,b)=>b.createdAt-a.createdAt).map(p=>{
    const r=rm[p.regId]; const e=em[p.eventId];
    return `<div class="reg-hist-row">
      <div class="reg-hist-info">
        <div class="reg-hist-event">${e?.name||'—'}</div>
        <div class="reg-hist-detail">${r?.category||''} &nbsp;•&nbsp; ${p.amount}</div>
      </div>
      <div class="reg-hist-status">
        ${payBadge(p.status)}
        ${p.status!=='verified'?`<button class="btn-sm btn-edit" onclick="closeModal('modal-user-pays');openPaymentModal('${p.regId}','${p.eventId}')">Upload</button>`:''}
      </div>
    </div>`;
  }).join('');
  document.getElementById('user-pay-list').innerHTML=html;
  openModal('modal-user-pays');
}

/* ── ADMIN: RENDER PAYMENTS ─────────────────────────── */
function renderAdminPayments() {
  const filter=document.getElementById('pay-admin-filter')?.value||'';
  const rm={};getRegs().forEach(r=>{rm[r.id]=r;});
  const em={};getEvents().forEach(e=>{em[e.id]=e;});
  let pays=[...getPayments()].sort((a,b)=>b.createdAt-a.createdAt);
  if(filter) pays=pays.filter(p=>p.status===filter);
  const all=getPayments();
  const setC=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  setC('pay-stat-pending',  all.filter(p=>p.status==='pending').length);
  setC('pay-stat-verified', all.filter(p=>p.status==='verified').length);
  setC('pay-stat-rejected', all.filter(p=>p.status==='rejected').length);
  const tbody=document.getElementById('pay-tbody');
  if(!pays.length){tbody.innerHTML=`<tr><td colspan="7" class="td-empty">Tidak ada data pembayaran.</td></tr>`;return;}
  tbody.innerHTML=pays.map((p,i)=>{
    const r=rm[p.regId]; const e=em[p.eventId];
    return `<tr>
      <td>${i+1}</td>
      <td><strong>${r?.name||'—'}</strong><div style="font-size:11px;color:var(--text-muted)">${r?.category||''}</div></td>
      <td><span style="font-size:12px">${(e?.name||'—').substring(0,28)}</span></td>
      <td><strong>${p.amount}</strong></td>
      <td>${payBadge(p.status)}</td>
      <td>${p.buktiUrl?`<a href="${p.buktiUrl}" target="_blank" class="bukti-link">🖼️ Lihat JPG</a>`:`<span style="font-size:11px;color:var(--text-light)">Belum upload</span>`}</td>
      <td><div class="action-btns">
        ${p.status!=='verified'?`<button class="btn-sm btn-green" onclick="verifyPay('${p.id}','verified')">✓</button>`:''}
        ${p.status!=='rejected'?`<button class="btn-sm btn-del"   onclick="verifyPay('${p.id}','rejected')">✕</button>`:''}
      </div></td>
    </tr>`;
  }).join('');
}
function verifyPay(id,status){
  const pays=getPayments(); const p=pays.find(x=>x.id===id);
  if(p){p.status=status;p.verifiedAt=Date.now();setPayments(pays);}
  renderAdminPayments();
  toast(status==='verified'?'✓ Pembayaran diverifikasi':'✕ Pembayaran ditolak',status==='verified'?'success':'error');
}
