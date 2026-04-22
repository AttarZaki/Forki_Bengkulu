/* ═══════════════════════════════════════════════
   KarateChamp Bengkulu — bracket.js
   Bracket, Results, Payment management
═══════════════════════════════════════════════ */

'use strict';

// ── BRACKET SYSTEM ──────────────────────────────

let currentBracketId = null;

function openBracketModal(eventId) {
  const ev = getEvents().find(e => e.id === eventId);
  if (!ev) return;

  document.getElementById('bkt-event-name').textContent = ev.name;
  document.getElementById('bkt-event-id').value = eventId;

  // Load categories from registrations
  const regs = getRegs().filter(r => r.eventId === eventId);
  const cats = [...new Set(regs.map(r => r.category))].filter(Boolean);
  const catSel = document.getElementById('bkt-cat-select');
  catSel.innerHTML = `<option value="">— Pilih Kategori —</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join('');

  document.getElementById('bkt-content').innerHTML = `
    <div style="text-align:center;padding:30px;color:var(--text-muted)">
      <div style="font-size:48px;margin-bottom:12px">🏆</div>
      <p>Pilih kategori untuk melihat atau membuat bagan pertandingan</p>
    </div>`;
  document.getElementById('bracket-modal').classList.add('open');
}

function loadBracketForCategory() {
  const eventId = document.getElementById('bkt-event-id').value;
  const cat = document.getElementById('bkt-cat-select').value;
  if (!cat) { document.getElementById('bkt-content').innerHTML = ''; return; }

  const regs = getRegs().filter(r => r.eventId === eventId && r.category === cat);
  const brackets = getBrackets();
  const existing = brackets.find(b => b.eventId === eventId && b.category === cat);

  if (existing) {
    renderBracketView(existing);
  } else {
    renderBracketEmpty(regs, eventId, cat);
  }
}

function renderBracketEmpty(regs, eventId, cat) {
  const isAdmin = currentRole === 'admin';
  document.getElementById('bkt-content').innerHTML = `
    <div style="text-align:center;padding:30px">
      <div style="font-size:40px;margin-bottom:10px">📋</div>
      <p style="color:var(--text-muted);margin-bottom:16px">
        Bagan untuk kategori <strong>${cat}</strong> belum dibuat.<br>
        ${regs.length} peserta terdaftar.
      </p>
      ${isAdmin && regs.length >= 2 ? `<button class="btn-primary" onclick="generateBracket('${eventId}','${cat}')">⚡ Generate Bagan Otomatis</button>` : ''}
      ${regs.length < 2 ? '<p style="color:var(--red);font-size:13px">Minimal 2 peserta untuk membuat bagan.</p>' : ''}
    </div>`;
}

function generateBracket(eventId, cat) {
  const regs = getRegs().filter(r => r.eventId === eventId && r.category === cat);
  if (regs.length < 2) { toast('Minimal 2 peserta', 'error'); return; }

  // Shuffle participants
  const parts = [...regs].sort(() => Math.random() - 0.5).map(r => ({ name: r.name, dojo: r.dojo || '—', regId: r.id }));

  // Pad to next power of 2 with byes
  let size = 2;
  while (size < parts.length) size *= 2;
  while (parts.length < size) parts.push(null);

  // Build rounds
  const rounds = [];
  let currentSlots = parts;
  let roundNum = 1;
  while (currentSlots.length > 1) {
    const matches = [];
    for (let i = 0; i < currentSlots.length; i += 2) {
      const p1 = currentSlots[i];
      const p2 = currentSlots[i + 1];
      const autoWinner = (p1 && !p2) ? 'p1' : (!p1 && p2) ? 'p2' : null;
      matches.push({ id: `m-${roundNum}-${i/2}`, p1, p2, winner: autoWinner, score1: '', score2: '' });
    }
    rounds.push({ round: roundNum, name: roundName(rounds.length, Math.log2(size)), matches });
    currentSlots = matches.map(m => m.winner === 'p1' ? m.p1 : m.winner === 'p2' ? m.p2 : null);
    roundNum++;
  }

  const bracket = { id: 'bkt-' + Date.now(), eventId, category: cat, rounds, createdAt: Date.now(), finalized: false };
  const brackets = getBrackets();
  brackets.push(bracket);
  setBrackets(brackets);
  toast('✓ Bagan berhasil dibuat!', 'success');
  renderBracketView(bracket);
}

function roundName(roundIndex, totalRounds) {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return 'FINAL';
  if (fromEnd === 1) return 'SEMIFINAL';
  if (fromEnd === 2) return 'PEREMPAT FINAL';
  return `BABAK ${roundIndex + 1}`;
}

function renderBracketView(bracket) {
  const isAdmin = currentRole === 'admin';
  const totalRounds = bracket.rounds.length;

  let html = `
    <div class="bracket-wrap">
      <div class="bracket-header-info">
        <span class="bkt-cat-badge">${bracket.category}</span>
        ${bracket.finalized ? '<span class="bkt-finalized">✓ Selesai</span>' : '<span class="bkt-ongoing">🔴 Live</span>'}
        ${isAdmin && !bracket.finalized ? `<button class="btn-sm btn-edit" onclick="finalizeBracket('${bracket.id}')">✓ Finalisasi</button>` : ''}
        ${isAdmin ? `<button class="btn-sm btn-del" onclick="deleteBracket('${bracket.id}')">Hapus</button>` : ''}
      </div>
      <div class="bracket-tree">`;

  bracket.rounds.forEach((round, ri) => {
    const rName = roundName(ri, totalRounds);
    html += `<div class="bracket-round">
      <div class="bracket-round-label">${rName}</div>
      <div class="bracket-matches">`;

    round.matches.forEach(match => {
      const p1 = match.p1;
      const p2 = match.p2;
      const w = match.winner;
      const isBye = (p1 && !p2) || (!p1 && p2);

      const p1Class = w ? (w === 'p1' ? 'match-winner' : 'match-loser') : '';
      const p2Class = w ? (w === 'p2' ? 'match-winner' : 'match-loser') : '';

      html += `<div class="bracket-match ${isBye ? 'match-bye' : ''}">
        <div class="match-player ${p1Class}" ${isAdmin && !bracket.finalized && p1 && p2 ? `onclick="setWinner('${bracket.id}','${round.round}','${match.id}','p1')"` : ''}>
          ${p1 ? `<span class="mp-name">${p1.name}</span><span class="mp-dojo">${p1.dojo}</span>` : '<span class="mp-bye">— BYE —</span>'}
          ${w === 'p1' ? '<span class="mp-crown">👑</span>' : ''}
        </div>
        <div class="match-vs">VS</div>
        <div class="match-player ${p2Class}" ${isAdmin && !bracket.finalized && p1 && p2 ? `onclick="setWinner('${bracket.id}','${round.round}','${match.id}','p2')"` : ''}>
          ${p2 ? `<span class="mp-name">${p2.name}</span><span class="mp-dojo">${p2.dojo}</span>` : '<span class="mp-bye">— BYE —</span>'}
          ${w === 'p2' ? '<span class="mp-crown">👑</span>' : ''}
        </div>
      </div>`;
    });

    html += `</div></div>`;
  });

  html += `</div></div>`;
  if (isAdmin && !bracket.finalized) {
    html += `<p class="bkt-hint">💡 Klik nama peserta untuk menentukan pemenang setiap pertandingan</p>`;
  }

  document.getElementById('bkt-content').innerHTML = html;
}

function setWinner(bracketId, roundNum, matchId, winner) {
  const brackets = getBrackets();
  const bkt = brackets.find(b => b.id === bracketId);
  if (!bkt) return;

  const round = bkt.rounds.find(r => r.round === parseInt(roundNum));
  const match = round?.matches.find(m => m.id === matchId);
  if (!match) return;

  const winnerObj = winner === 'p1' ? match.p1 : match.p2;
  match.winner = winner;

  // Advance winner to next round if exists
  const nextRound = bkt.rounds.find(r => r.round === parseInt(roundNum) + 1);
  if (nextRound) {
    const matchIdx = round.matches.indexOf(match);
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const nextMatch = nextRound.matches[nextMatchIdx];
    if (nextMatch) {
      if (matchIdx % 2 === 0) nextMatch.p1 = winnerObj;
      else nextMatch.p2 = winnerObj;
      // Auto-advance byes
      if (nextMatch.p1 && !nextMatch.p2) nextMatch.winner = 'p1';
      else if (!nextMatch.p1 && nextMatch.p2) nextMatch.winner = 'p2';
      else nextMatch.winner = null;
    }
  }

  setBrackets(brackets);
  renderBracketView(bkt);
  toast('✓ Pemenang dicatat', 'success');
}

function finalizeBracket(bracketId) {
  const brackets = getBrackets();
  const bkt = brackets.find(b => b.id === bracketId);
  if (bkt) { bkt.finalized = true; setBrackets(brackets); }
  renderBracketView(bkt);
  toast('✓ Bagan difinalisasi', 'success');
}

function deleteBracket(bracketId) {
  const brackets = getBrackets().filter(b => b.id !== bracketId);
  setBrackets(brackets);
  closeModal('bracket-modal');
  toast('Bagan dihapus', 'error');
}

// ── RESULTS SYSTEM ──────────────────────────────

let editingResultId = null;

function openResultsModal(eventId) {
  const ev = getEvents().find(e => e.id === eventId);
  if (!ev) return;
  document.getElementById('res-event-name').textContent = ev.name;
  document.getElementById('res-event-id').value = eventId;
  renderResultsList(eventId);
  document.getElementById('results-modal').classList.add('open');
}

function renderResultsList(eventId) {
  const results = getResults().filter(r => r.eventId === eventId);
  const isAdmin = currentRole === 'admin';
  let html = '';

  if (!results.length) {
    html = `<div style="text-align:center;padding:30px;color:var(--text-muted)">
      <div style="font-size:40px;margin-bottom:8px">🏅</div>
      <p>Belum ada hasil yang dipublikasikan untuk event ini.</p></div>`;
  } else {
    results.forEach(r => {
      html += `
        <div class="result-card">
          <div class="result-cat-header">${r.category}</div>
          <div class="result-podium">
            <div class="podium-item gold">🥇 <span class="podium-name">${r.gold?.name || '—'}</span><span class="podium-dojo">${r.gold?.dojo || ''}</span></div>
            <div class="podium-item silver">🥈 <span class="podium-name">${r.silver?.name || '—'}</span><span class="podium-dojo">${r.silver?.dojo || ''}</span></div>
            ${r.bronze1 ? `<div class="podium-item bronze">🥉 <span class="podium-name">${r.bronze1.name}</span><span class="podium-dojo">${r.bronze1.dojo || ''}</span></div>` : ''}
            ${r.bronze2 ? `<div class="podium-item bronze">🥉 <span class="podium-name">${r.bronze2.name}</span><span class="podium-dojo">${r.bronze2.dojo || ''}</span></div>` : ''}
          </div>
          ${isAdmin ? `<div style="margin-top:10px;display:flex;gap:8px">
            <button class="btn-sm btn-edit" onclick="openResultForm('${r.id}','${eventId}')">Edit</button>
            <button class="btn-sm btn-del" onclick="deleteResult('${r.id}','${eventId}')">Hapus</button>
          </div>` : ''}
        </div>`;
    });
  }

  if (isAdmin) {
    html = `<div style="margin-bottom:16px">
      <button class="btn-primary" onclick="openResultForm(null,'${eventId}')">＋ Tambah Hasil Kategori</button>
    </div>` + html;
  }

  document.getElementById('res-list').innerHTML = html;
  document.getElementById('res-form-area').style.display = 'none';
}

function openResultForm(resultId, eventId) {
  editingResultId = resultId;
  document.getElementById('res-form-area').style.display = 'block';

  if (resultId) {
    const r = getResults().find(x => x.id === resultId);
    document.getElementById('rf-cat').value    = r.category;
    document.getElementById('rf-gold').value   = r.gold?.name || '';
    document.getElementById('rf-gold-d').value = r.gold?.dojo || '';
    document.getElementById('rf-silver').value   = r.silver?.name || '';
    document.getElementById('rf-silver-d').value = r.silver?.dojo || '';
    document.getElementById('rf-b1').value   = r.bronze1?.name || '';
    document.getElementById('rf-b1-d').value = r.bronze1?.dojo || '';
    document.getElementById('rf-b2').value   = r.bronze2?.name || '';
    document.getElementById('rf-b2-d').value = r.bronze2?.dojo || '';
  } else {
    ['rf-cat','rf-gold','rf-gold-d','rf-silver','rf-silver-d','rf-b1','rf-b1-d','rf-b2','rf-b2-d']
      .forEach(id => { document.getElementById(id).value = ''; });
  }
  document.getElementById('res-form-area').scrollIntoView({ behavior: 'smooth' });
}

function saveResult() {
  const eventId = document.getElementById('res-event-id').value;
  const cat   = document.getElementById('rf-cat').value.trim();
  const gn    = document.getElementById('rf-gold').value.trim();
  const gd    = document.getElementById('rf-gold-d').value.trim();
  const sn    = document.getElementById('rf-silver').value.trim();
  const sd    = document.getElementById('rf-silver-d').value.trim();
  const b1n   = document.getElementById('rf-b1').value.trim();
  const b1d   = document.getElementById('rf-b1-d').value.trim();
  const b2n   = document.getElementById('rf-b2').value.trim();
  const b2d   = document.getElementById('rf-b2-d').value.trim();

  if (!cat || !gn || !sn) { toast('Kategori, juara 1 dan 2 wajib diisi', 'error'); return; }

  const results = getResults();
  const obj = {
    eventId, category: cat,
    gold:    { name: gn, dojo: gd },
    silver:  { name: sn, dojo: sd },
    bronze1: b1n ? { name: b1n, dojo: b1d } : null,
    bronze2: b2n ? { name: b2n, dojo: b2d } : null,
    published: true, createdAt: Date.now()
  };

  if (editingResultId) {
    const idx = results.findIndex(r => r.id === editingResultId);
    results[idx] = { ...results[idx], ...obj };
  } else {
    results.unshift({ id: 'res-' + Date.now(), ...obj });
  }
  setResults(results);
  toast('✓ Hasil disimpan', 'success');
  renderResultsList(eventId);
}

function deleteResult(resultId, eventId) {
  setResults(getResults().filter(r => r.id !== resultId));
  renderResultsList(eventId);
  toast('Hasil dihapus', 'error');
}

// ── PAYMENT SYSTEM ──────────────────────────────

function showPaymentModal(regId, eventId) {
  const ev = getEvents().find(e => e.id === eventId);
  const reg = getRegs().find(r => r.id === regId);
  const pay = getPayments().find(p => p.regId === regId);

  document.getElementById('pay-reg-name').textContent  = reg?.name || '—';
  document.getElementById('pay-event-name').textContent = ev?.name || '—';
  document.getElementById('pay-amount').textContent     = ev?.fee || 'Gratis';
  document.getElementById('pay-reg-id').value  = regId;
  document.getElementById('pay-event-id').value = eventId;

  const statusDiv = document.getElementById('pay-status-info');
  if (pay) {
    if (pay.status === 'verified') {
      statusDiv.innerHTML = `<div class="pay-status-box verified">✅ Pembayaran Terverifikasi</div>`;
      document.getElementById('pay-upload-section').style.display = 'none';
    } else if (pay.status === 'rejected') {
      statusDiv.innerHTML = `<div class="pay-status-box rejected">❌ Pembayaran Ditolak — Silakan upload ulang bukti bayar</div>`;
      document.getElementById('pay-upload-section').style.display = 'block';
    } else {
      statusDiv.innerHTML = `<div class="pay-status-box pending">⏳ Menunggu Verifikasi Admin</div>`;
      document.getElementById('pay-upload-section').style.display = 'block';
    }
  } else {
    statusDiv.innerHTML = '';
    document.getElementById('pay-upload-section').style.display = 'block';
  }

  document.getElementById('payment-modal').classList.add('open');
}

function submitPaymentProof() {
  const regId   = document.getElementById('pay-reg-id').value;
  const eventId = document.getElementById('pay-event-id').value;
  const ev      = getEvents().find(e => e.id === eventId);
  const fileEl  = document.getElementById('pay-bukti-input');

  const doSave = (buktiUrl) => {
    const payments = getPayments();
    const existing = payments.find(p => p.regId === regId);
    const obj = { regId, eventId, userId: currentUser?.id, amount: ev?.fee || '—', status: 'pending', buktiUrl, createdAt: Date.now(), verifiedAt: null };
    if (existing) { Object.assign(existing, { ...obj, id: existing.id }); }
    else { payments.unshift({ id: 'pay-' + Date.now(), ...obj }); }
    setPayments(payments);
    closeModal('payment-modal');
    toast('✓ Bukti bayar berhasil dikirim! Menunggu verifikasi admin.', 'success');
    if (typeof renderUserProfile === 'function') renderUserProfile();
  };

  if (fileEl.files[0]) {
    if (fileEl.files[0].size > 3 * 1024 * 1024) { toast('File maks 3MB', 'error'); return; }
    fileToBase64(fileEl.files[0]).then(doSave);
  } else {
    doSave(null);
  }
}

// Admin: verify/reject payment
function openAdminPayments() {
  renderAdminPayments();
  document.getElementById('admin-pay-modal').classList.add('open');
}

function renderAdminPayments() {
  const payments = getPayments();
  const regs  = getRegs(); const rm = {}; regs.forEach(r => { rm[r.id] = r; });
  const evts  = getEvents(); const em = {}; evts.forEach(e => { em[e.id] = e; });

  const filterStatus = document.getElementById('pay-filter-status')?.value || '';
  let pays = [...payments].sort((a,b) => b.createdAt - a.createdAt);
  if (filterStatus) pays = pays.filter(p => p.status === filterStatus);

  const tbody = document.getElementById('pay-tbody');
  if (!pays.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="td-empty">Tidak ada data pembayaran.</td></tr>`;
    return;
  }

  tbody.innerHTML = pays.map((p, i) => {
    const r = rm[p.regId]; const ev = em[p.eventId];
    return `<tr>
      <td>${i+1}</td>
      <td><strong>${r?.name || '—'}</strong><br><small style="color:var(--text-muted)">${r?.category || ''}</small></td>
      <td>${ev?.name?.substring(0,30) || '—'}…</td>
      <td><strong>${p.amount}</strong></td>
      <td>${payBadge(p.status)}</td>
      <td>${p.buktiUrl ? `<a href="${p.buktiUrl}" target="_blank" style="color:var(--blue);font-size:12px;font-weight:600">Lihat Bukti →</a>` : '<span style="color:var(--text-light);font-size:12px">Belum upload</span>'}</td>
      <td>
        ${p.status !== 'verified' ? `<button class="btn-sm" style="background:#dcfce7;color:#166534;border:none;padding:5px 10px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px" onclick="verifyPayment('${p.id}','verified')">✓ Verifikasi</button>` : ''}
        ${p.status !== 'rejected' ? `<button class="btn-sm btn-del" onclick="verifyPayment('${p.id}','rejected')" style="font-size:12px">✕ Tolak</button>` : ''}
      </td>
    </tr>`;
  }).join('');
}

