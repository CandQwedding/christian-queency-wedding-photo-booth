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
const FRAME_SRC = 'assets/wedding-frame-live.png?v=20260915c';
const FRAME_W = 1600;
const FRAME_H = 1068;
// Exact live-camera opening from the supplied wedding-card reference.
const LIVE_X = 527;
const LIVE_Y = 67;
const LIVE_W = 987;
const LIVE_H = 523;

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
const downloadBtn = document.getElementById('downloadButton');
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
  if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus('Camera needs HTTPS. Open the GitHub Pages photo booth link, not a file:// copy.', 'error');
    message.classList.remove('hidden');
    return;
  }
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
    video.muted = true;
    video.classList.toggle('environment', facingMode === 'environment');
    video.style.visibility = 'visible';
    await video.play();
    message.classList.add('hidden');
    captureBtn.disabled = false;
    switchBtn.disabled = false;
    startBtn.textContent = 'Restart camera';
    setStatus('Camera ready — smile!');
  } catch (err) {
    console.error('Camera error:', err);
    const msg = err && err.name === 'NotAllowedError'
      ? 'Chrome blocked camera access. Click the camera icon beside the address bar, allow Camera, then tap Start camera.'
      : err && err.name === 'NotFoundError'
        ? 'No camera was found. Connect your laptop/USB camera and try again.'
        : err && err.name === 'NotReadableError'
          ? 'The camera is busy in another app. Close Zoom, Teams, Camera, or another browser tab and try again.'
          : err && err.name === 'SecurityError'
            ? 'Camera access is blocked by the browser or page security settings.'
            : `Camera could not start (${err?.name || 'unknown error'}). Try Start camera again.`;
    setStatus(msg, 'error');
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

async function loadFrameImage() {
  const frameImg = new Image();
  frameImg.src = FRAME_SRC;
  if (frameImg.decode) {
    try { await frameImg.decode(); return frameImg; } catch (_) {}
  }
  return await new Promise(resolve => {
    frameImg.onload = () => resolve(frameImg);
    frameImg.onerror = () => resolve(null);
  });
}

async function makeFinalImage() {
  const canvas = document.createElement('canvas');
  canvas.width = FRAME_W;
  canvas.height = FRAME_H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, FRAME_W, FRAME_H);

  // Draw exactly the same crop used by the live preview.
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const scale = Math.max(LIVE_W / vw, LIVE_H / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  const dx = LIVE_X + (LIVE_W - dw) / 2;
  const dy = LIVE_Y + (LIVE_H - dh) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(LIVE_X, LIVE_Y, LIVE_W, LIVE_H);
  ctx.clip();
  if (facingMode === 'user') {
    ctx.translate(FRAME_W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, FRAME_W - dx - dw, dy, dw, dh);
  } else {
    ctx.drawImage(video, dx, dy, dw, dh);
  }
  ctx.restore();

  const frameImg = await loadFrameImage();
  if (!frameImg || !frameImg.naturalWidth) {
    throw new Error('Wedding frame could not be loaded.');
  }
  ctx.drawImage(frameImg, 0, 0, FRAME_W, FRAME_H);

  capturedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.94));
  if (!capturedBlob) throw new Error('Could not create the photo file.');
  capturedDataUrl = canvas.toDataURL('image/jpeg', 0.94);
  return capturedDataUrl;
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

function downloadPhoto() {
  if (!capturedBlob) return;
  const url = URL.createObjectURL(capturedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Christian-Queency_${new Date().toISOString().replace(/[:.]/g,'-')}.jpg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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

// Start automatically when the page is opened. The browser will still show its
// normal camera-permission prompt the first time. The button remains available
// for restart/reconnect.
window.addEventListener('DOMContentLoaded', () => {
  // Auto-start on GitHub Pages so guests do not have to find the button first.
  setTimeout(() => startCamera(), 300);
});
switchBtn.addEventListener('click', async () => {
  facingMode = facingMode === 'user' ? 'environment' : 'user';
  await startCamera();
});
captureBtn.addEventListener('click', capturePhoto);
redoBtn.addEventListener('click', redoPhoto);
submitBtn.addEventListener('click', submitPhoto);
downloadBtn.addEventListener('click', downloadPhoto);

window.addEventListener('pagehide', stopCamera);
})();
