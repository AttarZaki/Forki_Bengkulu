'use strict';

/* ══════════════════════════════════════════════════════
   extras.js
   1. Google Maps embed per event
   2. Shareable public URL
   3. Lampiran dokumen (PDF/doc download link)
   4. Weigh-in (timbang badan resmi kumite)
   5. Seeding peserta sebelum generate bracket
══════════════════════════════════════════════════════ */

/* ── 1. MAPS HELPER ─────────────────────────────────── */
function buildMapsEmbed(locationStr) {
  if (!locationStr) return '';
  const q = encodeURIComponent(locationStr + ', Bengkulu, Indonesia');
  return `
    <div class="detail-map-section">
      <div class="di-lbl" style="margin-bottom:8px">📍 Peta Lokasi</div>
      <div class="map-embed-wrap">
        <iframe
          src="https://maps.google.com/maps?q=${q}&z=15&output=embed"
          allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
      <a class="map-directions-link"
        href="https://maps.google.com/maps?q=${q}" target="_blank" rel="noopener">
        🗺️ Buka di Google Maps →
      </a>
    </div>`;
}

/* ── 2. SHAREABLE PUBLIC URL ────────────────────────── */
function getEventPublicURL(evtId) {
  const base = window.location.href.split('#')[0].split('?')[0];
  return `${base}?event=${evtId}`;
}

function copyEventURL(evtId) {
  const url = getEventPublicURL(evtId);
  navigator.clipboard.writeText(url).then(() => {
    toast('✓ Link event disalin ke clipboard!', 'success');
  }).catch(() => {
    // Fallback untuk browser yang tidak support clipboard API
    const el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    toast('✓ Link event disalin!', 'success');
  });
}

function shareEventWA(evtId) {
  const evt = getEvents().find(e => e.id === evtId);
  if (!evt) return;
  const url  = getEventPublicURL(evtId);
  const text = `🥋 *${evt.name}*\n\n📅 ${fmtFull(evt.dateStart)} – ${fmtFull(evt.dateEnd)}\n📍 ${evt.location}\n💰 ${evt.fee || 'Gratis'}\n\nInfo & Daftar:\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

/* Baca parameter ?event= saat halaman dibuka */
function checkDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const evtId  = params.get('event');
  if (evtId) {
    const evt = getEvents().find(e => e.id === evtId && e.published);
    if (evt) {
      // Buka detail event otomatis setelah halaman siap
      setTimeout(() => openEventDetail(evtId), 600);
    }
  }
}

/* ── 3. LAMPIRAN DOKUMEN ────────────────────────────── */
function getEventDocs(evtId)        { return JSON.parse(localStorage.getItem('kc_docs') || '{}')[evtId] || []; }
function setEventDocs(evtId, docs)  {
  const all = JSON.parse(localStorage.getItem('kc_docs') || '{}');
  all[evtId] = docs;
  localStorage.setItem('kc_docs', JSON.stringify(all));
}

function openDocsModal(evtId) {
  const evt = getEvents().find(e => e.id === evtId);
  if (!evt) return;
  document.getElementById('docs-modal-event-name').textContent = evt.name;
  document.getElementById('docs-event-id').value = evtId;
  renderDocsList(evtId);
  const uploadSec = document.getElementById('docs-upload-section');
  if (uploadSec) uploadSec.style.display = currentRole === 'admin' ? 'block' : 'none';
  openModal('modal-docs');
}

function renderDocsList(evtId) {
  const docs    = getEventDocs(evtId);
  const isAdmin = currentRole === 'admin';
  const el      = document.getElementById('docs-list');

  if (!docs.length) {
    el.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted)">
      <div style="font-size:36px;margin-bottom:8px">📄</div>
      <p>${isAdmin ? 'Belum ada dokumen. Upload di bawah.' : 'Belum ada dokumen yang dilampirkan.'}</p>
    </div>`;
    return;
  }

  el.innerHTML = docs.map((d, i) => `
    <div class="doc-row">
      <span class="doc-icon">${_docIcon(d.type)}</span>
      <div class="doc-info">
        <div class="doc-name">${d.name}</div>
        <div class="doc-meta">${d.type.toUpperCase()} &nbsp;•&nbsp; ${_formatBytes(d.size)} &nbsp;•&nbsp; ${timeAgo(d.uploadedAt)}</div>
      </div>
      <div class="doc-actions">
        <a class="btn-sm btn-edit" href="${d.url}" download="${d.name}" style="text-decoration:none;display:inline-flex;align-items:center">⬇️ Unduh</a>
        ${isAdmin ? `<button class="btn-sm btn-del" onclick="deleteDoc('${evtId}',${i})">Hapus</button>` : ''}
      </div>
    </div>`).join('');
}

