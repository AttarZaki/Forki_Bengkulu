'use strict';

function renderLeaderboard(){
  const results=getResults().filter(r=>r.published);
  const evts=getEvents();
  const fEvt=document.getElementById('lb-filter-evt')?.value||'';

  // Populate event filter once
  const sel=document.getElementById('lb-filter-evt');
  if(sel&&sel.options.length<=1){
    evts.filter(e=>getResults().some(r=>r.eventId===e.id)).forEach(e=>{
      const opt=document.createElement('option'); opt.value=e.id; opt.textContent=e.name; sel.appendChild(opt);
    });
  }

  const filtered=fEvt?results.filter(r=>(r.evtId||r.eventId)===fEvt):results;
  const dojoMap={};

  filtered.forEach(r=>{
    const add=(dojo,medal)=>{
      if(!dojo) return;
      if(!dojoMap[dojo]) dojoMap[dojo]={dojo,gold:0,silver:0,bronze:0,total:0};
      dojoMap[dojo][medal]++;
      dojoMap[dojo].total++;
    };
    add(r.gold?.dojo,'gold');
    add(r.silver?.dojo,'silver');
    add(r.bronze1?.dojo,'bronze');
    add(r.bronze2?.dojo,'bronze');
  });

  const sorted=Object.values(dojoMap).sort((a,b)=>b.gold-a.gold||b.silver-a.silver||b.bronze-a.bronze);
  const el=document.getElementById('lb-list');

  if(!sorted.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon">🏅</div><h3>Belum Ada Data</h3><p>Hasil pertandingan belum tersedia.</p></div>`;return;}

  el.innerHTML=`
    <div class="lb-table-wrap">
      <table class="lb-table">
        <thead><tr><th>#</th><th>Dojo / Klub</th><th>🥇</th><th>🥈</th><th>🥉</th><th>Total</th></tr></thead>
        <tbody>
          ${sorted.map((d,i)=>`
            <tr class="${i===0?'lb-first':i===1?'lb-second':i===2?'lb-third':''}">
              <td><span class="lb-rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</span></td>
              <td class="lb-dojo-name">${d.dojo}</td>
              <td class="lb-medal-cnt gold">${d.gold||'—'}</td>
              <td class="lb-medal-cnt silver">${d.silver||'—'}</td>
              <td class="lb-medal-cnt bronze">${d.bronze||'—'}</td>
              <td><strong>${d.total}</strong></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}
