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

// Geometry matches the NEW transparent frame assets.
// Each entry is [x, y, width, height] in the actual PNG's pixel coordinates.
const FRAME_GEOMETRY = {
  // Exact transparent photo-window geometry measured from the supplied frame PNGs.
  // Values are normalized to the selected print canvas so the live camera fills
  // every transparent photo opening instead of sitting inside a smaller box.
  classic: {
    1:[179/1800,124/1200,1442/1800,738/1200],
    2:[179/1800,132/1200,688/1800,707/1200,951/1800,132/1200,670/1800,707/1200],
    3:[179/1800,135/1200,470/1800,682/1200,724/1800,135/1200,479/1800,682/1200,1279/1800,135/1200,479/1800,682/1200]
  },
  strip: {
    1:[226/1800,252/1200,1362/1800,611/1200],
    2:[226/1800,255/1200,1362/1800,253/1200,226/1800,546/1200,1362/1800,276/1200],
    3:[226/1800,233/1200,1362/1800,232/1200,226/1800,493/1200,1362/1800,231/1200,226/1800,753/1200,1362/1800,237/1200]
  },
  elegant: {
    1:[196/1800,141/1200,1385/1800,758/1200],
    2:[196/1800,154/1200,669/1800,822/1200,920/1800,154/1200,665/1800,822/1200],
    3:[196/1800,159/1200,437/1800,845/1200,674/1800,159/1200,438/1800,845/1200,1157/1800,159/1200,428/1800,845/1200]
  },
  elegant: {
    1:[196/1800,141/1200,1385/1800,758/1200],
    2:[196/1800,154/1200,669/1800,822/1200,920/1800,154/1200,665/1800,822/1200],
    3:[196/1800,159/1200,437/1800,845/1200,674/1800,159/1200,438/1800,845/1200,1157/1800,159/1200,428/1800,845/1200]
  },
  botanical: {
    1:[180/1800,228/1200,1440/1800,792/1200],
    2:[162/1800,240/1200,702/1800,768/1200,936/1800,240/1200,702/1800,768/1200],
    3:[144/1800,240/1200,450/1800,768/1200,675/1800,240/1200,450/1800,768/1200,1206/1800,240/1200,450/1800,768/1200]
  },
  champagne: {
    1:[180/1800,228/1200,1440/1800,792/1200],
    2:[162/1800,240/1200,702/1800,768/1200,936/1800,240/1200,702/1800,768/1200],
    3:[144/1800,240/1200,450/1800,768/1200,675/1800,240/1200,450/1800,768/1200,1206/1800,240/1200,450/1800,768/1200]
  },
  sage: {
    1:[180/1800,228/1200,1440/1800,792/1200],
    2:[162/1800,240/1200,702/1800,768/1200,936/1800,240/1200,702/1800,768/1200],
    3:[144/1800,240/1200,450/1800,768/1200,675/1800,240/1200,450/1800,768/1200,1206/1800,240/1200,450/1800,768/1200]
  },
  blush: {
    1:[180/1800,228/1200,1440/1800,792/1200],
    2:[162/1800,240/1200,702/1800,768/1200,936/1800,240/1200,702/1800,768/1200],
    3:[144/1800,240/1200,450/1800,768/1200,675/1800,240/1200,450/1800,768/1200,1206/1800,240/1200,450/1800,768/1200]
  },
  midnight: {
    1:[180/1800,228/1200,1440/1800,792/1200],
    2:[162/1800,240/1200,702/1800,768/1200,936/1800,240/1200,702/1800,768/1200],
    3:[144/1800,240/1200,450/1800,768/1200,675/1800,240/1200,450/1800,768/1200,1206/1800,240/1200,450/1800,768/1200]
  },
  coastal: {
    1:[180/1800,228/1200,1440/1800,792/1200],
    2:[162/1800,240/1200,702/1800,768/1200,936/1800,240/1200,702/1800,768/1200],
    3:[144/1800,240/1200,450/1800,768/1200,675/1800,240/1200,450/1800,768/1200,1206/1800,240/1200,450/1800,768/1200]
  },
  strip2x6: {
    1:[75/600,378/1800,454/600,917/1800],
    2:[75/600,382/1800,454/600,380/1800,75/600,820/1800,454/600,413/1800],
    3:[75/600,350/1800,454/600,347/1800,75/600,739/1800,454/600,348/1800,75/600,1129/1800,454/600,356/1800]
  },
  newStrip2x6: {
    1:[60/600,414/1800,480/600,864/1800],
    2:[60/600,360/1800,480/600,450/1800,60/600,900/1800,480/600,450/1800],
    3:[60/600,288/1800,480/600,360/1800,60/600,702/1800,480/600,360/1800,60/600,1116/1800,480/600,360/1800]
  }
};