function _docIcon(type) {
  if (type === 'pdf') return '📕';
  if (['doc','docx'].includes(type)) return '📘';
  if (['xls','xlsx'].includes(type)) return '📗';
  return '📄';
}
function _formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(1) + ' MB';
}

async function handleDocUpload(input) {
  const evtId = document.getElementById('docs-event-id').value;
  const file  = input.files[0];
  const errEl = document.getElementById('docs-upload-err');
  errEl.style.display = 'none';

  if (!file) return;

  const allowed = ['pdf','doc','docx','xls','xlsx','png','jpg','jpeg'];
  const ext     = file.name.split('.').pop().toLowerCase();
  if (!allowed.includes(ext)) {
    errEl.textContent = '⚠️ Format tidak didukung. Gunakan: PDF, DOC, DOCX, XLS, XLSX, gambar.';
    errEl.style.display = 'block'; input.value = ''; return;
  }
  if (file.size > 10 * 1024 * 1024) {
    errEl.textContent = '⚠️ Ukuran file maks. 10MB.';
    errEl.style.display = 'block'; input.value = ''; return;
  }

  const docs = getEventDocs(evtId);
  if (docs.length >= 10) {
    errEl.textContent = '⚠️ Maks. 10 dokumen per event.';
    errEl.style.display = 'block'; input.value = ''; return;
  }

  toast('⏳ Mengupload dokumen…');
  const b64 = await fileToBase64(file);
  docs.push({ name: file.name, type: ext, size: file.size, url: b64, uploadedAt: Date.now() });
  setEventDocs(evtId, docs);
  input.value = '';
  renderDocsList(evtId);
  toast('✓ Dokumen berhasil diupload', 'success');
}

function deleteDoc(evtId, index) {
  showConfirm('Hapus Dokumen', 'Hapus dokumen ini?', () => {
    const docs = getEventDocs(evtId);
    docs.splice(index, 1);
    setEventDocs(evtId, docs);
    renderDocsList(evtId);
    toast('Dokumen dihapus', 'error');
  });
}

/* Build inline doc preview for event detail */
function buildDocsPreview(evtId) {
  const docs = getEventDocs(evtId);
  if (!docs.length) return '';
  return `
    <div class="detail-docs-section">
      <div class="detail-sec-title" style="margin-bottom:10px">📎 Dokumen & Lampiran
        <span style="font-size:12px;font-weight:400;color:var(--text-muted)">(${docs.length} file)</span>
      </div>
      <div class="docs-inline-list">
        ${docs.map(d => `
          <a class="doc-inline-item" href="${d.url}" download="${d.name}">
            <span style="font-size:18px">${_docIcon(d.type)}</span>
            <span class="doc-inline-name">${d.name}</span>
            <span class="doc-inline-size">${_formatBytes(d.size)}</span>
          </a>`).join('')}
      </div>
      <button class="btn-link" style="margin-top:6px;font-size:12px" onclick="closeModal('modal-detail');openDocsModal('${evtId}')">
        Lihat semua dokumen →
      </button>
    </div>`;
}

/* ── 4. WEIGH-IN ────────────────────────────────────── */

function openWeighinModal(evtId) {
  const evt = getEvents().find(e => e.id === evtId);
  if (!evt) return;
  document.getElementById('wi-event-name').textContent = evt.name;
  document.getElementById('wi-event-id').value = evtId;

  // Isi dropdown peserta kumite
  const regs = getRegs().filter(r => r.eventId === evtId && r.status !== 'rejected' && r.category.toLowerCase().includes('kumite'));
  const sel  = document.getElementById('wi-participant');
  sel.innerHTML = `<option value="">— Pilih Peserta Kumite —</option>` +
    regs.map(r => `<option value="${r.id}">${r.name} — ${r.category}</option>`).join('');

  document.getElementById('wi-weight-input').value = '';
  document.getElementById('wi-result-badge').style.display = 'none';
  renderWeighinTable(evtId);
  openModal('modal-weighin');
}

