'use strict';

/* ══════════════════════════════════════════════
   gallery.js — Galeri Foto per Event (JPG only)
   Admin: upload multiple, reorder, delete
   Public: lightbox fullscreen view
══════════════════════════════════════════════ */

/* ── STORAGE ───────────────────────────────────────── */
function getGalleries()    { return JSON.parse(localStorage.getItem('kc_galleries') || '{}'); }
function setGalleries(d)   { localStorage.setItem('kc_galleries', JSON.stringify(d)); }

function getEventGallery(evtId) {
  return getGalleries()[evtId] || [];
}
function setEventGallery(evtId, photos) {
  const all = getGalleries();
  all[evtId] = photos;
  setGalleries(all);
}

/* ── OPEN GALLERY MODAL ────────────────────────────── */
function openGalleryModal(evtId) {
  const evt = getEvents().find(e => e.id === evtId);
  if (!evt) return;

  document.getElementById('gal-modal-event-name').textContent = evt.name;
  document.getElementById('gal-event-id').value = evtId;
  renderGallery(evtId);
  openModal('modal-gallery');
}

/* ── RENDER GALLERY (admin + public) ──────────────── */
function renderGallery(evtId) {
  const photos  = getEventGallery(evtId);
  const isAdmin = currentRole === 'admin';
  const el      = document.getElementById('gal-content');

  if (!photos.length) {
    el.innerHTML = `
      <div class="gal-empty">
        <div style="font-size:48px;margin-bottom:12px">🖼️</div>
        <p>${isAdmin ? 'Belum ada foto. Upload di bawah.' : 'Belum ada foto dokumentasi.'}</p>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="gal-grid">
        ${photos.map((p, i) => `
          <div class="gal-item" onclick="openLightbox(${JSON.stringify(
            photos.map(x => ({ url: x.url, caption: x.caption || '' }))
          )},${i})">
            <img src="${p.url}" alt="${p.caption || 'Foto ' + (i+1)}" loading="lazy"/>
            ${p.caption ? `<div class="gal-caption">${p.caption}</div>` : ''}
            ${isAdmin ? `<button class="gal-del-btn" onclick="event.stopPropagation();deleteGalleryPhoto('${evtId}',${i})" title="Hapus">✕</button>` : ''}
          </div>`).join('')}
      </div>`;
  }

  // Upload area (admin only)
  const uploadEl = document.getElementById('gal-upload-section');
  if (uploadEl) uploadEl.style.display = isAdmin ? 'block' : 'none';

  // Show count
  const countEl = document.getElementById('gal-count');
  if (countEl) countEl.textContent = `${photos.length}/20 foto`;
}

/* ── ADMIN: HANDLE UPLOAD ──────────────────────────── */
async function handleGalleryUpload(input) {
  const evtId = document.getElementById('gal-event-id').value;
  const files = Array.from(input.files);
  const errEl = document.getElementById('gal-upload-err');
  errEl.style.display = 'none';

  if (!files.length) return;

  const photos = getEventGallery(evtId);

  if (photos.length + files.length > 20) {
    errEl.textContent = `⚠️ Maks. 20 foto. Saat ini ${photos.length} foto, Anda upload ${files.length}.`;
    errEl.style.display = 'block';
    input.value = '';
    return;
  }

  // Validate all JPG
  for (const f of files) {
    const v = validateJPG(f);
    if (!v.ok) {
      errEl.textContent = `⚠️ "${f.name}": ${v.msg}`;
      errEl.style.display = 'block';
      input.value = '';
      return;
    }
  }

  // Convert all to base64
  toast('⏳ Mengupload foto…');
  for (const f of files) {
    const b64 = await fileToBase64(f);
    photos.push({ url: b64, caption: '', uploadedAt: Date.now() });
  }

  setEventGallery(evtId, photos);
  input.value = '';
  renderGallery(evtId);
  toast(`✓ ${files.length} foto berhasil diupload`, 'success');
}

/* ── ADMIN: DELETE PHOTO ───────────────────────────── */
function deleteGalleryPhoto(evtId, index) {
  showConfirm('Hapus Foto', 'Hapus foto ini dari galeri?', () => {
    const photos = getEventGallery(evtId);
    photos.splice(index, 1);
    setEventGallery(evtId, photos);
    renderGallery(evtId);
    toast('Foto dihapus', 'error');
  });
}

/* ── MINI GALLERY PREVIEW (in event detail) ────────── */
function buildGalleryPreview(evtId) {
  const photos = getEventGallery(evtId);
  if (!photos.length) return '';

  const preview = photos.slice(0, 4);
  const more    = photos.length - 4;

  return `
    <div class="detail-gallery-preview">
      <div class="detail-sec-title">🖼️ Galeri Foto <span style="font-size:12px;font-weight:400;color:var(--text-muted)">(${photos.length} foto)</span></div>
      <div class="gal-preview-grid">
        ${preview.map((p, i) => `
          <div class="gal-preview-item ${i === 3 && more > 0 ? 'gal-preview-more' : ''}"
            onclick="openLightbox(${JSON.stringify(photos.map(x=>({url:x.url,caption:x.caption||''})))},${i})">
            <img src="${p.url}" alt="foto ${i+1}" loading="lazy"/>
            ${i === 3 && more > 0 ? `<div class="gal-more-overlay">+${more}</div>` : ''}
          </div>`).join('')}
      </div>
      <button class="btn-link" style="margin-top:8px" onclick="closeModal('modal-detail');openGalleryModal('${evtId}')">
        Lihat semua ${photos.length} foto →
      </button>
    </div>`;
}
