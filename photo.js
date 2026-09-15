(() => {
'use strict';
const GOOGLE_APPS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxdI7YGhVzL4_ljSNDTAGLGvpK7Q3nLPBZoCAwXFMTWV1EewQB2iycxKA6QfQdDXaHM/exec';
const WEDDING_EMAIL='queencypineda29@gmail.com';
const HASHTAG='#CenFounfHisQueenCy';
const FRAME_SRC='assets/wedding-frame.png';
const W=1600,H=1068;
// Exact inner photo opening in the supplied reference design (pink border remains visible).
const LIVE={x:534,y:74,w:974,h:546};
const video=document.getElementById('cameraVideo'),captured=document.getElementById('capturedPhoto'),booth=document.getElementById('photoBooth'),message=document.getElementById('cameraMessage'),countdown=document.getElementById('countdown'),startBtn=document.getElementById('startCamera'),switchBtn=document.getElementById('switchCamera'),captureBtn=document.getElementById('captureButton'),previewActions=document.getElementById('previewActions'),redoBtn=document.getElementById('redoButton'),downloadBtn=document.getElementById('downloadButton'),submitBtn=document.getElementById('submitButton'),status=document.getElementById('photoStatus');
let stream=null,facingMode='user',capturedBlob=null,busy=false;
function setStatus(t,type=''){status.textContent=t;status.className='photo-status'+(type?' '+type:'')}
function stopCamera(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}video.srcObject=null;captureBtn.disabled=true;switchBtn.disabled=true}
async function startCamera(){
 if(!window.isSecureContext){setStatus('Camera access requires HTTPS. Open this page from GitHub Pages, not a file:// link.','error');return}
 if(!navigator.mediaDevices?.getUserMedia){setStatus('This browser does not provide camera access. Please use Chrome, Safari, or Edge on HTTPS.','error');return}
 stopCamera(); setStatus('Starting camera…'); message.classList.remove('hidden');
 try{
   const constraints={audio:false,video:{facingMode:{ideal:facingMode},width:{ideal:1920},height:{ideal:1080}}};
   stream=await navigator.mediaDevices.getUserMedia(constraints);
   video.srcObject=stream; video.muted=true; video.setAttribute('playsinline','');
   await video.play();
   await new Promise(r=>requestAnimationFrame(r));
   message.classList.add('hidden'); captureBtn.disabled=false; switchBtn.disabled=false; startBtn.textContent='Restart camera'; setStatus('Camera ready — smile!');
 }catch(e){console.error(e); let m='Unable to start the camera. Check Chrome camera permission and make sure another app is not using it.'; if(e.name==='NotAllowedError'||e.name==='SecurityError')m='Camera permission was denied. In Chrome, allow Camera for this GitHub Pages site, then press Start camera again.'; else if(e.name==='NotFoundError')m='No camera was found. Connect the laptop or USB camera, then press Start camera.'; else if(e.name==='NotReadableError')m='The camera is already in use by another app. Close Zoom, Teams, OBS, or another camera page and try again.'; setStatus(m,'error'); message.classList.remove('hidden')}
}
function showCountdown(n){countdown.textContent=n;countdown.classList.remove('show');void countdown.offsetWidth;countdown.classList.add('show')}
async function runCountdown(){for(const n of [3,2,1]){showCountdown(n);await new Promise(r=>setTimeout(r,900))}}
function drawCover(ctx){
 const vw=video.videoWidth||1280,vh=video.videoHeight||720;
 const scale=Math.max(LIVE.w/vw,LIVE.h/vh),dw=vw*scale,dh=vh*scale;
 const dx=LIVE.x+(LIVE.w-dw)/2,dy=LIVE.y+(LIVE.h-dh)/2;
 ctx.save();ctx.beginPath();ctx.rect(LIVE.x,LIVE.y,LIVE.w,LIVE.h);ctx.clip();
 if(facingMode==='user'){ctx.translate(W,0);ctx.scale(-1,1);ctx.drawImage(video,W-dx-dw,dy,dw,dh)}else ctx.drawImage(video,dx,dy,dw,dh);
 ctx.restore();
}
async function loadImage(src){return await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
async function makeFinalImage(){
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,W,H);drawCover(ctx);
 const frame=await loadImage(FRAME_SRC);ctx.drawImage(frame,0,0,W,H);
 return await new Promise(resolve=>canvas.toBlob(b=>resolve({blob:b,url:canvas.toDataURL('image/jpeg',0.95)}),'image/jpeg',0.95));
}
async function capturePhoto(){if(!stream||busy)return;busy=true;captureBtn.disabled=true;switchBtn.disabled=true;setStatus('Get ready…');await runCountdown();try{const result=await makeFinalImage();capturedBlob=result.blob;captured.src=result.url;booth.classList.add('capture-mode');previewActions.classList.add('show');setStatus('Photo ready — the saved image is the same 1600 × 1068 frame you saw in the camera.')}catch(e){console.error(e);setStatus('Could not create the photo. Please try again.','error');captureBtn.disabled=false;switchBtn.disabled=false}busy=false}
function redoPhoto(){capturedBlob=null;captured.removeAttribute('src');booth.classList.remove('capture-mode');previewActions.classList.remove('show');captureBtn.disabled=!stream;switchBtn.disabled=!stream;setStatus('Camera ready — try another one!')}
function downloadPhoto(){if(!capturedBlob)return;const a=document.createElement('a');a.href=URL.createObjectURL(capturedBlob);a.download=`Christian-Queency_Wedding_Photo_${new Date().toISOString().slice(0,10)}.jpg`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);setStatus('Photo downloaded to your device.','success')}
async function submitPhoto(){if(!capturedBlob||busy)return;busy=true;submitBtn.disabled=true;redoBtn.disabled=true;setStatus('Uploading your photo…');try{const reader=new FileReader();const base64=await new Promise((res,rej)=>{reader.onload=()=>res(String(reader.result).split(',')[1]);reader.onerror=rej;reader.readAsDataURL(capturedBlob)});await fetch(GOOGLE_APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({filename:`Christian-Queency_${Date.now()}.jpg`,mimeType:'image/jpeg',base64,hashtag:HASHTAG,email:WEDDING_EMAIL})});setStatus('Thank you for sharing a memory with us! ♡','success');setTimeout(redoPhoto,2500)}catch(e){console.error(e);setStatus('Upload failed. Please try again.','error');submitBtn.disabled=false;redoBtn.disabled=false}finally{busy=false}}
startBtn.addEventListener('click',startCamera);downloadBtn.addEventListener('click',downloadPhoto);switchBtn.addEventListener('click',async()=>{facingMode=facingMode==='user'?'environment':'user';await startCamera()});captureBtn.addEventListener('click',capturePhoto);redoBtn.addEventListener('click',redoPhoto);submitBtn.addEventListener('click',submitPhoto);window.addEventListener('pagehide',stopCamera);
// Do not force a permission request on page load. Browsers are more reliable when camera access starts from a button tap.
})();
