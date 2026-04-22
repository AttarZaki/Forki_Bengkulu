'use strict';

let _timerInterval=null, _timerSecs=180, _timerRunning=false, _timerVisible=false;

function toggleTimer(){
  const el=document.getElementById('kumite-timer');
  _timerVisible=!_timerVisible;
  el.style.display=_timerVisible?'flex':'none';
  if(!_timerVisible) stopTimer();
}
function startTimer(){
  if(_timerRunning) return;
  _timerRunning=true;
  document.getElementById('timer-btn-start').style.display='none';
  document.getElementById('timer-btn-pause').style.display='inline-flex';
  _timerInterval=setInterval(()=>{
    _timerSecs--;
    updateTimerDisplay();
    if(_timerSecs<=0){stopTimer();timerBuzzer();_timerSecs=0;}
    if(_timerSecs<=10) document.getElementById('timer-display').classList.add('timer-urgent');
  },1000);
}
function pauseTimer(){
  if(!_timerRunning) return;
  _timerRunning=false; clearInterval(_timerInterval); _timerInterval=null;
  document.getElementById('timer-btn-start').style.display='inline-flex';
  document.getElementById('timer-btn-pause').style.display='none';
}
function stopTimer(){
  pauseTimer();
  document.getElementById('timer-display').classList.remove('timer-urgent');
}
function resetTimer(){
  stopTimer();
  _timerSecs=parseInt(document.getElementById('timer-preset').value)||180;
  updateTimerDisplay();
}
function updateTimerDisplay(){
  const m=Math.floor(_timerSecs/60); const s=_timerSecs%60;
  document.getElementById('timer-display').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function onTimerPresetChange(){
  if(_timerRunning) return;
  _timerSecs=parseInt(document.getElementById('timer-preset').value)||180;
  updateTimerDisplay();
  document.getElementById('timer-display').classList.remove('timer-urgent');
}
function timerBuzzer(){
  try{
    const ac=new (window.AudioContext||window.webkitAudioContext)();
    [0,300,600].forEach(delay=>{
      const osc=ac.createOscillator(); const gain=ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.value=880; gain.gain.value=0.4;
      osc.start(ac.currentTime+delay/1000);
      osc.stop(ac.currentTime+delay/1000+0.25);
    });
  } catch(e){}
}
