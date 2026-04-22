'use strict';

/* ══════════════════════════════════════════════════════
   events/multi-reg.js — Pendaftaran Multi-Kategori
   Peserta bisa daftar Kata + Kumite sekaligus dalam 1 form.
   Setiap kategori dicatat sebagai registrasi terpisah tapi
   proses pendaftaran & pembayaran dalam satu alur.
══════════════════════════════════════════════════════ */

function openMultiRegModal(evtId) {
  if (!currentUser) { showPage('page-user-login'); return; }

  const evt = getEvents().find(e => e.id === evtId);
  if (!evt) return;

  const existing = getRegs().filter(r => r.eventId === evtId && r.userId === currentUser.id);
  const full     = evt.maxParticipants && approvedRegCount(evtId) >= evt.maxParticipants;

  document.getElementById('mreg-event-name').textContent = evt.name;
  document.getElementById('mreg-event-fee').textContent  = evt.fee || 'Gratis';
  document.getElementById('mreg-event-id').value         = evtId;
  document.getElementById('mreg-approval-notice').style.display = evt.registrationApproval ? 'block' : 'none';

  // Pre-fill personal data from profile
  document.getElementById('mr-name').value  = currentUser.name  || '';
  document.getElementById('mr-email').value = currentUser.email || '';
  document.getElementById('mr-phone').value = currentUser.phone || '';
  document.getElementById('mr-dojo').value  = currentUser.dojo  || '';
  document.getElementById('mr-age').value   = '';
  document.getElementById('mr-regency').value = '';
  document.getElementById('mr-note').value  = '';

  // Belt select
  document.getElementById('mr-belt').innerHTML = `<option value="">— pilih —</option>` +
    KARATE_BELTS.map(b => `<option>${b}</option>`).join('');

  // Region select
  document.getElementById('mr-regency').innerHTML = `<option value="">— pilih —</option>` +
    KABUPATEN.filter(k => k !== 'Semua Wilayah').map(k => `<option>${k}</option>`).join('');

  // Build category checkboxes grouped
  renderMultiCatCheckboxes(evtId, existing);

  openModal('modal-multi-reg');
}

function renderMultiCatCheckboxes(evtId, existingRegs) {
  const existingCats = existingRegs.map(r => r.category);
  const groups = [
    { label: 'Kategori Putra',  cats: KAT_PUTRA  },
    { label: 'Kategori Putri',  cats: KAT_PUTRI  },
    { label: 'Kategori Junior', cats: KAT_JUNIOR },
  ];

  let html = '';
  groups.forEach(g => {
    html += `<div class="mreg-group">
      <div class="mreg-group-label">${g.label}</div>
      <div class="mreg-cat-list">
        ${g.cats.map(c => {
          const alreadyReg = existingCats.includes(c);
          return `
            <label class="mreg-cat-item ${alreadyReg ? 'mreg-cat-done' : ''}">
              <input type="checkbox" class="mreg-cat-check" value="${c}" ${alreadyReg ? 'disabled checked' : ''}/>
              <span class="mreg-cat-name">${c}</span>
              ${alreadyReg ? '<span class="mreg-already">✓ Sudah daftar</span>' : ''}
            </label>`;
        }).join('')}
      </div>
    </div>`;
  });

  document.getElementById('mreg-cat-list').innerHTML = html;

  // Update total fee
  updateMultiRegFee(evtId);
  document.querySelectorAll('.mreg-cat-check').forEach(cb => {
    cb.addEventListener('change', () => updateMultiRegFee(evtId));
  });
}

function updateMultiRegFee(evtId) {
  const evt      = getEvents().find(e => e.id === evtId);
  const checked  = document.querySelectorAll('.mreg-cat-check:not(:disabled):checked').length;
  const feeStr   = evt?.fee || '';
  const feeNum   = parseInt(feeStr.replace(/[^0-9]/g, '')) || 0;
  const total    = feeNum * checked;

  const summary  = document.getElementById('mreg-fee-summary');
  if (summary) {
    if (checked === 0) {
      summary.textContent = 'Pilih minimal 1 kategori';
      summary.style.color = 'var(--text-muted)';
    } else {
      summary.textContent = `${checked} kategori × ${evt?.fee || 'Gratis'} = ${total > 0 ? 'Rp ' + total.toLocaleString('id-ID') : 'Gratis'}`;
      summary.style.color = 'var(--green)';
    }
  }
}

