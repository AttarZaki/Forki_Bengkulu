'use strict';

/* ── USERS ─────────────────────────────────────────── */
function getUsers() {
  const raw = localStorage.getItem('kc_users');
  if (!raw) {
    const d = [{ id:'u-demo', username:'user', email:'user@demo.com', password:'user123',
      name:'Peserta Demo', phone:'082177889900', dojo:'Dojo Rafflesia Bengkulu', createdAt:Date.now() }];
    setUsers(d); return d;
  }
  return JSON.parse(raw);
}
function setUsers(d) { localStorage.setItem('kc_users', JSON.stringify(d)); }

/* ── EVENTS ─────────────────────────────────────────── */
function getEvents()     { const r=localStorage.getItem('kc_events'); if(!r){setEvents(SEED_EVENTS);return SEED_EVENTS;} return JSON.parse(r); }
function setEvents(d)    { localStorage.setItem('kc_events', JSON.stringify(d)); }
function getPublished()  { return getEvents().filter(e=>e.published); }

/* ── REGISTRATIONS ──────────────────────────────────── */
function getRegs()       { const r=localStorage.getItem('kc_regs'); if(!r){setRegs(SEED_REGS);return SEED_REGS;} return JSON.parse(r); }
function setRegs(d)      { localStorage.setItem('kc_regs', JSON.stringify(d)); }
function regCount(id)    { return getRegs().filter(r=>r.eventId===id).length; }
function approvedRegCount(id) { return getRegs().filter(r=>r.eventId===id && r.status!=='rejected').length; }

/* ── RESULTS ────────────────────────────────────────── */
function getResults()    { const r=localStorage.getItem('kc_results'); if(!r){setResults(SEED_RESULTS);return SEED_RESULTS;} return JSON.parse(r); }
function setResults(d)   { localStorage.setItem('kc_results', JSON.stringify(d)); }

/* ── PAYMENTS ───────────────────────────────────────── */
function getPayments()   { const r=localStorage.getItem('kc_payments'); if(!r){setPayments(SEED_PAYMENTS);return SEED_PAYMENTS;} return JSON.parse(r); }
function setPayments(d)  { localStorage.setItem('kc_payments', JSON.stringify(d)); }

/* ── BRACKETS ───────────────────────────────────────── */
function getBrackets()   { return JSON.parse(localStorage.getItem('kc_brackets')||'[]'); }
function setBrackets(d)  { localStorage.setItem('kc_brackets', JSON.stringify(d)); }

/* ── TATAMI ─────────────────────────────────────────── */
function getTatami()     { const r=localStorage.getItem('kc_tatami'); if(!r){setTatami(SEED_TATAMI);return SEED_TATAMI;} return JSON.parse(r); }
function setTatami(d)    { localStorage.setItem('kc_tatami', JSON.stringify(d)); }

/* ── WEIGHINS ───────────────────────────────────────── */
function getWeighins()   { const r=localStorage.getItem('kc_weighins'); if(!r){setWeighins(SEED_WEIGHINS);return SEED_WEIGHINS;} return JSON.parse(r); }
function setWeighins(d)  { localStorage.setItem('kc_weighins', JSON.stringify(d)); }

/* ── ANNOUNCEMENTS ──────────────────────────────────── */
function getAnnouncements()  { const r=localStorage.getItem('kc_ann'); if(!r){setAnnouncements(SEED_ANNOUNCEMENTS);return SEED_ANNOUNCEMENTS;} return JSON.parse(r); }
function setAnnouncements(d) { localStorage.setItem('kc_ann', JSON.stringify(d)); }

/* ── CHECK-INS ──────────────────────────────────────── */
function getCheckins()   { return JSON.parse(localStorage.getItem('kc_checkins')||'[]'); }
function setCheckins(d)  { localStorage.setItem('kc_checkins', JSON.stringify(d)); }

/* ── RESET ──────────────────────────────────────────── */
function resetAllData() {
  ['kc_users','kc_events','kc_regs','kc_results','kc_payments',
   'kc_brackets','kc_tatami','kc_ann','kc_checkins',
   'kc_galleries','kc_docs','kc_weighins','kc_seeds'].forEach(k=>localStorage.removeItem(k));
}
