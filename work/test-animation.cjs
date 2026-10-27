const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync('script.js', 'utf8');

function setup({ reduced = false, fail = false, optionalLabels = true } = {}) {
  const timers = [];
  const animations = [];
  const elements = {};
  function element() {
    const classes = new Set();
    return { textContent: '', innerHTML: '', disabled: false, listeners: {},
      classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) },
      addEventListener(name, fn) { this.listeners[name] = fn; },
      querySelector() { return this.image ??= element(); },
      focus() {},
      animate(frames, options) {
        let resolve, reject;
        const finished = new Promise((a,b) => { resolve=a; reject=b; });
        const animation = { frames, options, finished, finish: () => fail ? reject(new Error('test interruption')) : resolve(), cancelled:false, cancel() { this.cancelled=true; } };
        animations.push(animation);
        return animation;
      }
    };
  }
  const document = { querySelector: s => !optionalLabels && ['#ready', '#status'].includes(s) ? null : (elements[s] ??= element()), activeElement: null };
  vm.runInNewContext(source, {document, window:{matchMedia:()=>({matches:reduced})},setTimeout:fn=>timers.push(fn),console:{error(){}}});
  return { elements, timers, animations, click:()=>elements['#closet'].listeners.click() };
}
async function tick() { await Promise.resolve(); await Promise.resolve(); }
async function runCycle(s) {
  const operation = s.click();
  assert.equal(s.elements['#closet'].disabled, true);
  assert(s.elements['#closet-shell'].classList.contains('open'));
  await s.click(); // A synthetic duplicate must also be ignored.
  assert.equal(s.timers.length, 1);
  s.timers.shift()(); await tick();
  assert.equal(s.animations.length > 0, true);
  const animation = s.animations.at(-1);
  assert.notEqual(s.elements['#count'].textContent, '1');
  animation.finish(); await tick();
  assert.equal(s.elements['#closet-shell'].classList.contains('open'), false);
  if(s.timers.length) { s.timers.shift()(); await tick(); }
  await operation;
  assert.equal(s.elements['#closet'].disabled, false);
  assert.equal(s.elements['#room'].classList.contains('busy'), false);
  assert(animation.cancelled);
}
(async()=>{
  for (const optionalLabels of [true, false]) {
  const normal=setup({optionalLabels});
  await runCycle(normal);
  assert.equal(normal.elements['#count'].textContent,'1');
  const second=normal.click(); normal.timers.shift()(); await tick(); normal.animations.at(-1).finish(); await tick(); normal.timers.shift()(); await second;
  assert.equal(normal.elements['#count'].textContent,'2');
  const reduced=setup({reduced:true,optionalLabels}); await runCycle(reduced); assert.equal(reduced.animations[0].options.duration,160); assert.equal(reduced.elements['#count'].textContent,'1');
  const failed=setup({fail:true,optionalLabels}); await runCycle(failed); assert.equal(failed.elements['#count'].textContent,'');
  const missing=setup({optionalLabels}); missing.elements['#walken'].image.listeners.error(); assert.equal(missing.elements['#closet'].disabled,true);
  }
  console.log('PASS (with and without optional status labels): sequence, count after closure, duplicate-click guard, repeated cycles, reduced motion, failure recovery, missing-image handling.');
})().catch(e=>{console.error(e);process.exitCode=1;});