function submitMultiReg() {
  const evtId   = document.getElementById('mreg-event-id').value;
  const evt     = getEvents().find(e => e.id === evtId);

  const name    = document.getElementById('mr-name').value.trim();
  const age     = parseInt(document.getElementById('mr-age').value);
  const email   = document.getElementById('mr-email').value.trim();
  const phone   = document.getElementById('mr-phone').value.trim();
  const belt    = document.getElementById('mr-belt').value;
  const regency = document.getElementById('mr-regency').value;
  const dojo    = document.getElementById('mr-dojo').value.trim();
  const note    = document.getElementById('mr-note').value.trim();

  const selected = Array.from(document.querySelectorAll('.mreg-cat-check:not(:disabled):checked')).map(cb => cb.value);

  if (!name || !age || !email || !phone) { toast('Harap isi data diri yang wajib (*)', 'error'); return; }
  if (age < 5 || age > 80)               { toast('Usia harus antara 5–80 tahun', 'error'); return; }
  if (!selected.length)                  { toast('Pilih minimal 1 kategori', 'error'); return; }
  if (selected.length > 4)               { toast('Maks. 4 kategori per pendaftaran', 'error'); return; }

  const regs   = getRegs();
  const status = evt?.registrationApproval ? 'pending' : 'approved';
  const newIds = [];

  selected.forEach(cat => {
    // Skip if already registered for this category
    if (regs.some(r => r.eventId === evtId && r.userId === currentUser.id && r.category === cat)) return;

    const newReg = {
      id: 'reg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      eventId: evtId, userId: currentUser.id,
      name, age, email, phone, dojo, belt, category: cat, regency, note, status,
      createdAt: Date.now(),
    };
    regs.unshift(newReg);
    newIds.push(newReg.id);
  });

  setRegs(regs);
  closeModal('modal-multi-reg');
  renderUserStats();
  renderUserGrid();

  if (!newIds.length) { toast('Semua kategori yang dipilih sudah terdaftar', 'error'); return; }

  if (status === 'pending') {
    toast(`📋 ${newIds.length} pendaftaran menunggu persetujuan admin.`, 'success');
  }

  // Show multi-payment instructions
  showMultiPayInstructions(newIds, evtId, selected);
}

function showMultiPayInstructions(regIds, evtId, categories) {
  const evt    = getEvents().find(e => e.id === evtId);
  const feeNum = parseInt((evt?.fee || '').replace(/[^0-9]/g, '')) || 0;
  const total  = feeNum * categories.length;

  document.getElementById('mpi-event-name').textContent = evt?.name || '—';
  document.getElementById('mpi-categories').innerHTML = categories.map(c =>
    `<div class="mpi-cat-row"><span class="cat-badge" style="font-size:11px">${c}</span><span>${evt?.fee || 'Gratis'}</span></div>`
  ).join('');
  document.getElementById('mpi-total').textContent = total > 0 ? 'Rp ' + total.toLocaleString('id-ID') : 'Gratis';
  document.getElementById('mpi-bank').textContent    = PAYMENT_BANK.bank;
  document.getElementById('mpi-account').textContent = PAYMENT_BANK.account;
  document.getElementById('mpi-accname').textContent = PAYMENT_BANK.name;
  document.getElementById('mpi-reg-ids').value = regIds.join(',');
  document.getElementById('mpi-event-id').value  = evtId;
  resetJpgInput('mpi-bukti-file', 'mpi-file-label', 'mpi-file-err');
  openModal('modal-multi-pay');
  toast(`✅ ${categories.length} kategori berhasil didaftarkan!`, 'success');
}

async function submitMultiPayment() {
  const regIds  = document.getElementById('mpi-reg-ids').value.split(',').filter(Boolean);
  const evtId   = document.getElementById('mpi-event-id').value;
  const evt     = getEvents().find(e => e.id === evtId);
  const feeNum  = parseInt((evt?.fee || '').replace(/[^0-9]/g, '')) || 0;
  const file    = document.getElementById('mpi-bukti-file')?.files[0];

  const save = (buktiUrl) => {
    const pays = getPayments();
    const total = feeNum * regIds.length;
    // Single payment record covering all categories
    pays.unshift({
      id:        'pay-' + Date.now(),
      regIds,               // all registrations covered
      regId:     regIds[0], // primary ref for compatibility
      eventId:   evtId,
      userId:    currentUser?.id,
      amount:    total > 0 ? 'Rp ' + total.toLocaleString('id-ID') : 'Gratis',
      status:    'pending',
      buktiUrl,
      multiCategories: true,
      createdAt: Date.now(),
      verifiedAt: null,
    });
    setPayments(pays);
    closeModal('modal-multi-pay');
    toast('✓ Bukti bayar terkirim! Admin akan segera memverifikasi.', 'success');
    renderUserProfile();
  };

  if (file) {
    const v = validateJPG(file);
    if (!v.ok) { toast(v.msg, 'error'); return; }
    const b64 = await fileToBase64(file);
    save(b64);
  } else {
    save(null);
  }
}
