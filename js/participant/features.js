'use strict';

/* ══════════════════════════════════════════════════════
   participant/features.js
   1. Countdown event (live ticker + card mini)
   2. Nomor urut peserta (auto-assign per event)
   3. Kartu Peserta Digital (printable)
   4. Batalkan Pendaftaran (sebelum deadline)
   5. Ganti Password
══════════════════════════════════════════════════════ */

/* ── 1. COUNTDOWN ───────────────────────────────────── */
let _countdownTimers = [];

function initCountdowns() {
  _countdownTimers.forEach(t => clearInterval(t));
  _countdownTimers = [];

  // Topbar countdown strip (nearest open event)
  const upcomingEvt = getPublished()
    .filter(e => e.status === 'open' || e.status === 'soon')
    .sort((a, b) => (a.dateStart || '').localeCompare(b.dateStart || ''))[0];

  const strip = document.getElementById('countdown-strip');
  if (strip && upcomingEvt) {
    strip.style.display = 'block';
    document.getElementById('cd-event-name').textContent = upcomingEvt.name;
    const tick = () => _renderCountdown(upcomingEvt.dateStart, 'cd-days','cd-hours','cd-mins','cd-secs','cd-badge');
    tick();
    _countdownTimers.push(setInterval(tick, 1000));
  } else if (strip) {
    strip.style.display = 'none';
  }
}

function _renderCountdown(dateStr, dId, hId, mId, sId, badgeId) {
  const target  = new Date(dateStr).getTime();
  const now     = Date.now();
  const diff    = target - now;

  const dEl = document.getElementById(dId);
  const hEl = document.getElementById(hId);
  const mEl = document.getElementById(mId);
  const sEl = document.getElementById(sId);
  const bEl = document.getElementById(badgeId);
  if (!dEl) return;

  if (diff <= 0) {
    dEl.textContent = '00'; hEl.textContent = '00';
    mEl.textContent = '00'; sEl.textContent = '00';
    if (bEl) bEl.textContent = '🔴 Berlangsung!';
    return;
  }

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);

  dEl.textContent = String(days).padStart(2,'0');
  hEl.textContent = String(hours).padStart(2,'0');
  mEl.textContent = String(mins).padStart(2,'0');
  sEl.textContent = String(secs).padStart(2,'0');
  if (bEl) bEl.textContent = days > 0 ? `${days} hari lagi` : 'Besok!';
}

/* Mini countdown for event cards */
function buildCardCountdown(event) {
  if (!event.dateStart || event.status === 'closed') return '';
  const diff = new Date(event.dateStart).getTime() - Date.now();
  if (diff <= 0) return `<div class="card-countdown"><span class="cd-mini-label">🔴 Sedang berlangsung</span></div>`;

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);

  return `<div class="card-countdown">
    <div class="cd-mini-unit" id="ccd-${event.id}-d"><div class="cd-mini-num">${String(days).padStart(2,'0')}</div><div class="cd-mini-lbl">hari</div></div>
    <span class="cd-mini-sep">:</span>
    <div class="cd-mini-unit" id="ccd-${event.id}-h"><div class="cd-mini-num">${String(hours).padStart(2,'0')}</div><div class="cd-mini-lbl">jam</div></div>
    <span class="cd-mini-sep">:</span>
    <div class="cd-mini-unit" id="ccd-${event.id}-m"><div class="cd-mini-num">${String(mins).padStart(2,'0')}</div><div class="cd-mini-lbl">mnt</div></div>
    <span class="cd-mini-label">menuju hari H</span>
  </div>`;
}

/* Live-tick all visible mini countdowns on the grid */
function startCardCountdowns() {
  _countdownTimers.push(setInterval(() => {
    getPublished().filter(e => e.status !== 'closed').forEach(e => {
      const diff  = new Date(e.dateStart).getTime() - Date.now();
      if (diff <= 0) return;
      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);
      const pad   = n => String(n).padStart(2,'0');
      const dEl = document.getElementById(`ccd-${e.id}-d`);
      const hEl = document.getElementById(`ccd-${e.id}-h`);
      const mEl = document.getElementById(`ccd-${e.id}-m`);
      if (dEl) dEl.querySelector('.cd-mini-num').textContent = pad(days);
      if (hEl) hEl.querySelector('.cd-mini-num').textContent = pad(hours);
      if (mEl) mEl.querySelector('.cd-mini-num').textContent = pad(mins);
    });
  }, 30000)); // update every 30s (minutes granularity)
}

