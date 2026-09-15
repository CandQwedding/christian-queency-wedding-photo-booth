(() => {
'use strict';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const preloader = $('#preloader');
const welcome = $('#welcome');
const openInvitation = $('#openInvitation');
window.addEventListener('load', () => setTimeout(() => preloader?.classList.add('hide'), 650));
window.openWeddingInvitation = function(){
  if (!welcome) return;
  welcome.classList.add('hide');
  document.body.classList.remove('welcome-open');
  setTimeout(() => {
    const home = $('#home');
    if (home) home.scrollIntoView({behavior:'smooth', block:'start'});
  }, 100);
};
openInvitation?.addEventListener('click', window.openWeddingInvitation);

// Mobile menu
const toggle = $('.menu-toggle');
const links = $('.nav-links');
toggle?.addEventListener('click', () => {
  const open = links?.classList.toggle('open') ?? false;
  toggle.setAttribute('aria-expanded', String(open));
});
$$('.nav-links a').forEach(a => a.addEventListener('click', () => {
  links?.classList.remove('open');
  toggle?.setAttribute('aria-expanded','false');
}));

// Hide navigation on downward scroll
let lastY = window.scrollY;
const nav = $('#nav');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (nav) nav.classList.toggle('hide', y > 120 && y > lastY);
  lastY = y;
}, {passive:true});

// Reveal animations
const reveal = els => {
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible','is-visible')); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible','is-visible'); observer.unobserve(entry.target); }
  }), {threshold:.12});
  els.forEach(el => observer.observe(el));
};
reveal($$('.reveal'));

// Countdown
const target = new Date('2026-10-10T07:30:00+08:00').getTime();
function updateCountdown(){
  const diff = Math.max(0, target - Date.now());
  const vals = {
    days: Math.floor(diff/86400000),
    hours: Math.floor(diff%86400000/3600000),
    minutes: Math.floor(diff%3600000/60000),
    seconds: Math.floor(diff%60000/1000)
  };
  Object.entries(vals).forEach(([id,v]) => { const el=$('#'+id); if(el) el.textContent=String(v).padStart(2,'0'); });
}
updateCountdown(); setInterval(updateCountdown,1000);

// Music
const music = $('#weddingMusic');
const musicButton = $('#musicButton');
musicButton?.addEventListener('click', async () => {
  if (!music) return;
  try {
    if (music.paused) {
      await music.play();
      musicButton.classList.add('active');
      musicButton.setAttribute('aria-pressed','true');
      musicButton.textContent='Ⅱ Music';
    } else {
      music.pause();
      musicButton.classList.remove('active');
      musicButton.setAttribute('aria-pressed','false');
      musicButton.textContent='♪ Music';
    }
  } catch(e) {
    musicButton.title='Unable to play the wedding music. Check that assets/wedding-music.mp3 is present.';
  }
});

// Add to calendar
$('#calendarButton')?.addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Christian Queency Wedding//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    'UID:christian-queency-20261010@example.local','DTSTAMP:20260910T000000Z',
    'DTSTART:20261010T073000','DTEND:20261010T120000',
    'SUMMARY:Christian & Queency Wedding',
    'LOCATION:St. James the Greater Parish, Batangas / Namuco, Rosario, Batangas',
    'DESCRIPTION:Wedding ceremony and reception for Christian & Queency.','END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='Christian-and-Queency-Wedding.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});