function verifyPayment(payId, status) {
  const pays = getPayments();
  const pay = pays.find(p => p.id === payId);
  if (pay) { pay.status = status; pay.verifiedAt = Date.now(); setPayments(pays); }
  renderAdminPayments();
  toast(status === 'verified' ? '✓ Pembayaran diverifikasi' : '✕ Pembayaran ditolak', status === 'verified' ? 'success' : 'error');
}

// ── PUBLIC BRACKET VIEW (for users from event detail) ────────────

function viewPublicBrackets(eventId) {
  const ev = getEvents().find(e => e.id === eventId);
  if (!ev) return;
  document.getElementById('bkt-event-name').textContent = ev.name;
  document.getElementById('bkt-event-id').value = eventId;

  const brackets = getBrackets().filter(b => b.eventId === eventId);
  const regs = getRegs().filter(r => r.eventId === eventId);
  const cats = [...new Set(regs.map(r => r.category))].filter(Boolean);

  const catSel = document.getElementById('bkt-cat-select');
  catSel.innerHTML = `<option value="">— Pilih Kategori —</option>` +
    cats.map(c => {
      const hasBkt = brackets.find(b => b.category === c);
      return `<option value="${c}">${c}${hasBkt ? ' ✓' : ''}</option>`;
    }).join('');

  document.getElementById('bkt-content').innerHTML = `
    <div style="text-align:center;padding:30px;color:var(--text-muted)">
      <div style="font-size:48px;margin-bottom:12px">🏆</div>
      <p>Pilih kategori untuk melihat bagan pertandingan</p>
    </div>`;

  document.getElementById('bracket-modal').classList.add('open');
}
