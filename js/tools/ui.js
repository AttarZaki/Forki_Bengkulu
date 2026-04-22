'use strict';

/* ══════════════════════════════════════════════
   ui.js — Scroll Reveal · View Toggle · Lightbox
══════════════════════════════════════════════ */

/* ── VIEW TOGGLE (grid / list) ─────────────────────── */
let _viewMode = localStorage.getItem('kc_view') || 'grid'; // 'grid' | 'list'

function initViewToggle() {
  _viewMode = localStorage.getItem('kc_view') || 'grid';
  _applyViewBtn();
}

function toggleViewMode() {
  _viewMode = _viewMode === 'grid' ? 'list' : 'grid';
  localStorage.setItem('kc_view', _viewMode);
  _applyViewBtn();
  // Re-render whichever grid is visible
  if (document.getElementById('lp-event-grid')?.offsetParent !== null) renderLandingGrid();
  if (document.getElementById('ua-event-grid')?.offsetParent !== null) renderUserGrid();
}

function _applyViewBtn() {
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.textContent = _viewMode === 'grid' ? '☰ List' : '⊞ Grid';
    btn.title = _viewMode === 'grid' ? 'Tampilan List' : 'Tampilan Grid';
  });
}

function getViewMode() { return _viewMode; }

/* ── SCROLL REVEAL ─────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  // Observe all reveal targets
  function observeAll() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (!el.classList.contains('revealed')) observer.observe(el);
    });
  }
  observeAll();

  // Re-observe after dynamic content renders
  const mutation = new MutationObserver(observeAll);
  mutation.observe(document.body, { childList: true, subtree: true });
}

/* ── LIGHTBOX ──────────────────────────────────────── */
let _lbImages = [];
let _lbIndex  = 0;

function openLightbox(images, startIndex) {
  _lbImages = images;
  _lbIndex  = startIndex || 0;
  _renderLightbox();
  document.getElementById('lightbox').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
  document.body.style.overflow = '';
}

function lbNext() {
  _lbIndex = (_lbIndex + 1) % _lbImages.length;
  _renderLightbox();
}

function lbPrev() {
  _lbIndex = (_lbIndex - 1 + _lbImages.length) % _lbImages.length;
  _renderLightbox();
}

function _renderLightbox() {
  const img   = _lbImages[_lbIndex];
  const total = _lbImages.length;
  document.getElementById('lb-img').src = img.url;
  document.getElementById('lb-caption').textContent = img.caption || '';
  document.getElementById('lb-counter').textContent = `${_lbIndex + 1} / ${total}`;
  document.getElementById('lb-prev').style.display = total > 1 ? 'flex' : 'none';
  document.getElementById('lb-next').style.display = total > 1 ? 'flex' : 'none';
}

// Keyboard navigation
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || lb.style.display === 'none') return;
  if (e.key === 'ArrowRight') lbNext();
  if (e.key === 'ArrowLeft')  lbPrev();
  if (e.key === 'Escape')     closeLightbox();
});

/* ── PROVINCE STATS (Bengkulu data) ────────────────── */
function renderProvinceStats() {
  const el = document.getElementById('province-stats-wrap');
  if (!el) return;

  const evts = getPublished();
  const regs = getRegs();

  // Count by kabupaten
  const kabMap = {};
  KABUPATEN.filter(k => k !== 'Semua Wilayah').forEach(k => { kabMap[k] = 0; });
  evts.forEach(e => { if (e.kabupaten && kabMap[e.kabupaten] !== undefined) kabMap[e.kabupaten]++; });

  // Top 5 kabupaten by event count
  const topKab = Object.entries(kabMap)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalAtlet   = new Set(regs.map(r => r.userId)).size + regs.length; // unique + registrations
  const totalDojo    = new Set(regs.map(r => r.dojo).filter(Boolean)).size;
  const totalKab     = Object.values(kabMap).filter(n => n > 0).length;

  el.innerHTML = `
    <div class="prov-stat-cards reveal reveal-up">
      <div class="prov-stat-card">
        <div class="prov-stat-num">${evts.length}</div>
        <div class="prov-stat-lbl">Event Aktif</div>
      </div>
      <div class="prov-stat-card">
        <div class="prov-stat-num">${regs.length}</div>
        <div class="prov-stat-lbl">Total Pendaftar</div>
      </div>
      <div class="prov-stat-card">
        <div class="prov-stat-num">${totalDojo || '10+'}</div>
        <div class="prov-stat-lbl">Dojo Terdaftar</div>
      </div>
      <div class="prov-stat-card">
        <div class="prov-stat-num">${totalKab || 5}</div>
        <div class="prov-stat-lbl">Kabupaten/Kota</div>
      </div>
    </div>

    ${topKab.length ? `
    <div class="prov-kab-list reveal reveal-up">
      ${topKab.map(([kab, cnt]) => `
        <div class="prov-kab-row">
          <span class="prov-kab-name">📍 ${kab}</span>
          <div class="prov-kab-bar-wrap">
            <div class="prov-kab-bar" style="width:${Math.round((cnt/Math.max(...topKab.map(x=>x[1])))*100)}%"></div>
          </div>
          <span class="prov-kab-cnt">${cnt} event</span>
        </div>`).join('')}
    </div>` : ''}`;

  // Trigger reveal on newly added elements
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      el.classList.add('revealed');
    });
  }, 100);
}

/* ── INIT ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initViewToggle();
});