function printDims(){ return PRINT_SIZES[printSize] || PRINT_SIZES['4x6']; }
function normalizedSlots(key=selectedFrame,count=shotCount){
  const frame = FRAME_OPTIONS[key] || FRAME_OPTIONS.classic;
  let geom = FRAME_GEOMETRY[key];
  if (printSize === '2x6') {
    geom = frame.legacy ? FRAME_GEOMETRY.strip2x6 : FRAME_GEOMETRY.newStrip2x6;
  }
  const a = geom && geom[count];
  if (!a) return [];
  const out=[];
  for(let i=0;i<a.length;i+=4) out.push([a[i]*printDims().w,a[i+1]*printDims().h,a[i+2]*printDims().w,a[i+3]*printDims().h]);
  return out;
}
function frameCanvasSpec(){ const s=printDims(); return {w:s.w,h:s.h,slots:normalizedSlots()}; }

const FRAME_OPTIONS = {
  classic: {name:'Classic Collage', src:'assets/frame-1', legacy:true},
  strip: {name:'Photo Strip', src:'assets/frame-2', legacy:true},
  elegant: {name:'Elegant Trio', src:'assets/frame-3', legacy:true},
  botanical: {name:'Botanical Romance', src:'assets/frame-botanical'},
  champagne: {name:'Champagne Luxe', src:'assets/frame-champagne'},
  sage: {name:'Sage Garden', src:'assets/frame-sage'},
  blush: {name:'Blush Love', src:'assets/frame-blush'},
  midnight: {name:'Midnight Gold', src:'assets/frame-midnight'},
  coastal: {name:'Coastal Pearl', src:'assets/frame-coastal'}
};

let selectedFrame = 'classic';
let stream = null;
let facingMode = 'user';
let capturedBlob = null;
let capturedDataUrl = null;
let capturedPreviewUrl = null;
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

function frameVariantSrc(key=selectedFrame,count=shotCount){
  const frame = FRAME_OPTIONS[key] || FRAME_OPTIONS.classic;
  if (frame.legacy) {
    if(printSize==='2x6') return `assets/frame-2x6-${count}shot.png`;
    return `${frame.src}-${count}shot-${printSize}.png`;
  }
  return `${frame.src}-${count}shot-${printSize}.png`;
}

function framePreviewSrc(key=selectedFrame,count=shotCount){ return frameVariantSrc(key,count); }

function updateFrameImages() {
  document.querySelectorAll('.frame-option').forEach(btn => {
    const img = btn.querySelector('img');
    const disabled = false;
    btn.disabled = false;
    btn.classList.toggle('disabled', false);
    if (img) {
      img.src = `${framePreviewSrc(btn.dataset.frame)}?v=${Date.now()}`;
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
  if (!slot) return;

  cameraStage.style.setProperty('--live-x', `${slot[0] / spec.w * 100}%`);
  cameraStage.style.setProperty('--live-y', `${slot[1] / spec.h * 100}%`);
  cameraStage.style.setProperty('--live-w', `${slot[2] / spec.w * 100}%`);
  cameraStage.style.setProperty('--live-h', `${slot[3] / spec.h * 100}%`);
  cameraStage.style.aspectRatio = `${spec.w} / ${spec.h}`;
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

function clearCountdown() {
  countdown.classList.remove('show');
  countdown.textContent = '';
}

async function runCountdown() {
  clearCountdown();
  for (const n of [3, 2, 1]) {
    showCountdown(n);
    await new Promise(r => setTimeout(r, 900));
    // Never leave the last number on screen if capture/compositing takes time.
    clearCountdown();
    if (n !== 1) await new Promise(r => requestAnimationFrame(() => r()));
  }
}

function captureRawShot() {
  const slot = frameCanvasSpec().slots[0];
  if (!slot || slot.length < 4) throw new Error('The selected frame has no valid photo area.');

  const [, , slotW, slotH] = slot;
  const aspect = slotW / slotH;
  // Capture above the frame's preview resolution so the final print remains sharp.
  const targetW = Math.min(1920, Math.max(800, Math.round(slotW * 1.5)));
  const targetH = Math.round(targetW / aspect);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', {alpha:false});
  if (!ctx) throw new Error('Camera capture canvas is unavailable.');

  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const scale = Math.max(targetW / vw, targetH / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  const dx = (targetW - dw) / 2;
  const dy = (targetH - dh) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, targetW, targetH);
  ctx.clip();

  if (facingMode === 'user') {
    ctx.translate(targetW, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, -dx - dw, dy, dw, dh);
  } else {
    ctx.drawImage(video, dx, dy, dw, dh);
  }
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.96);
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

function canvasToBlob(canvas, type='image/jpeg', quality=0.94) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The browser returned an empty photo file.')), type, quality);
    } catch (err) {
      reject(err);
    }
  });
}

