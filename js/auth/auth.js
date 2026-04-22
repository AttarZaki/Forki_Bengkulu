'use strict';

function switchAuthTab(tab){
  const isL=tab==='login';
  document.getElementById('utab-login').classList.toggle('active',isL);
  document.getElementById('utab-register').classList.toggle('active',!isL);
  document.getElementById('form-login').style.display=isL?'flex':'none';
  document.getElementById('form-register').style.display=isL?'none':'flex';
  ['ul-error','ur-error','ur-success'].forEach(id=>{document.getElementById(id).style.display='none';});
}
function doUserLogin(){
  const u=document.getElementById('ul-username').value.trim().toLowerCase();
  const p=document.getElementById('ul-password').value;
  if(!u||!p){showAuthErr('ul-error','Harap isi username dan password.');return;}
  const acc=getUsers().find(x=>(x.username.toLowerCase()===u||x.email.toLowerCase()===u)&&x.password===p);
  if(!acc){showAuthErr('ul-error','Username / password salah.');return;}
  currentUser=acc; currentRole='user';
  sessionStorage.setItem('kc_session',JSON.stringify({id:acc.id,role:'user'}));
  enterUserApp();
}
function doUserRegister(){
  const name=document.getElementById('ur-name').value.trim();
  const uname=document.getElementById('ur-username').value.trim();
  const email=document.getElementById('ur-email').value.trim().toLowerCase();
  const pass=document.getElementById('ur-password').value;
  const pass2=document.getElementById('ur-password2').value;
  const phone=document.getElementById('ur-phone').value.trim();
  const dojo=document.getElementById('ur-dojo').value.trim();
  if(!name||!uname||!email||!pass||!pass2){showAuthErr('ur-error','Harap isi semua field wajib (*).');return;}
  if(uname.length<4){showAuthErr('ur-error','Username minimal 4 karakter.');return;}
  if(pass.length<6){showAuthErr('ur-error','Password minimal 6 karakter.');return;}
  if(pass!==pass2){showAuthErr('ur-error','Password tidak cocok.');return;}
  const users=getUsers();
  if(users.find(u=>u.username.toLowerCase()===uname.toLowerCase())){showAuthErr('ur-error','Username sudah digunakan.');return;}
  if(users.find(u=>u.email===email)){showAuthErr('ur-error','Email sudah terdaftar.');return;}
  users.push({id:'u-'+Date.now(),username:uname,email,password:pass,name,phone,dojo,createdAt:Date.now()});
  setUsers(users);
  document.getElementById('ur-success').style.display='block';
  setTimeout(()=>switchAuthTab('login'),1800);
}
function doAdminLogin(){
  const u=document.getElementById('al-username').value.trim();
  const p=document.getElementById('al-password').value;
  if(u===ADMIN_ACCOUNT.username&&p===ADMIN_ACCOUNT.password){
    currentUser={name:'Administrator',username:'admin'}; currentRole='admin';
    sessionStorage.setItem('kc_session',JSON.stringify({id:'admin',role:'admin'}));
    enterAdminApp();
  } else { document.getElementById('al-error').style.display='block'; }
}
function doLogout(){
  currentUser=null; currentRole=null;
  sessionStorage.removeItem('kc_session'); goLanding();
}
function tryRestoreSession(){
  const raw=sessionStorage.getItem('kc_session'); if(!raw) return;
  try{
    const {id,role}=JSON.parse(raw);
    if(role==='admin'){currentUser={name:'Administrator',username:'admin'};currentRole='admin';}
    else{const u=getUsers().find(x=>x.id===id);if(u){currentUser=u;currentRole='user';}}
  }catch(e){}
}
function showAuthErr(id,msg){const el=document.getElementById(id);el.textContent='⚠️ '+msg;el.style.display='block';}
