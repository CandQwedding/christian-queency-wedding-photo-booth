(() => {
'use strict';

/*
 * Google Drive upload configuration
 * 1. Deploy the supplied google-apps-script/Code.gs as a Web App.
 * 2. Copy the Web App URL into GOOGLE_APPS_SCRIPT_URL below.
 */
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdI7YGhVzL4_ljSNDTAGLGvpK7Q3nLPBZoCAwXFMTWV1EewQB2iycxKA6QfQdDXaHM/exec';
const WEDDING_EMAIL = 'queencypineda29@gmail.com';
const HASHTAG = '#CenFounfHisQueenCy';

const video = document.getElementById('cameraVideo');
const captured = document.getElementById('capturedPhoto');
const booth = document.getElementById('photoBooth');
const message = document.getElementById('cameraMessage');
const countdown = document.getElementById('countdown');
const startBtn = document.getElementById('startCamera');
const switchBtn = document.getElementById('switchCamera');
const captureBtn = document.getElementById('captureButton');
const previewActions = document.getElementById('previewActions');
const redoBtn = document.getElementById('redoButton');
const submitBtn = document.getElementById('submitButton');
const status = document.getElementById('photoStatus');

let stream = null;
let facingMode = 'user';
let capturedBlob = null;
let capturedDataUrl = null;
let busy = false;

function setStatus(text, type='') {
  status.textContent = text;
  status.className = 'photo-status' + (type ? ' ' + type : '');
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

async function startCamera() {
  stopCamera();
  setStatus('Starting camera…');
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    video.srcObject = stream;
    await video.play();
    message.classList.add('hidden');
    captureBtn.disabled = false;
    switchBtn.disabled = false;
    startBtn.textContent = 'Restart camera';
    setStatus('Camera ready — smile!');
  } catch (err) {
    console.error(err);
    setStatus('Camera access was not allowed. Please allow camera permission in your browser and try again.', 'error');
    message.classList.remove('hidden');
  }
}

function showCountdown(number) {
  countdown.textContent = number;
  countdown.classList.remove('show');
  void countdown.offsetWidth;
  countdown.classList.add('show');
}

async function runCountdown() {
  for (const n of [3,2,1]) {
    showCountdown(n);
    await new Promise(r => setTimeout(r, 900));
  }
}

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
}

async function makeFinalImage() {
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 960;
  const canvas = document.createElement('canvas');
  canvas.width = vw;
  canvas.height = vh;
  const ctx = canvas.getContext('2d');
  const coupleImg = new Image();
  coupleImg.src = 'assets/couple-small.webp';
  try { await coupleImg.decode(); } catch (_) {}

  // Mirror only the selfie camera; the rear camera should remain natural.
  if (facingMode === 'user') {
    ctx.save();
    ctx.translate(vw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, vw, vh);
    ctx.restore();
  } else {
    ctx.drawImage(video, 0, 0, vw, vh);
  }

  // Warm translucent wedding treatment matching the invitation.
  ctx.fillStyle = 'rgba(47,29,21,0.08)';
  ctx.fillRect(0,0,vw,vh);

  const border = Math.max(18, Math.round(vw * 0.018));
  // Elegant double wedding frame with rounded inner corners and ornamental flourishes.
  const outer = border * 0.55;
  const inner = border * 1.35;
  ctx.save();
  ctx.strokeStyle = '#fff5e8';
  ctx.lineWidth = Math.max(8, Math.round(vw * 0.010));
  roundedRect(ctx, outer, outer, vw - outer*2, vh - outer*2, Math.max(18, vw*0.025));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(74,48,36,.82)';
  ctx.lineWidth = Math.max(2, Math.round(vw * 0.0022));
  roundedRect(ctx, inner, inner, vw - inner*2, vh - inner*2, Math.max(12, vw*0.018));
  ctx.stroke();

  const drawFlourish = (x, y, sx, sy) => {
    ctx.save(); ctx.translate(x,y); ctx.scale(sx,sy);
    ctx.strokeStyle = '#e5cdb1'; ctx.lineWidth = Math.max(2, vw*0.002);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(vw*.018,-vw*.018,vw*.035,vw*.018,vw*.055,0); ctx.bezierCurveTo(vw*.075,-vw*.020,vw*.090,vw*.020,vw*.105,0); ctx.stroke();
    ctx.fillStyle = '#e5cdb1';
    [[.03,-.012],[.072,-.014]].forEach(([dx,dy])=>{ctx.beginPath();ctx.ellipse(vw*dx,vw*dy,vw*.009,vw*.005,Math.PI/4,0,Math.PI*2);ctx.fill();});
    ctx.beginPath();ctx.arc(vw*.052,0,vw*.009,0,Math.PI*2);ctx.fill();
    ctx.restore();
  };
  drawFlourish(inner*1.25, inner*1.55, 1, 1);
  drawFlourish(vw-inner*1.25, inner*1.55, -1, 1);
  drawFlourish(inner*1.25, vh-inner*1.55, 1, -1);
  drawFlourish(vw-inner*1.25, vh-inner*1.55, -1, -1);
  ctx.restore();

  const pad = Math.max(24, vw * 0.035);
  ctx.textAlign = 'center';

  // Small couple portrait badge inside the wedding frame.
  const badgeSize = Math.max(74, Math.round(vw * 0.095));
  const badgeX = pad + badgeSize * 0.55;
  const badgeY = pad + badgeSize * 0.72;
  const drawBadge = () => {
    ctx.save();
    ctx.beginPath(); ctx.arc(badgeX, badgeY, badgeSize/2 + 7, 0, Math.PI*2); ctx.fillStyle='#fff5e8'; ctx.fill();
    ctx.beginPath(); ctx.arc(badgeX, badgeY, badgeSize/2 + 3, 0, Math.PI*2); ctx.strokeStyle='#c9a886'; ctx.lineWidth=Math.max(2,vw*.002); ctx.stroke();
    ctx.beginPath(); ctx.arc(badgeX, badgeY, badgeSize/2, 0, Math.PI*2); ctx.clip();
    ctx.drawImage(coupleImg, badgeX-badgeSize/2, badgeY-badgeSize/2, badgeSize, badgeSize);
    ctx.restore();
  };
  ctx.shadowColor = 'rgba(47,29,21,.6)';
  ctx.shadowBlur = Math.max(5, vw * 0.008);
  if (coupleImg.complete && coupleImg.naturalWidth) drawBadge();
  ctx.fillStyle = '#fff5e8';

  ctx.font = `600 ${Math.max(28, vw*0.035)}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillText('Christian & Queency', vw/2, pad + Math.max(34, vw*0.045));

  ctx.font = `600 ${Math.max(15, vw*0.018)}px "DM Sans", Arial, sans-serif`;
  ctx.letterSpacing = '2px';
  ctx.fillText(HASHTAG, vw/2, vh - pad - Math.max(34, vw*0.025));

  ctx.font = `500 ${Math.max(12, vw*0.013)}px "DM Sans", Arial, sans-serif`;
  ctx.fillText('10 · 10 · 2026', vw/2, vh - pad - Math.max(12, vw*0.008));
  ctx.shadowBlur = 0;

  return new Promise(resolve => canvas.toBlob(blob => {
    capturedBlob = blob;
    capturedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    resolve(capturedDataUrl);
  }, 'image/jpeg', 0.92));
}

async function capturePhoto() {
  if (!stream || busy) return;
  busy = true;
  captureBtn.disabled = true;
  switchBtn.disabled = true;
  setStatus('Get ready…');
  await runCountdown();
  await makeFinalImage();
  captured.src = capturedDataUrl;
  booth.classList.add('capture-mode');
  previewActions.classList.add('show');
  setStatus('Beautiful! You can redo it or submit this photo.');
  busy = false;
}

function redoPhoto() {
  capturedBlob = null;
  capturedDataUrl = null;
  booth.classList.remove('capture-mode');
  previewActions.classList.remove('show');
  captureBtn.disabled = !stream;
  switchBtn.disabled = !stream;
  setStatus('Camera ready — try another one!');
}

async function submitPhoto() {
  if (!capturedBlob || busy) return;
  busy = true;
  submitBtn.disabled = true;
  redoBtn.disabled = true;
  setStatus('Uploading your photo…');

  if (GOOGLE_APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    setStatus('The photo booth is ready, but Google Drive upload has not been connected yet. Add the Google Apps Script Web App URL in photo.js.', 'error');
    submitBtn.disabled = false;
    redoBtn.disabled = false;
    busy = false;
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      const base64 = String(reader.result).split(',')[1];
      const payload = {
        filename: `Christian-Queency_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        base64,
        hashtag: HASHTAG,
        email: WEDDING_EMAIL
      };

      // Apps Script Web Apps may return an opaque response cross-origin;
      // no-cors lets the upload request leave the guest's phone reliably.
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type':'text/plain;charset=utf-8'},
        body: JSON.stringify(payload)
      });

      setStatus('Thank you for sharing a memory with us! ♡', 'success');
      setTimeout(() => {
        redoPhoto();
        setStatus('Ready for the next guest — take another photo!');
      }, 2600);
    } catch (err) {
      console.error(err);
      setStatus('We could not upload the photo. Please check your connection and try again.', 'error');
      submitBtn.disabled = false;
      redoBtn.disabled = false;
    } finally {
      busy = false;
    }
  };
  reader.readAsDataURL(capturedBlob);
}

startBtn.addEventListener('click', startCamera);
switchBtn.addEventListener('click', async () => {
  facingMode = facingMode === 'user' ? 'environment' : 'user';
  await startCamera();
});
captureBtn.addEventListener('click', capturePhoto);
redoBtn.addEventListener('click', redoPhoto);
submitBtn.addEventListener('click', submitPhoto);

window.addEventListener('pagehide', stopCamera);
})();
