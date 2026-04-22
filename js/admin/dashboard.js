'use strict';
let _cReg=null,_cStat=null,_cCat=null;

function renderDashboard(){
  const evts=getEvents(); const regs=getRegs(); const pays=getPayments();
  const openCnt=evts.filter(e=>e.status==='open').length;
  const soonCnt=evts.filter(e=>e.status==='soon').length;
  const pendPay=pays.filter(p=>p.status==='pending').length;
  const pendReg=regs.filter(r=>r.status==='pending').length;

  document.getElementById('dash-cards').innerHTML=`
    <div class="dsc" style="--cc:#2563eb"><div class="dsc-icon" style="background:#eff6ff;color:#2563eb">🗓️</div><div class="dsc-num">${evts.length}</div><div class="dsc-lbl">Total Event</div></div>
    <div class="dsc" style="--cc:#16a34a"><div class="dsc-icon" style="background:#f0fdf4;color:#16a34a">✅</div><div class="dsc-num" style="color:#16a34a">${openCnt}</div><div class="dsc-lbl">Dibuka</div></div>
    <div class="dsc" style="--cc:#d97706"><div class="dsc-icon" style="background:#fffbeb;color:#d97706">⏳</div><div class="dsc-num" style="color:#d97706">${soonCnt}</div><div class="dsc-lbl">Segera</div></div>
    <div class="dsc" style="--cc:#dc2626"><div class="dsc-icon" style="background:#fef2f2;color:#dc2626">👥</div><div class="dsc-num" style="color:#dc2626">${regs.filter(r=>r.status!=='cancelled').length}</div><div class="dsc-lbl">Total Peserta</div></div>
    <div class="dsc" style="cursor:pointer;--cc:#ca8a04" onclick="switchAdminTab('payments')"><div class="dsc-icon" style="background:#fef9c3;color:#ca8a04">💳</div><div class="dsc-num" style="color:#ca8a04">${pendPay}</div><div class="dsc-lbl">Bayar Pending</div></div>
    <div class="dsc" style="cursor:pointer;--cc:#7c3aed" onclick="switchAdminTab('participants')"><div class="dsc-icon" style="background:#f5f3ff;color:#7c3aed">📋</div><div class="dsc-num" style="color:#7c3aed">${pendReg}</div><div class="dsc-lbl">Reg. Pending</div></div>`;

  /* Quick Actions */
  const qas=[
    {icon:'👥',title:'Approve Peserta',desc:`${pendReg} menunggu persetujuan`,count:pendReg,cls:pendReg?'urgent':'ok',tab:'participants'},
    {icon:'💳',title:'Verifikasi Bayar',desc:`${pendPay} bukti belum diverifikasi`,count:pendPay,cls:pendPay?'urgent':'ok',tab:'payments'},
    {icon:'🏆',title:'Buat Bracket',desc:'Generate bagan event aktif',count:null,cls:'ok',tab:'events'},
    {icon:'📋',title:'Atur Tatami',desc:'Kelola jadwal ring & wasit',count:null,cls:'ok',tab:'tatami'},
    {icon:'⚖️',title:'Weigh-in',desc:'Catat timbang badan kumite',count:null,cls:'ok',tab:'tatami'},
    {icon:'🏅',title:'Input Hasil',desc:'Publikasikan juara kategori',count:null,cls:'ok',tab:'results'},
  ];
  const qaEl=document.getElementById('quick-actions-grid');
  if(qaEl) qaEl.innerHTML=qas.map(q=>`
    <div class="qa-card" onclick="switchAdminTab('${q.tab}')">
      <div class="qa-card-top">
        <span class="qa-card-icon">${q.icon}</span>
        ${q.count!==null?`<span class="qa-card-badge ${q.cls}">${q.count}</span>`:''}
      </div>
      <div class="qa-card-title">${q.title}</div>
      <div class="qa-card-desc">${q.desc}</div>
    </div>`).join('');

  const COLORS=['#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#06b6d4','#ec4899'];
  const evtLabels=evts.map(e=>e.name.length>20?e.name.substring(0,20)+'…':e.name);
  const evtCounts=evts.map(e=>regCount(e.id));

  if(_cReg)_cReg.destroy();
  _cReg=new Chart(document.getElementById('chart-reg'),{type:'bar',data:{labels:evtLabels,datasets:[{label:'Peserta',data:evtCounts,backgroundColor:'rgba(37,99,235,.75)',borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{color:'var(--text-muted)',stepSize:1},grid:{color:'rgba(148,163,184,.1)'}},y:{ticks:{color:'var(--text-muted)',font:{size:11}},grid:{display:false}}}}});

  if(_cStat)_cStat.destroy();
  _cStat=new Chart(document.getElementById('chart-stat'),{type:'doughnut',data:{labels:['Dibuka','Segera','Ditutup'],datasets:[{data:[openCnt,soonCnt,evts.length-openCnt-soonCnt],backgroundColor:['#22c55e','#f59e0b','#94a3b8'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{position:'bottom',labels:{color:'var(--text-muted)',padding:12,font:{size:12}}}}}});

  const catMap={};evts.forEach(e=>{catMap[e.category]=(catMap[e.category]||0)+1;});
  if(_cCat)_cCat.destroy();
  _cCat=new Chart(document.getElementById('chart-cat'),{type:'bar',data:{labels:Object.keys(catMap),datasets:[{label:'Jumlah',data:Object.values(catMap),backgroundColor:COLORS,borderRadius:8,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'var(--text-muted)'},grid:{display:false}},y:{ticks:{color:'var(--text-muted)',stepSize:1},grid:{color:'rgba(148,163,184,.1)'}}}}});

  const em={};evts.forEach(e=>{em[e.id]=e;});
  const recent=[...regs].sort((a,b)=>b.createdAt-a.createdAt).slice(0,6);
  document.getElementById('recent-list').innerHTML=recent.length
    ?recent.map(r=>`<div class="recent-row"><div class="recent-avatar">${r.name.charAt(0).toUpperCase()}</div><div class="recent-info"><div class="recent-name">${r.name}</div><div class="recent-detail">🥋 ${em[r.eventId]?.name||'—'} — ${r.category}</div></div><div class="recent-time">${timeAgo(r.createdAt)}</div></div>`).join('')
    :'<div class="empty-mini">Belum ada pendaftar.</div>';

  /* Update sidebar badges */
  if(typeof updateSidebarBadges==='function') updateSidebarBadges();
}