async function makeFinalImage() {
  const size = PRINT_SIZES[printSize] || PRINT_SIZES['4x6'];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d', {alpha:false});
  if (!ctx) throw new Error('Canvas is not available on this device.');

  const spec = frameCanvasSpec();
  if (!spec.slots || spec.slots.length < shotCount) {
    throw new Error(`Missing photo slots for ${shotCount} shot(s).`);
  }

  const frameSrc = frameVariantSrc();
  const frameImg = await loadImage(frameSrc);
  if (!frameImg.naturalWidth || !frameImg.naturalHeight) {
    throw new Error(`Frame asset could not be loaded: ${frameSrc}`);
  }

  // Fill the output background first, then place each captured camera image
  // into its exact transparent window, and finally place the frame artwork on top.
  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, size.w, size.h);

  const sx = size.w / spec.w;
  const sy = size.h / spec.h;
  for (let i = 0; i < shotCount; i++) {
    if (!shotImages[i]) throw new Error(`Missing captured image ${i + 1}.`);
    const img = await loadImage(shotImages[i]);
    if (!img.naturalWidth || !img.naturalHeight) throw new Error(`Captured image ${i + 1} is empty.`);
    const slot = spec.slots[i];
    drawCoverImage(ctx, img, {x:slot[0]*sx, y:slot[1]*sy, w:slot[2]*sx, h:slot[3]*sy});
  }

  ctx.drawImage(frameImg, 0, 0, size.w, size.h);

  // Use one blob for preview/download/upload. Avoid a second huge base64
  // conversion, which can fail on mobile browsers due to memory pressure.
  capturedBlob = await canvasToBlob(canvas, 'image/jpeg', 0.97);
  if (!capturedBlob || capturedBlob.size < 1000) {
    throw new Error('The browser could not encode the finished photo.');
  }

  if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
  capturedPreviewUrl = URL.createObjectURL(capturedBlob);
  capturedDataUrl = null;
  return capturedPreviewUrl;
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
      // Ensure the countdown overlay is completely gone before reading the camera frame.
      clearCountdown();
      await new Promise(r => requestAnimationFrame(() => r()));
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) {
        throw new Error('Camera video is not ready. Please restart the camera and try again.');
      }
      shotImages.push(captureRawShot());
      setStatus(`Shot ${shotNumber} of ${shotCount} captured!`);
      if (i < shotCount - 1) await new Promise(r => setTimeout(r, 850));
    }

    setStatus(`Creating your ${shotLabel()} ${currentFrame().name} wedding photo…`);
    await makeFinalImage();

      captured.src = capturedPreviewUrl;
    booth.classList.add('capture-mode');
    previewActions.classList.add('show');
    setStatus(`Beautiful! Your ${shotLabel()} memory is ready. You can redo, download, or submit.`);
  } catch (err) {
    clearCountdown();
    console.error(err);
    const detail = err?.message ? ` (${err.message})` : '';
    setStatus(`The ${shotLabel()} photo could not be created. Please try again.${detail}`, 'error');
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
  if (capturedPreviewUrl) { URL.revokeObjectURL(capturedPreviewUrl); capturedPreviewUrl = null; }
  shotImages = [];
  booth.classList.remove('capture-mode');
  previewActions.classList.remove('show');
  captureBtn.disabled = !stream;
  switchBtn.disabled = !stream;
  setStatus(`${PRINT_SIZES[printSize].label} · ${currentFrame().name} selected — ready for ${shotLabel()}!`);
  updateCaptureButton();
}

async function downloadPhoto() {
  if (!capturedBlob) {
    setStatus('Finish taking the photo first, then tap Download photo.', 'error');
    return;
  }

  const filename = `Christian-Queency_${currentFrame().name.replace(/\s+/g,'-')}_${shotCount}-shot_${printSize}_${new Date().toISOString().replace(/[:.]/g,'-')}.jpg`;
  const url = URL.createObjectURL(capturedBlob);

  // Keep the download action tied directly to the user's tap. This works
  // reliably on Chrome/Android and desktop browsers.
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Some mobile browsers ignore the download attribute. Give the guest a
  // direct image tab as a fallback so the picture can still be saved.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000);

  setStatus(`Download started · ${printSize} · ${shotLabel()}.`, 'success');
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
    // Every new wedding frame includes a 2×6 variant; legacy frames keep their original strip asset.
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
