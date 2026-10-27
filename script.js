'use strict';

const closet = document.querySelector('#closet');
const shell = document.querySelector('#closet-shell');
const room = document.querySelector('#room');
const walken = document.querySelector('#walken');
const count = document.querySelector('#count');
// These labels are optional; the animation also works without the status bar.
const status = document.querySelector('#status');
const ready = document.querySelector('#ready');
const counter = document.querySelector('.counter');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let busy = false;
let total = 0;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const remarks = ['Room for one more. Somehow.', 'A truly outstanding closet performance.', 'The square footage remains a mystery.', 'He seems comfortable in there.', 'Walken storage: surprisingly efficient.'];

closet.addEventListener('click', async () => {
  if (busy) return;
  const hadFocus = document.activeElement === closet;
  busy = true;
  closet.disabled = true;
  room.classList.add('busy');
  if (ready) ready.textContent = 'CHRISTOPHER IS COMMUTING…';
  if (status) status.textContent = 'Please mind the dramatic entrance.';
  const quick = reducedMotion.matches;
  let entrance;
  try {
    // Keep the door open for the whole walk. Count only after it closes.
    shell.classList.add('open');
    await pause(quick ? 130 : 700);
    const frames = quick ? [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(135%)', opacity: 0 }
    ] : [
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1, offset: 0 },
      { transform: 'translate(18%, -2%) rotate(-9deg)', opacity: 1, offset: .14 },
      { transform: 'translate(38%, 0) rotate(8deg)', opacity: 1, offset: .28 },
      { transform: 'translate(60%, -2%) rotate(-10deg)', opacity: 1, offset: .42 },
      { transform: 'translate(83%, 0) rotate(9deg)', opacity: 1, offset: .56 },
      { transform: 'translate(108%, -2%) rotate(-8deg) scale(.94)', opacity: 1, offset: .7 },
      { transform: 'translate(131%, -3%) rotate(7deg) scale(.83)', opacity: 1, offset: .84 },
      { transform: 'translate(143%, -4%) rotate(0deg) scale(.65)', opacity: 0, offset: 1 }
    ];
    entrance = walken.animate(frames, { duration: quick ? 160 : 2300, easing: 'linear', fill: 'forwards' });
    await entrance.finished;
    shell.classList.remove('open');
    await pause(quick ? 130 : 700);
    total += 1;
    count.textContent = total.toLocaleString();
    counter.classList.remove('pop');
    void counter.offsetWidth;
    counter.classList.add('pop');
    if (status) status.textContent = remarks[(total - 1) % remarks.length];
  } catch (error) {
    if (status) status.textContent = 'Christopher missed his cue. Try the closet again.';
    console.error('Closet animation failed:', error);
    shell.classList.remove('open');
  } finally {
    entrance?.cancel();
    room.classList.remove('busy');
    busy = false;
    closet.disabled = false;
    if (ready) ready.innerHTML = '<b>✳</b> READY FOR ANOTHER';
    // Restore keyboard focus only if it was already on the door.
    if (hadFocus && (document.activeElement === document.body || document.activeElement === closet)) {
      closet.focus({ preventScroll: true });
    }
  }
});

walken.querySelector('img').addEventListener('error', () => {
  if (status) status.textContent = 'Christopher is missing! Restore assets/walken.png, then reload.';
  closet.disabled = true;
  if (ready) ready.textContent = 'WAITING FOR CHRISTOPHER';
});
