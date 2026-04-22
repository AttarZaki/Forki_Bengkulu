/* ═══════════════════════════════════════════════
   KarateChamp Bengkulu — auth.js
   Authentication: login, register, logout
═══════════════════════════════════════════════ */

'use strict';

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('utab-login').classList.toggle('active', isLogin);
  document.getElementById('utab-register').classList.toggle('active', !isLogin);
  document.getElementById('user-login-form').style.display    = isLogin ? 'block' : 'none';
  document.getElementById('user-register-form').style.display = isLogin ? 'none'  : 'block';
  document.getElementById('ul-error').style.display  = 'none';
  document.getElementById('ur-error').style.display  = 'none';
  document.getElementById('ur-success').style.display = 'none';
}

function doUserLogin() {
  const u = document.getElementById('ul-username').value.trim().toLowerCase();
  const p = document.getElementById('ul-password').value;
  if (!u || !p) { showAuthError('ul-error', 'Harap isi username dan password.'); return; }
  const users = getUsers();
  const acc = users.find(a => (a.username.toLowerCase() === u || a.email.toLowerCase() === u) && a.password === p);
  if (!acc) { showAuthError('ul-error', 'Username / password salah.'); return; }
  currentUser = acc;
  currentRole = 'user';
  sessionStorage.setItem('kc_session', JSON.stringify({ id: acc.id, role: 'user' }));
  enterUserApp();
}

function doUserRegister() {
  const name  = document.getElementById('ur-name').value.trim();
  const uname = document.getElementById('ur-username').value.trim();
  const email = document.getElementById('ur-email').value.trim().toLowerCase();
  const pass  = document.getElementById('ur-password').value;
  const pass2 = document.getElementById('ur-password2').value;
  const phone = document.getElementById('ur-phone').value.trim();
  const dojo  = document.getElementById('ur-dojo').value.trim();

  if (!name || !uname || !email || !pass || !pass2) {
    showAuthError('ur-error', 'Harap isi semua field wajib (*).');
    return;
  }
  if (uname.length < 4) { showAuthError('ur-error', 'Username minimal 4 karakter.'); return; }
  if (pass.length < 6)  { showAuthError('ur-error', 'Password minimal 6 karakter.'); return; }
  if (pass !== pass2)   { showAuthError('ur-error', 'Password dan konfirmasi tidak cocok.'); return; }

  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === uname.toLowerCase())) {
    showAuthError('ur-error', 'Username sudah digunakan.'); return;
  }
  if (users.find(u => u.email === email)) {
    showAuthError('ur-error', 'Email sudah terdaftar.'); return;
  }

  const newUser = {
    id: 'u-' + Date.now(),
    username: uname, email, password: pass,
    name, phone, dojo,
    createdAt: Date.now()
  };
  users.push(newUser);
  setUsers(users);
  document.getElementById('ur-error').style.display  = 'none';
  document.getElementById('ur-success').style.display = 'block';
  setTimeout(() => switchAuthTab('login'), 1500);
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = '⚠️ ' + msg;
  el.style.display = 'block';
}

function doAdminLogin() {
  const u = document.getElementById('al-username').value.trim();
  const p = document.getElementById('al-password').value;
  if (u === ADMIN_ACCOUNT.username && p === ADMIN_ACCOUNT.password) {
    currentUser = { name: 'Administrator', username: 'admin' };
    currentRole = 'admin';
    sessionStorage.setItem('kc_session', JSON.stringify({ id: 'admin', role: 'admin' }));
    enterAdminApp();
  } else {
    document.getElementById('al-error').style.display = 'block';
  }
}

function doLogout() {
  currentUser = null;
  currentRole = null;
  sessionStorage.removeItem('kc_session');
  goLanding();
}

function tryRestoreSession() {
  const s = sessionStorage.getItem('kc_session');
  if (!s) return;
  try {
    const { id, role } = JSON.parse(s);
    if (role === 'admin') {
      currentUser = { name: 'Administrator', username: 'admin' };
      currentRole = 'admin';
    } else {
      const users = getUsers();
      const u = users.find(u => u.id === id);
      if (u) { currentUser = u; currentRole = 'user'; }
    }
  } catch(e) {}
}