function onWeighinParticipantChange() {
  const regId = document.getElementById('wi-participant').value;
  const badge = document.getElementById('wi-result-badge');
  const prev  = getWeighins().find(w => w.regId === regId);
  if (prev) {
    document.getElementById('wi-weight-input').value = prev.weight;
    badge.textContent = `Tercatat sebelumnya: ${prev.weight} kg`;
    badge.className = 'wi-badge wi-prev';
    badge.style.display = 'inline-block';
  } else {
    document.getElementById('wi-weight-input').value = '';
    badge.style.display = 'none';
  }
}

function saveWeighin() {
  const evtId   = document.getElementById('wi-event-id').value;
  const regId   = document.getElementById('wi-participant').value;
  const weight  = parseFloat(document.getElementById('wi-weight-input').value);
  const errEl   = document.getElementById('wi-error');

  if (!regId)              { errEl.textContent = '⚠️ Pilih peserta'; errEl.style.display='block'; return; }
  if (!weight || weight<10){ errEl.textContent = '⚠️ Masukkan berat yang valid'; errEl.style.display='block'; return; }
  errEl.style.display = 'none';

  const reg       = getRegs().find(r => r.id === regId);
  const limitKg   = _parseCategoryWeight(reg?.category);
  const isOver    = limitKg && weight > limitKg;

  const weighins  = getWeighins().filter(w => w.regId !== regId);
  weighins.push({ id:'wi-'+Date.now(), evtId, regId, weight, limitKg, isOver, recordedAt: Date.now() });
  setWeighins(weighins);

  // Show immediate feedback
  const badge = document.getElementById('wi-result-badge');
  if (isOver) {
    badge.textContent = `⚠️ OVERWEIGHT! ${weight} kg > limit ${limitKg} kg`;
    badge.className = 'wi-badge wi-over';
    toast(`⚠️ ${reg?.name} OVERWEIGHT (${weight} kg, limit ${limitKg} kg)`, 'error');
  } else {
    badge.textContent = `✓ Lulus: ${weight} kg${limitKg ? ` (limit ${limitKg} kg)` : ''}`;
    badge.className = 'wi-badge wi-ok';
    toast(`✓ ${reg?.name} lulus timbang: ${weight} kg`, 'success');
  }
  badge.style.display = 'inline-block';
  renderWeighinTable(evtId);
}

function _parseCategoryWeight(category) {
  if (!category) return null;
  const m = category.match(/([+\-])(\d+)kg/i);
  if (!m) return null;
  return m[1] === '+' ? null : parseFloat(m[2]);
}

function renderWeighinTable(evtId) {
  const weighins = getWeighins().filter(w => w.evtId === evtId);
  const regMap   = {}; getRegs().forEach(r => { regMap[r.id] = r; });
  const el       = document.getElementById('wi-table-body');

  if (!weighins.length) {
    el.innerHTML = `<tr><td colspan="5" class="td-empty">Belum ada data timbang.</td></tr>`;
    return;
  }

  el.innerHTML = [...weighins].sort((a,b) => b.recordedAt - a.recordedAt).map(w => {
    const r = regMap[w.regId];
    return `<tr class="${w.isOver ? 'wi-row-over' : ''}">
      <td><strong>${r?.name || '—'}</strong></td>
      <td><span class="cat-badge-sm">${r?.category || '—'}</span></td>
      <td><strong>${w.weight} kg</strong></td>
      <td>${w.limitKg ? w.limitKg + ' kg' : '—'}</td>
      <td>${w.isOver
        ? '<span class="wi-badge wi-over">⚠️ Overweight</span>'
        : '<span class="wi-badge wi-ok">✓ Lulus</span>'}</td>
    </tr>`;
  }).join('');
}

/* Export weigh-in to CSV */
function exportWeighinCSV(evtId) {
  const evt      = getEvents().find(e => e.id === evtId);
  const weighins = getWeighins().filter(w => w.evtId === evtId);
  const regMap   = {}; getRegs().forEach(r => { regMap[r.id] = r; });
  const header   = ['Nama','Kategori','Berat (kg)','Limit (kg)','Status','Waktu'];
  const rows     = weighins.map(w => {
    const r = regMap[w.regId];
    return [r?.name||'—', r?.category||'—', w.weight, w.limitKg||'—', w.isOver?'Overweight':'Lulus', new Date(w.recordedAt).toLocaleString('id-ID')];
  });
  downloadCSV([header, ...rows], `weighin_${evt?.name||evtId}.csv`);
  toast('✓ Data timbang diekspor', 'success');
}

