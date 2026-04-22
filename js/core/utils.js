'use strict';

/* ── DATE ───────────────────────────────────────────── */
function fmt(d) {
  if (!d) return '—';
  const [y,m,day]=d.split('-');
  return `${+day} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][+m-1]} ${y}`;
}
function fmtFull(d) {
  if (!d) return '—';
  const [y,m,day]=d.split('-');
  return `${+day} ${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][+m-1]} ${y}`;
}
function timeAgo(ts) {
  const s=(Date.now()-ts)/1000;
  if(s<60) return 'baru saja';
  if(s<3600) return `${Math.floor(s/60)} menit lalu`;
  if(s<86400) return `${Math.floor(s/3600)} jam lalu`;
  return `${Math.floor(s/86400)} hari lalu`;
}
function daysUntil(d) { if(!d)return null; return Math.ceil((new Date(d)-new Date())/86400000); }
function isDeadlineSoon(d) { const n=daysUntil(d); return n!==null&&n>=0&&n<=7; }

/* ── BADGES ─────────────────────────────────────────── */
function statusBadge(s) {
  const m={open:['badge-open','Dibuka'],soon:['badge-soon','Segera'],closed:['badge-closed','Ditutup']};
  const [c,l]=m[s]||['badge-closed','—'];
  return `<span class="ev-badge ${c}">${l}</span>`;
}
function payBadge(s) {
  const m={verified:['pay-verified','✓ Lunas'],pending:['pay-pending','⏳ Menunggu'],rejected:['pay-rejected','✕ Ditolak']};
  const [c,l]=m[s]||['pay-pending','Belum Bayar'];
  return `<span class="pay-badge ${c}">${l}</span>`;
}
function approvalBadge(s) {
  const m={approved:['apv-ok','✓ Diterima'],pending:['apv-wait','⏳ Menunggu'],rejected:['apv-no','✕ Ditolak']};
  const [c,l]=m[s||'approved']||['apv-ok','✓ Diterima'];
  return `<span class="apv-badge ${c}">${l}</span>`;
}

/* ── TOAST ──────────────────────────────────────────── */
function toast(msg, type='') {
  const el=document.createElement('div');
  el.className=`toast ${type}`; el.innerHTML=msg;
  document.getElementById('toast-ct').appendChild(el);
  setTimeout(()=>{el.classList.add('fade-out');setTimeout(()=>el.remove(),400);},3000);
}

/* ── MODAL ──────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

/* ── CSV ────────────────────────────────────────────── */
function downloadCSV(rows, fn) {
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));
  a.download=fn; a.click(); URL.revokeObjectURL(a.href);
}
function exportEventsCSV() {
  const h=['ID','Nama','Kategori','Tgl Mulai','Tgl Selesai','Deadline','Biaya','Lokasi','Penyelenggara','Status','Publik','Peserta','Kuota'];
  const rows=getEvents().map(e=>[e.id,e.name,e.category,e.dateStart,e.dateEnd,e.deadline||'',e.fee||'',e.location,e.organizer||'',e.status,e.published?'Publik':'Draft',regCount(e.id),e.maxParticipants||'—']);
  downloadCSV([h,...rows],'events_karate_bengkulu.csv'); toast('✓ Data event diekspor','success');
}
function exportParticipantsCSV() {
  const fid=document.getElementById('part-event-filter')?.value||'';
  let regs=[...getRegs()]; if(fid) regs=regs.filter(r=>r.eventId===fid);
  const em={};getEvents().forEach(e=>{em[e.id]=e.name;});
  const pm={};getPayments().forEach(p=>{pm[p.regId]=p.status;});
  const h=['ID','Nama','Email','HP','Dojo','Kategori','Sabuk','Usia','Kabupaten','Event','Status Reg','Status Bayar','Catatan','Waktu'];
  const rows=regs.map(r=>[r.id,r.name,r.email,r.phone,r.dojo||'',r.category,r.belt||'',r.age,r.regency||'',em[r.eventId]||'',r.status||'approved',pm[r.id]||'pending',r.note||'',new Date(r.createdAt).toLocaleString('id-ID')]);
  downloadCSV([h,...rows],'peserta_karate_bengkulu.csv'); toast('✓ Data peserta diekspor','success');
}

/* ── FILE VALIDATION (JPG only) ─────────────────────── */
function validateJPG(file) {
  if (!file) return {ok:false,msg:'Pilih file terlebih dahulu.'};
  if (file.type!=='image/jpeg'&&file.type!=='image/jpg') return {ok:false,msg:'File harus berformat JPG/JPEG.'};
  if (!/\.(jpg|jpeg)$/i.test(file.name)) return {ok:false,msg:'Ekstensi file harus .jpg atau .jpeg.'};
  if (file.size>3*1024*1024) return {ok:false,msg:'Ukuran file maks. 3MB.'};
  return {ok:true};
}
function fileToBase64(file) {
  return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('Gagal membaca file'));r.readAsDataURL(file);});
}

/* ── DARK MODE ──────────────────────────────────────── */
function initDarkMode() { if(localStorage.getItem('kc_dark')==='true') document.body.classList.add('dark'); }
function toggleDark() {
  document.body.classList.toggle('dark');
  localStorage.setItem('kc_dark', document.body.classList.contains('dark'));
  const ic=document.getElementById('dark-icon'); if(ic) ic.textContent=document.body.classList.contains('dark')?'☀️':'🌙';
}

/* ── WHATSAPP SHARE ─────────────────────────────────── */
function shareWhatsApp(regId, eventId) {
  const reg=getRegs().find(r=>r.id===regId);
  const evt=getEvents().find(e=>e.id===eventId);
  if(!reg||!evt) return;
  const text=`🥋 *Pendaftaran Kejuaraan Karate*\n\n*Event:* ${evt.name}\n*Nama:* ${reg.name}\n*Kategori:* ${reg.category}\n*Sabuk:* ${reg.belt||'—'}\n*Dojo:* ${reg.dojo||'—'}\n*No. Registrasi:* ${reg.id}\n\nDiselenggarakan oleh ${evt.organizer||'FORKI Bengkulu'}\n📅 ${fmtFull(evt.dateStart)}\n📍 ${evt.location}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank');
}

/* ── PRINT HELPERS ──────────────────────────────────── */
function printElement(el) {
  const win=window.open('','_blank','width=900,height=700');
  win.document.write(`<!DOCTYPE html><html><head><title>Print</title>
    <style>body{font-family:Arial,sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}
    th,td{border:1px solid #ccc;padding:8px;}th{background:#f0f0f0;}</style></head>
    <body>${el.innerHTML}</body></html>`);
  win.document.close(); win.focus();
  setTimeout(()=>{win.print();win.close();},400);
}