/* ── 2. NOMOR URUT PESERTA ──────────────────────────── */
function getRegNumber(regId, eventId) {
  // Sort all approved/pending regs for that event by createdAt, assign sequential number
  const regs = getRegs()
    .filter(r => r.eventId === eventId && r.status !== 'rejected')
    .sort((a, b) => a.createdAt - b.createdAt);
  const idx = regs.findIndex(r => r.id === regId);
  return idx === -1 ? null : String(idx + 1).padStart(3, '0');
}

/* ── 3. KARTU PESERTA DIGITAL ───────────────────────── */
function openParticipantCard(regId) {
  const reg = getRegs().find(r => r.id === regId);
  if (!reg) return;
  const evt     = getEvents().find(e => e.id === reg.eventId);
  const pay     = getPayments().find(p => p.regId === regId);
  const num     = getRegNumber(regId, reg.eventId);
  const ci      = getCheckins().find(c => c.regId === regId);
  const payOk   = pay?.status === 'verified';

  document.getElementById('pcard-content').innerHTML = `
    <div class="part-card-wrap">
      <div class="part-card" id="printable-card">
        <div class="part-card-header">
          <div class="part-card-logo">🥋</div>
          <div class="part-card-org">
            <div class="part-card-org-name">FORKI Provinsi Bengkulu</div>
            <div class="part-card-org-event">${evt?.name?.substring(0,40) || '—'}</div>
          </div>
        </div>
        <div class="part-card-body">
          <div class="part-card-no">No. Peserta #${num || '—'}</div>
          <div class="part-card-name">${reg.name}</div>
          <div class="part-card-rows">
            <div class="part-card-row"><span class="part-card-row-label">Kategori</span><span class="part-card-row-val">${reg.category}</span></div>
            <div class="part-card-row"><span class="part-card-row-label">Dojo</span><span class="part-card-row-val">${reg.dojo || '—'}</span></div>
            <div class="part-card-row"><span class="part-card-row-label">Sabuk</span><span class="part-card-row-val">${reg.belt || '—'}</span></div>
            <div class="part-card-row"><span class="part-card-row-label">Usia</span><span class="part-card-row-val">${reg.age} tahun</span></div>
            <div class="part-card-row"><span class="part-card-row-label">Kabupaten</span><span class="part-card-row-val">${reg.regency || '—'}</span></div>
            <div class="part-card-row"><span class="part-card-row-label">Tanggal</span><span class="part-card-row-val">${fmtFull(evt?.dateStart || '')} – ${fmtFull(evt?.dateEnd || '')}</span></div>
            <div class="part-card-row"><span class="part-card-row-label">Lokasi</span><span class="part-card-row-val">${evt?.location || '—'}</span></div>
          </div>
        </div>
        <div class="part-card-footer">
          <div>
            <div class="${payOk ? 'part-card-status-ok' : 'part-card-status-pend'}">
              ${payOk ? '✅ Pembayaran Lunas' : '⏳ Menunggu Verifikasi'}
            </div>
            ${ci ? '<div class="part-card-status-ok" style="margin-top:3px">✅ Check-in Hari H</div>' : ''}
            <div class="part-card-date">Diterbitkan: ${new Date().toLocaleDateString('id-ID')}</div>
          </div>
          <div>
            <div class="part-card-qr">QR<br/>${(num || '000')}</div>
          </div>
        </div>
      </div>
    </div>`;

  openModal('modal-participant-card');
}

