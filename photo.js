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

  // Soft blush/peach treatment coordinated with the wedding invitation.
  ctx.fillStyle = 'rgba(247,228,220,0.10)';
  ctx.fillRect(0,0,vw,vh);

  // Use the same transparent floral frame artwork shown in the live camera preview.
  const frameImg = new Image();
  frameImg.src = 'assets/wedding-frame.svg';
  try { await frameImg.decode(); } catch (_) {}
  if (frameImg.complete && frameImg.naturalWidth) {
    ctx.drawImage(frameImg, 0, 0, vw, vh);
  }

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