// RSVP sends directly to the couple's email without opening an email app.
// FormSubmit provides the email delivery endpoint for this static website.
const RSVP_EMAIL='queencypineda29@gmail.com';
const rsvpForm=$('#rsvpForm');
const rsvpStatus=$('#rsvpStatus');
const rsvpSubmit=$('#rsvpSubmit');
rsvpForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const form=e.currentTarget;
  const data=new FormData(form);
  data.set('_replyto', data.get('email') || '');
  data.set('_subject', 'RSVP — Christian & Queency Wedding');

  if(rsvpSubmit){ rsvpSubmit.disabled=true; rsvpSubmit.classList.add('is-loading'); rsvpSubmit.innerHTML='Sending RSVP <span aria-hidden=\"true\">…</span>'; }
  if(rsvpStatus){ rsvpStatus.textContent='Sending your RSVP…'; rsvpStatus.className='form-note is-sending'; }

  try {
    const response=await fetch(`https://formsubmit.co/ajax/${RSVP_EMAIL}`, {
      method:'POST',
      headers:{'Accept':'application/json'},
      body:data
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok || result.success === false) throw new Error('RSVP could not be sent.');

    form.reset();
    if(rsvpStatus){
      rsvpStatus.textContent='Thank you! Your RSVP has been sent successfully. We look forward to celebrating with you.';
      rsvpStatus.className='form-note is-success';
    }
  } catch(err) {
    if(rsvpStatus){
      rsvpStatus.textContent='We could not send your RSVP right now. Please try again in a moment.';
      rsvpStatus.className='form-note is-error';
    }
  } finally {
    if(rsvpSubmit){ rsvpSubmit.disabled=false; rsvpSubmit.classList.remove('is-loading'); rsvpSubmit.innerHTML='Send RSVP <span aria-hidden=\"true\">↗</span>'; }
  }
});

// Falling petals
const petals = $('#petals');
function makePetal(){
  if(!petals) return;
  const p=document.createElement('i'); p.className='petal';
  p.style.left=Math.random()*100+'%'; p.style.animationDuration=(7+Math.random()*8)+'s';
  p.style.animationDelay=(Math.random()*2)+'s'; p.style.opacity=(.3+Math.random()*.45).toFixed(2);
  petals.appendChild(p); setTimeout(()=>p.remove(),17000);
}
for(let i=0;i<12;i++) setTimeout(makePetal,i*350);
setInterval(makePetal,900);

// Gallery lightbox
const lb = $('#photoLightbox');
const imgs = $$('#gallery .photo img');
if(lb && imgs.length){
  const viewer=$('img',lb); let current=0;
  const show=i=>{
    current=(i+imgs.length)%imgs.length;
    viewer.src=imgs[current].src; viewer.alt=imgs[current].alt||'Wedding photo';
    lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  };
  const close=()=>{lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow=''; viewer.removeAttribute('src');};
  imgs.forEach((img,i)=>img.closest('.photo')?.addEventListener('click',()=>show(i)));
  $('.lightbox-close',lb)?.addEventListener('click',close);
  $('.lightbox-prev',lb)?.addEventListener('click',()=>show(current-1));
  $('.lightbox-next',lb)?.addEventListener('click',()=>show(current+1));
  lb.addEventListener('click',e=>{if(e.target===lb) close();});
  document.addEventListener('keydown',e=>{
    if(!lb.classList.contains('open')) return;
    if(e.key==='Escape') close();
    if(e.key==='ArrowLeft') show(current-1);
    if(e.key==='ArrowRight') show(current+1);
  });
}

// Make all internal anchor links smooth and safe
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href'); if(!id || id==='#') return;
  const targetEl=$(id); if(targetEl){e.preventDefault(); targetEl.scrollIntoView({behavior:'smooth',block:'start'});}
}));
})();

// Modern wedding confetti + scroll progress
(() => {
  const layer = document.getElementById('confettiLayer');
  const nav = document.getElementById('nav');
  if (!layer) return;

  const pieces = 32;
  const shapes = ['#b98372','#c7a06b','#e2c4a7','#8b6550','#f4d9c8','#fff7ee'];
  for(let i=0;i<pieces;i++){
    const p=document.createElement('i');
    p.className='confetti-piece';
    p.style.left=(Math.random()*100).toFixed(2)+'%';
    p.style.background=shapes[i%shapes.length];
    p.style.animationDuration=(9+Math.random()*13).toFixed(2)+'s';
    p.style.animationDelay=(-Math.random()*20).toFixed(2)+'s';
    p.style.opacity=(.3+Math.random()*.42).toFixed(2);
    p.style.transform=`rotate(${Math.random()*360}deg)`;
    layer.appendChild(p);
  }

  const updateProgress=()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const progress=max>0 ? (window.scrollY/max)*100 : 0;
    nav?.style.setProperty('--scroll-progress',progress.toFixed(2)+'%');
    nav?.classList.toggle('scrolling',window.scrollY>20);
  };
  updateProgress();
  window.addEventListener('scroll',updateProgress,{passive:true});
})();
