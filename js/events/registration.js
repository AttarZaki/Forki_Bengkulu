'use strict';

/* ── OPEN REG MODAL ─────────────────────────────────── */
function openRegModal(evtId) {
  if(!currentUser){showPage('page-user-login');return;}
  const e=getEvents().find(x=>x.id===evtId); if(!e) return;

  const cnt=approvedRegCount(evtId);
  if(e.maxParticipants&&cnt>=e.maxParticipants){toast('Kuota peserta sudah penuh','error');return;}

  document.getElementById('reg-event-name').textContent=e.name;
  document.getElementById('reg-event-fee').textContent=e.fee||'Gratis';
  document.getElementById('reg-approval-notice').style.display=e.registrationApproval?'block':'none';
  document.getElementById('reg-eid').value=evtId;

  // Pre-fill
  document.getElementById('r-name').value=currentUser.name||'';
  document.getElementById('r-email').value=currentUser.email||'';
  document.getElementById('r-phone').value=currentUser.phone||'';
  document.getElementById('r-dojo').value=currentUser.dojo||'';
  ['r-age','r-note'].forEach(id=>{document.getElementById(id).value='';});

  buildRegDropdowns();
  openModal('modal-reg');
}

function buildRegDropdowns() {
  document.getElementById('r-cat').innerHTML=`<option value="">— pilih kategori —</option>`
    +`<optgroup label="Putra">`+KAT_PUTRA.map(c=>`<option>${c}</option>`).join('')+`</optgroup>`
    +`<optgroup label="Putri">`+KAT_PUTRI.map(c=>`<option>${c}</option>`).join('')+`</optgroup>`
    +`<optgroup label="Junior">`+KAT_JUNIOR.map(c=>`<option>${c}</option>`).join('')+`</optgroup>`;

  document.getElementById('r-belt').innerHTML=`<option value="">— pilih —</option>`
    +KARATE_BELTS.map(b=>`<option>${b}</option>`).join('');

  document.getElementById('r-regency').innerHTML=`<option value="">— pilih —</option>`
    +KABUPATEN.filter(k=>k!=='Semua Wilayah').map(k=>`<option>${k}</option>`).join('');
}

/* ── SUBMIT REGISTRATION ────────────────────────────── */
function submitReg() {
  const evtId=document.getElementById('reg-eid').value;
  const e=getEvents().find(x=>x.id===evtId);
  const name=document.getElementById('r-name').value.trim();
  const age=parseInt(document.getElementById('r-age').value);
  const email=document.getElementById('r-email').value.trim();
  const phone=document.getElementById('r-phone').value.trim();
  const cat=document.getElementById('r-cat').value;

  if(!name||!age||!email||!phone||!cat){toast('Harap isi semua field wajib (*)','error');return;}
  if(age<5||age>80){toast('Usia harus antara 5 – 80 tahun','error');return;}

  const regs=getRegs();
  if(regs.some(r=>r.eventId===evtId&&r.userId===currentUser.id)){toast('Anda sudah mendaftar event ini','error');return;}

  // Re-check quota
  if(e?.maxParticipants&&approvedRegCount(evtId)>=e.maxParticipants){toast('Kuota sudah penuh','error');return;}

  const status=e?.registrationApproval?'pending':'approved';
  const newReg={
    id:'reg-'+Date.now(), eventId:evtId, userId:currentUser.id,
    name, age, email, phone,
    dojo:document.getElementById('r-dojo').value.trim(),
    belt:document.getElementById('r-belt').value,
    category:cat,
    regency:document.getElementById('r-regency').value,
    note:document.getElementById('r-note').value.trim(),
    status, createdAt:Date.now(),
  };
  regs.unshift(newReg); setRegs(regs);
  closeModal('modal-reg');
  renderUserStats(); renderUserGrid();

  if(status==='pending') {
    toast('📋 Pendaftaran menunggu persetujuan admin.','success');
    showPayInstructions(newReg.id, evtId);
  } else {
    showPayInstructions(newReg.id, evtId);
  }
}

/* ── PAYMENT INSTRUCTIONS ───────────────────────────── */
function showPayInstructions(regId, evtId) {
  const e=getEvents().find(x=>x.id===evtId);
  document.getElementById('pi-event-name').textContent=e?.name||'—';
  document.getElementById('pi-amount').textContent=e?.fee||'Gratis';
  document.getElementById('pi-bank').textContent=PAYMENT_BANK.bank;
  document.getElementById('pi-account').textContent=PAYMENT_BANK.account;
  document.getElementById('pi-accname').textContent=PAYMENT_BANK.name;
  document.getElementById('pi-hint').textContent=PAYMENT_BANK.hint;
  document.getElementById('pi-reg-id').value=regId;
  document.getElementById('pi-event-id').value=evtId;
  resetJpgInput('pi-bukti-file','pi-file-label','pi-file-err');
  openModal('modal-pay-instructions');
}

async function submitFromInstructions() {
  const regId=document.getElementById('pi-reg-id').value;
  const evtId=document.getElementById('pi-event-id').value;
  const e=getEvents().find(x=>x.id===evtId);
  const file=document.getElementById('pi-bukti-file').files[0];

  const save=(url)=>{
    const pays=getPayments();
    pays.unshift({id:'pay-'+Date.now(),regId,eventId:evtId,userId:currentUser?.id,amount:e?.fee||'—',status:'pending',buktiUrl:url,createdAt:Date.now(),verifiedAt:null});
    setPayments(pays);
    closeModal('modal-pay-instructions');
    toast('✓ Bukti bayar terkirim! Menunggu verifikasi admin.','success');
    // Show WA share
    const reg=getRegs().find(r=>r.id===regId);
    if(reg) showWAPrompt(regId, evtId);
  };

  if(file){
    const v=validateJPG(file); if(!v.ok){toast(v.msg,'error');return;}
    const b64=await fileToBase64(file); save(b64);
  } else { save(null); }
}

/* ── WA PROMPT AFTER REGISTRATION ──────────────────── */
function showWAPrompt(regId, evtId) {
  const e=getEvents().find(x=>x.id===evtId);
  const r=getRegs().find(x=>x.id===regId);
  if(!e||!r) return;
  document.getElementById('wa-event-name').textContent=e.name;
  document.getElementById('wa-reg-name').textContent=r.name;
  document.getElementById('wa-reg-cat').textContent=r.category;
  document.getElementById('wa-reg-id-val').textContent=r.id;
  document.getElementById('wa-share-reg-id').value=regId;
  document.getElementById('wa-share-evt-id').value=evtId;
  openModal('modal-wa-share');
}

/* ── FILE INPUT HELPERS ─────────────────────────────── */
function onJpgChange(inputId,labelId,errId) {
  const f=document.getElementById(inputId)?.files[0];
  const lbl=document.getElementById(labelId);
  const err=document.getElementById(errId);
  err.style.display='none';
  if(!f){if(lbl)lbl.textContent='Pilih file JPG (maks. 3MB)';return;}
  const v=validateJPG(f);
  if(!v.ok){
    document.getElementById(inputId).value='';
    if(lbl)lbl.textContent='Pilih file JPG (maks. 3MB)';
    err.textContent='⚠️ '+v.msg; err.style.display='block'; return;
  }
  if(lbl)lbl.textContent='✓ '+f.name;
}
function resetJpgInput(inputId,labelId,errId) {
  const i=document.getElementById(inputId); if(i)i.value='';
  const l=document.getElementById(labelId); if(l)l.textContent='Pilih file JPG (maks. 3MB)';
  const e=document.getElementById(errId);   if(e)e.style.display='none';
}