function printParticipantCard() {
  const el = document.getElementById('printable-card');
  if (!el) return;
  const win = window.open('', '_blank', 'width=400,height=600');
  win.document.write(`<!DOCTYPE html><html><head><title>Kartu Peserta</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:Arial,sans-serif;background:#f0f0f0;}
      .part-card{width:320px;background:#fff;border-radius:12px;border:2px solid #1a2e55;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.15);}
      .part-card-header{background:linear-gradient(135deg,#0a1628,#1a2e55);padding:14px 18px;display:flex;align-items:center;gap:12px;}
      .part-card-logo{font-size:32px;}
      .part-card-org-name{color:#fff;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;}
      .part-card-org-event{color:rgba(255,255,255,.65);font-size:10px;margin-top:1px;}
      .part-card-body{padding:16px 18px;}
      .part-card-no{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#888;margin-bottom:4px;}
      .part-card-name{font-size:20px;font-weight:800;color:#0a1628;margin-bottom:10px;}
      .part-card-rows{display:flex;flex-direction:column;gap:5px;}
      .part-card-row{display:flex;gap:8px;font-size:12px;}
      .part-card-row-label{color:#888;min-width:70px;flex-shrink:0;}
      .part-card-row-val{color:#222;font-weight:600;}
      .part-card-footer{background:#f4f6f8;border-top:1.5px solid #e0e4ea;padding:10px 18px;display:flex;align-items:center;justify-content:space-between;}
      .part-card-status-ok{font-size:12px;font-weight:700;color:#15803d;}
      .part-card-status-pend{font-size:12px;font-weight:700;color:#d97706;}
      .part-card-qr{width:48px;height:48px;background:#fff;border:1.5px solid #ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#aaa;text-align:center;}
      .part-card-date{font-size:10px;color:#aaa;margin-top:2px;}
    </style></head><body>${el.outerHTML}
    <script>window.onload=function(){window.print();window.close();}<\/script>
    </body></html>`);
  win.document.close();
}

/* ── 4. BATALKAN PENDAFTARAN ────────────────────────── */
function cancelRegistration(regId) {
  const reg = getRegs().find(r => r.id === regId);
  if (!reg) return;
  const evt = getEvents().find(e => e.id === reg.eventId);

  // Cek deadline
  if (evt?.deadline) {
    const deadline = new Date(evt.deadline);
    deadline.setHours(23, 59, 59);
    if (Date.now() > deadline.getTime()) {
      toast('⚠️ Deadline sudah lewat, pendaftaran tidak dapat dibatalkan', 'error');
      return;
    }
  }

  if (reg.userId !== currentUser?.id) {
    toast('Tidak diizinkan', 'error'); return;
  }

  const pay = getPayments().find(p => p.regId === regId);
  if (pay?.status === 'verified') {
    toast('⚠️ Pembayaran sudah diverifikasi, hubungi admin untuk pembatalan', 'error');
    return;
  }

  showConfirm(
    'Batalkan Pendaftaran',
    `Batalkan pendaftaran untuk ${reg.category} di ${evt?.name || 'event ini'}? Tindakan ini tidak dapat dibatalkan.`,
    () => {
      const regs = getRegs();
      const idx  = regs.findIndex(r => r.id === regId);
      if (idx !== -1) {
        regs[idx].status    = 'cancelled';
        regs[idx].cancelledAt = Date.now();
        setRegs(regs);
      }
      // Also remove pending payment if any
      if (pay && pay.status === 'pending') {
        setPayments(getPayments().filter(p => p.regId !== regId));
      }
      renderUserProfile();
      renderUserStats();
      toast('✓ Pendaftaran berhasil dibatalkan', 'success');
    }
  );
}

/* ── 5. GANTI PASSWORD ──────────────────────────────── */
function openChangePasswordModal() {
  ['cp-old','cp-new','cp-new2'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('cp-error').style.display = 'none';
  openModal('modal-change-password');
}

function savePassword() {
  const oldPw  = document.getElementById('cp-old').value;
  const newPw  = document.getElementById('cp-new').value;
  const newPw2 = document.getElementById('cp-new2').value;
  const errEl  = document.getElementById('cp-error');

  errEl.style.display = 'none';

  if (!oldPw || !newPw || !newPw2) {
    errEl.textContent = '⚠️ Harap isi semua field.'; errEl.style.display = 'block'; return;
  }
  if (oldPw !== currentUser.password) {
    errEl.textContent = '⚠️ Password lama salah.'; errEl.style.display = 'block'; return;
  }
  if (newPw.length < 6) {
    errEl.textContent = '⚠️ Password baru minimal 6 karakter.'; errEl.style.display = 'block'; return;
  }
  if (newPw !== newPw2) {
    errEl.textContent = '⚠️ Konfirmasi password tidak cocok.'; errEl.style.display = 'block'; return;
  }
  if (newPw === oldPw) {
    errEl.textContent = '⚠️ Password baru tidak boleh sama dengan yang lama.'; errEl.style.display = 'block'; return;
  }

  const users = getUsers();
  const idx   = users.findIndex(u => u.id === currentUser.id);
  users[idx].password = newPw;
  setUsers(users);
  currentUser.password = newPw;

  closeModal('modal-change-password');
  toast('✓ Password berhasil diubah!', 'success');
}
