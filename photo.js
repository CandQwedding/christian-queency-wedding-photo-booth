(() => {
'use strict';

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdI7YGhVzL4_ljSNDTAGLGvpK7Q3nLPBZoCAwXFMTWV1EewQB2iycxKA6QfQdDXaHM/exec';
const WEDDING_EMAIL = 'queencypineda29@gmail.com';
const HASHTAG = '#CenFoundHisQueenCy';
const FRAME_W = 1600;
const FRAME_H = 1068;
let shotCount = 1;
let printSize = '4x6';

const PRINT_SIZES = {
  '2x6': {w: 600, h: 1800, label: '2×6 Photo Strip'},
  '4x6': {w: 1800, h: 1200, label: '4×6 Classic Print'},
  '5x7': {w: 2100, h: 1500, label: '5×7 Premium Print'},
  '6x8': {w: 2400, h: 1800, label: '6×8 Large Keepsake'},
  '8x10': {w: 3000, h: 2400, label: '8×10 Guestbook Print'}
};

const FRAME_OPTIONS = {
  classic: {
    name: 'Classic Collage',
    src: 'assets/frame-1',
    slots: [
      {x:500,y:105,w:980,h:460},
      {x:500,y:615,w:455,h:300},
      {x:1025,y:615,w:455,h:300}
    ]
  },
  strip: {
    name: 'Photo Strip',
    src: 'assets/frame-2',
    slots: [
      {x:110,y:105,w:700,h:250},
      {x:110,y:385,w:700,h:250},
      {x:110,y:665,w:700,h:250}
    ]
  },
  elegant: {
    name: 'Elegant Trio',
    src: 'assets/frame-3',
    slots: [
      {x:120,y:760,w:420,h:190},
      {x:590,y:760,w:420,h:190},
      {x:1060,y:760,w:420,h:190}
    ]
  }
};

let selectedFrame = 'classic';
let stream = null;
let facingMode = 'user';
let capturedBlob = null;
let capturedDataUrl = null;
let shotImages = [];
let busy = false;
let capturingSequence = false;

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
const frameArt = document.getElementById('frameArt');
const cameraStage = document.getElementById('cameraStage');

function setStatus(text, type='') {
  status.textContent = text;
  status.className = 'photo-status' + (type ? ' ' + type : '');
}

function currentFrame() {
  return FRAME_OPTIONS[selectedFrame];
}

function frameVariantSrc(key = selectedFrame, count = shotCount) {
  if (printSize === '2x6') return `assets/frame-2x6-${count}shot.png`;
  const frame = FRAME_OPTIONS[key];
  return `${frame.src}-${count}shot.png`;
}

function frameCanvasSpec() {
  if (printSize === '2x6') {
    return {
      w: 600, h: 1800,
      slots: [
        {x:55,y:250,w:490,h:380},
        {x:55,y:700,w:490,h:380},
        {x:55,y:1150,w:490,h:380}
      ]
    };
  }
  return {w: FRAME_W, h: FRAME_H, slots: currentFrame().slots};
}

function updateFrameImages() {
  document.querySelectorAll('.frame-option').forEach(btn => {
    const img = btn.querySelector('img');
    const is2x6 = printSize === '2x6';
    const disabled = is2x6 && btn.dataset.frame !== 'strip';
    btn.disabled = disabled;
    btn.classList.toggle('disabled', disabled);
    if (img) {
      const previewSrc = is2x6
        ? `assets/frame-${btn.dataset.frame}-3shot.png`
        : frameVariantSrc(btn.dataset.frame);
      img.src = `${previewSrc}?v=${Date.now()}`;
    }
  });
}

function shotLabel(count = shotCount) {
  return count === 1 ? 'Solo' : `${count} shots`;
}

function shotNoun(count = shotCount) {
  return count === 1 ? 'photo' : 'photos';
}

function updateShotCount(count) {
  count = Number(count);
  if (![1, 2, 3].includes(count) || capturingSequence) return;
  shotCount = count;
  document.querySelectorAll('.shot-count-option').forEach(btn => {
    const active = Number(btn.dataset.shotCount) === shotCount;
    btn.classList.toggle('selected', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  updateFrameImages();
  frameArt.src = `${frameVariantSrc()}?v=${Date.now()}`;
  setLiveSlotPosition();
  updateCaptureButton();
  setStatus(`${PRINT_SIZES[printSize].label} · ${shotLabel()} selected · ${currentFrame().name} ready.`);
}

function setLiveSlotPosition() {
  const spec = frameCanvasSpec();
  const slot = spec.slots[0];
  cameraStage.style.setProperty('--live-x', `${slot.x / spec.w * 100}%`);
  cameraStage.style.setProperty('--live-y', `${slot.y / spec.h * 100}%`);
  cameraStage.style.setProperty('--live-w', `${slot.w / spec.w * 100}%`);
  cameraStage.style.setProperty('--live-h', `${slot.h / spec.h * 100}%`);
}

function updateFrameSelection(key) {
  if (!FRAME_OPTIONS[key] || capturingSequence) return;
  selectedFrame = key;
  const frame = currentFrame();
  frameArt.src = `${frameVariantSrc(key)}?r=${Date.now()}`;
  setLiveSlotPosition();

  document.querySelectorAll('.frame-option').forEach(btn => {
    const active = btn.dataset.frame === key;
    btn.classList.toggle('selected', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  setStatus(`${shotLabel()} selected · ${frame.name} ready.`);
}

function updateCaptureButton() {
  if (capturingSequence) return;
  captureBtn.textContent = `Take ${shotCount} ${shotCount === 1 ? 'shot' : 'shots'} · ${currentFrame().name}`;
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
    setStatus(`${PRINT_SIZES[printSize].label} · ${shotLabel()} selected · ${currentFrame().name} ready.`);
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

function captureRawShot() {
  const slot = frameCanvasSpec().slots[0];
  const canvas = document.createElement('canvas');
  canvas.width = slot.w;
  canvas.height = slot.h;
  const ctx = canvas.getContext('2d');

  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const scale = Math.max(slot.w / vw, slot.h / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  const dx = (slot.w - dw) / 2;
  const dy = (slot.h - dh) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, slot.w, slot.h);
  ctx.clip();

  if (facingMode === 'user') {
    ctx.translate(slot.w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, -dx - dw, dy, dw, dh);
  } else {
    ctx.drawImage(video, dx, dy, dw, dh);
  }
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.94);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCoverImage(ctx, img, box) {
  const {x,y,w,h} = box;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

async function makeFinalImage() {
  const size = PRINT_SIZES[printSize] || PRINT_SIZES['4x6'];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, size.w, size.h);

  const spec = frameCanvasSpec();
  const frameImg = await loadImage(frameVariantSrc());
  const sourceRatio = spec.w / spec.h;
  const targetRatio = size.w / size.h;
  let drawW, drawH, offsetX, offsetY;

  // 2×6 has its own true strip artwork. Other sizes preserve the existing frame proportions.
  if (printSize === '2x6') {
    drawW = size.w; drawH = size.h; offsetX = 0; offsetY = 0;
  } else if (targetRatio >= sourceRatio) {
    drawH = size.h; drawW = drawH * sourceRatio; offsetX = (size.w - drawW) / 2; offsetY = 0;
  } else {
    drawW = size.w; drawH = drawW / sourceRatio; offsetX = 0; offsetY = (size.h - drawH) / 2;
  }

  const sx = drawW / spec.w;
  const sy = drawH / spec.h;
  for (let i = 0; i < shotCount; i++) {
    const img = await loadImage(shotImages[i]);
    drawCoverImage(ctx, img, {
      x: offsetX + spec.slots[i].x * sx,
      y: offsetY + spec.slots[i].y * sy,
      w: spec.slots[i].w * sx,
      h: spec.slots[i].h * sy
    });
  }

  ctx.drawImage(frameImg, offsetX, offsetY, drawW, drawH);
  capturedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.94));
  if (!capturedBlob) throw new Error('Could not create the photo file.');
  capturedDataUrl = canvas.toDataURL('image/jpeg', 0.94);
  return capturedDataUrl;
}

async function capturePhoto() {
  if (!stream || busy || capturingSequence) return;

  busy = true;
  capturingSequence = true;
  shotImages = [];
  capturedBlob = null;
  capturedDataUrl = null;
  captureBtn.disabled = true;
  switchBtn.disabled = true;
  previewActions.classList.remove('show');
  booth.classList.remove('capture-mode');

  try {
    for (let i = 0; i < shotCount; i++) {
      const shotNumber = i + 1;
      setStatus(`Get ready — shot ${shotNumber} of ${shotCount}…`);
      await new Promise(r => setTimeout(r, 450));
      await runCountdown();
      shotImages.push(captureRawShot());
      setStatus(`Shot ${shotNumber} of ${shotCount} captured!`);
      if (i < shotCount - 1) await new Promise(r => setTimeout(r, 850));
    }

    setStatus(`Creating your ${shotLabel()} ${currentFrame().name} wedding photo…`);
    await makeFinalImage();

    captured.src = capturedDataUrl;
    booth.classList.add('capture-mode');
    previewActions.classList.add('show');
    setStatus(`Beautiful! Your ${shotLabel()} memory is ready. You can redo, download, or submit.`);
  } catch (err) {
    console.error(err);
    setStatus(`The ${shotLabel()} photo could not be created. Please try again.`, 'error');
    shotImages = [];
  } finally {
    capturingSequence = false;
    busy = false;
    captureBtn.disabled = !stream;
    switchBtn.disabled = !stream;
    updateCaptureButton();
  }
}

function redoPhoto() {
  capturedBlob = null;
  capturedDataUrl = null;
  shotImages = [];
  booth.classList.remove('capture-mode');
  previewActions.classList.remove('show');
  captureBtn.disabled = !stream;
  switchBtn.disabled = !stream;
  setStatus(`${PRINT_SIZES[printSize].label} · ${currentFrame().name} selected — ready for ${shotLabel()}!`);
  updateCaptureButton();
}

function downloadPhoto() {
  if (!capturedBlob) return;
  const url = URL.createObjectURL(capturedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Christian-Queency_${currentFrame().name.replace(/\s+/g,'-')}_${shotCount}-shot_${printSize}_${new Date().toISOString().replace(/[:.]/g,'-')}.jpg`;
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
  setStatus(`Uploading your ${currentFrame().name} wedding photo…`);

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
        filename: `Christian-Queency_${currentFrame().name.replace(/\s+/g,'-')}_${shotCount}-shot_${printSize}_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        base64,
        hashtag: HASHTAG,
        email: WEDDING_EMAIL,
        frame: currentFrame().name,
        shotCount,
        printSize
      };

      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type':'text/plain;charset=utf-8'},
        body: JSON.stringify(payload)
      });

      setStatus(`Thank you for sharing ${shotCount} ${shotNoun()} with us! ♡`, 'success');
      setTimeout(() => {
        redoPhoto();
        setStatus('Ready for the next guest — choose Solo, 2 Shots, or 3 Shots.');
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

document.querySelectorAll('.shot-count-option').forEach(btn => {
  btn.addEventListener('click', () => updateShotCount(btn.dataset.shotCount));
});

document.querySelectorAll('.print-size-option').forEach(btn => {
  btn.addEventListener('click', () => {
    if (capturingSequence) return;
    printSize = btn.dataset.printSize;
    document.querySelectorAll('.print-size-option').forEach(b => {
      const active = b.dataset.printSize === printSize;
      b.classList.toggle('selected', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    // A 2×6 print is inherently a strip format, so switch to Photo Strip.
    if (printSize === '2x6' && selectedFrame !== 'strip') updateFrameSelection('strip');
    frameArt.src = `${frameVariantSrc()}?v=${Date.now()}`;
    setLiveSlotPosition();
    setStatus(`${PRINT_SIZES[printSize].label} · ${shotLabel()} · ${currentFrame().name} ready.`);
  });
});

document.querySelectorAll('.frame-option').forEach(btn => {
  btn.addEventListener('click', () => updateFrameSelection(btn.dataset.frame));
});

startBtn.addEventListener('click', startCamera);

window.addEventListener('DOMContentLoaded', () => {
  setLiveSlotPosition();
  updateShotCount(shotCount);
  document.querySelectorAll('.print-size-option').forEach(btn => {
    const active = btn.dataset.printSize === printSize;
    btn.classList.toggle('selected', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  updateCaptureButton();
  setTimeout(() => startCamera(), 300);
});

switchBtn.addEventListener('click', async () => {
  if (capturingSequence) return;
  facingMode = facingMode === 'user' ? 'environment' : 'user';
  await startCamera();
});

captureBtn.addEventListener('click', capturePhoto);
redoBtn.addEventListener('click', redoPhoto);
submitBtn.addEventListener('click', submitPhoto);
downloadBtn.addEventListener('click', downloadPhoto);
window.addEventListener('pagehide', stopCamera);

})();
