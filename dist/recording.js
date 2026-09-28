// Recording capture is local; transcription requires a connected service.
let audioRecorder=null, recordingStream=null, recordingChunks=[], recordingUrl='', recordingBusy=false;
function recordingDialog(){
 const box=document.getElementById('modal');
 box.innerHTML=`<div class="record-heading"><span class="input-icon">${icon('teams')}</span><div><h2>Record a meeting</h2><p class="sub">Capture audio from a meeting held in another application.</p></div><button aria-label="Close recording" onclick="closeRecording()">×</button></div><label class="field">Audio source<select id="recordSource"><option value="microphone">Microphone / room audio</option><option value="screen">Shared tab audio</option></select></label><p class="sub">Let participants know you are recording. For an online meeting, choose its tab and enable audio sharing when supported by your browser.</p><div class="record-capture"><span id="recordLight" class="record-light"></span><strong id="recordStatus" role="status">Ready to record</strong><div class="page-actions"><button id="recordStart" class="primary" onclick="startRecording()">Start recording</button><button id="recordStop" disabled onclick="stopRecording()">Stop recording</button></div></div><audio id="recordPlayback" controls hidden></audio><a id="recordDownload" hidden>Download recording</a><div class="record-transcripts"><section><h3>English</h3><p class="sub">Speaker-labelled transcript will appear here.</p></section><section><h3>日本語</h3><p class="sub">話者別の文字起こし・翻訳がここに表示されます。</p></section></div><p class="sub">Audio recording works locally. Speaker separation, transcription and English/Japanese translation require a connected AI service.</p><div class="page-actions"><button disabled title="Connect a transcription service to enable this action">Transcribe & translate</button></div>`;
 box.classList.add('recording-dialog');box.oncancel=e=>{e.preventDefault();closeRecording()};box.showModal();
}
async function startRecording(){
 if(recordingBusy||audioRecorder?.state==='recording')return;recordingBusy=true;
 const status=document.getElementById('recordStatus');document.getElementById('recordStart').disabled=true;
 try{
  if(!navigator.mediaDevices||!window.MediaRecorder)throw Error('Audio recording is not supported in this browser.');
  const source=document.getElementById('recordSource').value;
  recordingStream=source==='screen'?await navigator.mediaDevices.getDisplayMedia({video:true,audio:true}):await navigator.mediaDevices.getUserMedia({audio:true});
  if(!recordingStream.getAudioTracks().length)throw Error('No shared audio was selected. Choose a tab with audio sharing enabled.');
  recordingChunks=[];const stream=new MediaStream(recordingStream.getAudioTracks());audioRecorder=new MediaRecorder(stream);
  audioRecorder.ondataavailable=e=>{if(e.data.size)recordingChunks.push(e.data)};
  audioRecorder.onstop=()=>{const blob=new Blob(recordingChunks,{type:audioRecorder.mimeType});if(recordingUrl)URL.revokeObjectURL(recordingUrl);recordingUrl=URL.createObjectURL(blob);const player=document.getElementById('recordPlayback'),download=document.getElementById('recordDownload');if(player){player.src=recordingUrl;player.hidden=false;download.href=recordingUrl;download.download='meeting-recording.'+(blob.type.includes('mp4')?'m4a':'webm');download.hidden=false;status.textContent='Recording ready — listen or download';document.getElementById('recordStart').disabled=false;document.getElementById('recordStop').disabled=true;document.getElementById('recordLight').classList.remove('active')}recordingStream?.getTracks().forEach(t=>t.stop())};
  recordingStream.getTracks().forEach(t=>t.onended=()=>stopRecording());audioRecorder.start();status.textContent='Recording audio…';document.getElementById('recordStop').disabled=false;document.getElementById('recordLight').classList.add('active');
 }catch(e){recordingStream?.getTracks().forEach(t=>t.stop());status.textContent=e.name==='NotAllowedError'?'Recording permission was not granted.':e.message;document.getElementById('recordStart').disabled=false}finally{recordingBusy=false}
}
function stopRecording(){if(audioRecorder?.state==='recording')audioRecorder.stop()}
function closeRecording(){if(recordingBusy)return;if(audioRecorder?.state==='recording'){stopRecording();return}document.getElementById('modal').close();document.getElementById('modal').classList.remove('recording-dialog')}
pageNames.meetings='Meeting recordings';
blueprintPageRoutes.meetings=()=>appNav()+bpHeading('Meeting recordings','Record audio from your meeting. Keep English and Japanese transcripts together.',button('New recording','recordingDialog()',true))+'<section class="panel form"><h2>Capture conversations, keep the context</h2><p>Use your microphone for a room meeting or capture shared tab audio from your meeting application.</p><p class="sub">Your recording stays in this browser. Download it before leaving the page.</p>'+button('Create recording','recordingDialog()',true)+'</section>';
const recordingNavigate=navigate;
navigate=function(route){if(route==='meetings'){captureReq();recordingDialog();return}return recordingNavigate(route)};
document.addEventListener('click',e=>{const link=e.target.closest('a[href="#meetings"]');if(link){e.preventDefault();e.stopImmediatePropagation();recordingDialog()}},true);
render();