/* ── 5. SEEDING ─────────────────────────────────────── */
let _seedingEvtId  = null;
let _seedingCat    = null;

function openSeedingModal(evtId, category) {
  _seedingEvtId = evtId;
  _seedingCat   = category;
  const evt     = getEvents().find(e => e.id === evtId);
  document.getElementById('seed-event-name').textContent = evt?.name || '—';
  document.getElementById('seed-cat-name').textContent   = category;
  renderSeedingList(evtId, category);
  openModal('modal-seeding');
}

function renderSeedingList(evtId, category) {
  const regs     = getRegs().filter(r => r.eventId === evtId && r.category === category && r.status !== 'rejected');
  const seeds    = getSeedMap(evtId, category);
  const el       = document.getElementById('seed-list');

  if (!regs.length) {
    el.innerHTML = '<div class="empty-mini">Tidak ada peserta terdaftar di kategori ini.</div>';
    return;
  }

  el.innerHTML = regs.map(r => {
    const s = seeds[r.id] || '';
    return `
      <div class="seed-row">
        <div class="seed-info">
          <div class="seed-name">${r.name}</div>
          <div class="seed-dojo">${r.dojo || '—'}</div>
        </div>
        <div class="seed-input-wrap">
          <label style="font-size:11px;color:var(--text-muted);margin-bottom:3px;display:block">Nomor Unggulan</label>
          <input type="number" class="seed-num-input" min="1" max="${regs.length}"
            id="seed-${r.id}" value="${s}" placeholder="—"
            onchange="updateSeed('${r.id}',this.value)"/>
        </div>
        ${s ? `<span class="seed-badge">🎯 #${s}</span>` : '<span class="seed-empty">Belum diseeded</span>'}
      </div>`;
  }).join('');
}

function updateSeed(regId, value) {
  const seeds = getSeedMap(_seedingEvtId, _seedingCat);
  if (value && parseInt(value) > 0) seeds[regId] = parseInt(value);
  else delete seeds[regId];
  saveSeedMap(_seedingEvtId, _seedingCat, seeds);
  // Refresh display (don't full re-render to keep focus)
}

function getSeedMap(evtId, category) {
  const all = JSON.parse(localStorage.getItem('kc_seeds') || '{}');
  return all[`${evtId}__${category}`] || {};
}

function saveSeedMap(evtId, category, seeds) {
  const all = JSON.parse(localStorage.getItem('kc_seeds') || '{}');
  all[`${evtId}__${category}`] = seeds;
  localStorage.setItem('kc_seeds', JSON.stringify(all));
}

function clearSeeding() {
  saveSeedMap(_seedingEvtId, _seedingCat, {});
  renderSeedingList(_seedingEvtId, _seedingCat);
  toast('Seeding dihapus', 'error');
}

/* Used by bracket generator — sort by seed before shuffle */
function applySeeding(evtId, category, participants) {
  const seeds = getSeedMap(evtId, category);
  if (!Object.keys(seeds).length) return participants; // no seeding, return as-is

  // Separate seeded vs unseeded
  const seeded   = [];
  const unseeded = [];
  participants.forEach(p => {
    if (p && seeds[p.regId]) seeded.push({ ...p, _seed: seeds[p.regId] });
    else                     unseeded.push(p);
  });

  // Sort seeded by number
  seeded.sort((a, b) => a._seed - b._seed);

  // Place seeds at specific bracket positions (1st, last, middle) 
  const size    = participants.length;
  const result  = new Array(size).fill(null);
  const positions = _seedPositions(size, seeded.length);

  seeded.forEach((p, i) => {
    if (positions[i] !== undefined) result[positions[i]] = p;
  });

  // Fill remaining slots with unseeded (shuffled)
  const shuffledUnseeded = [...unseeded].sort(() => Math.random() - 0.5);
  let ui = 0;
  for (let i = 0; i < size; i++) {
    if (!result[i] && ui < shuffledUnseeded.length) {
      result[i] = shuffledUnseeded[ui++];
    }
  }

  return result;
}

/* Standard seeding positions: 1st seed top, 2nd seed bottom, 3rd/4th middle */
function _seedPositions(size, numSeeds) {
  const positions = {};
  if (numSeeds >= 1) positions[0] = 0;
  if (numSeeds >= 2) positions[1] = size - 1;
  if (numSeeds >= 3) positions[2] = Math.floor(size / 4);
  if (numSeeds >= 4) positions[3] = Math.floor(3 * size / 4);
  return positions;
}
