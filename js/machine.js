import { newDrop, replaceUnlocked, addWord } from './random-engine.js';
import { buildSentence } from './sentence-builder.js';
import { saveDrop, setMachineState, getMachineState, takeIncoming } from './storage.js';
import { initNav, escapeHtml } from './common.js';

initNav();
const wrap = document.querySelector('.machine-wrap');
const button = document.querySelector('.drop-control');
const row = document.querySelector('.word-row');
const recipeBox = document.querySelector('.recipe-box');
const recipeText = document.querySelector('.recipe-text');
const aside = document.querySelector('.aside-message');
let state = getMachineState();
let started = 0;
let timer;
let mixMode = 'short';

const incoming = takeIncoming();
if (incoming) {
  const base = newDrop(4, [{ ...incoming, locked: true }], state?.recipe?.id);
  state = { ...base, recipeId: base.recipe.id };
}
if (!state?.words?.length) {
  const base = newDrop(4);
  state = { ...base, recipeId: base.recipe.id };
}

function persist() {
  setMachineState({ recipe: state.recipe, recipeId: state.recipe.id, words: state.words });
}

function render(animate = false) {
  row.innerHTML = state.words.map((word, index) => `
    <span class="word-chip ${animate ? 'enter' : ''}" data-category="${word.category}" style="animation-delay:${index * 80}ms">
      <i class="cat-dot" aria-hidden="true"></i>
      <span class="word-text">${escapeHtml(word.text)}</span>
      <small class="chip-category">${escapeHtml(word.category)}</small>
      <button class="lock" data-i="${index}" aria-label="${word.locked ? '解锁' : '锁定'} ${escapeHtml(word.text)}" aria-pressed="${Boolean(word.locked)}">${word.locked ? '●' : '○'}</button>
    </span>
  `).join('');
  persist();
}

function say(message) {
  aside.textContent = message;
  setTimeout(() => { if (aside.textContent === message) aside.textContent = ''; }, 2200);
}

function animateDrop() {
  const colors = ['var(--blue)', 'var(--yellow)', 'var(--red)', 'var(--sage)'];
  state.words.forEach((_, index) => setTimeout(() => {
    const pellet = document.createElement('i');
    pellet.className = 'drop-pellet';
    pellet.style.background = colors[index % colors.length];
    wrap.append(pellet);
    setTimeout(() => pellet.remove(), 650);
  }, index * 130));
  setTimeout(() => render(true), 220);
}

function freshDrop(count) {
  recipeBox.hidden = true;
  const locked = state.words.filter(word => word.locked);
  state = newDrop(count, locked, state.recipe?.id);
  animateDrop();
}

function start(event) {
  if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
  if (started) return;
  event.preventDefault();
  started = performance.now();
  wrap.classList.add('shaking');
  timer = setTimeout(() => wrap.classList.add('faster'), 900);
  button.setPointerCapture?.(event.pointerId);
}

function end(event) {
  if (!started) return;
  event.preventDefault();
  const held = performance.now() - started;
  started = 0;
  clearTimeout(timer);
  wrap.classList.remove('shaking', 'faster');
  freshDrop(held < 500 ? 3 : held < 1400 ? 4 : 5);
}

button.addEventListener('pointerdown', start);
button.addEventListener('pointerup', end);
button.addEventListener('pointercancel', end);
button.addEventListener('keydown', start);
button.addEventListener('keyup', end);

row.addEventListener('click', event => {
  const lock = event.target.closest('.lock');
  if (!lock) return;
  const word = state.words[Number(lock.dataset.i)];
  word.locked = !word.locked;
  render();
});

document.querySelector('.actions').addEventListener('click', event => {
  const action = event.target.dataset.action;
  if (action === 'again') {
    state = replaceUnlocked(state.words, state.recipe);
    recipeBox.hidden = true;
    render(true);
    say('same recipe, new ingredients.');
  }
  if (action === 'more') {
    state = addWord(state.words, state.recipe);
    recipeBox.hidden = true;
    render(true);
  }
  if (action === 'less' && state.words.length > 3) {
    const index = [...state.words].map((word, i) => ({ word, i })).reverse().find(item => !item.word.locked)?.i;
    if (index !== undefined) state.words.splice(index, 1);
    recipeBox.hidden = true;
    render();
  }
  if (action === 'mix') {
    mixMode = 'short';
    recipeText.textContent = buildSentence(state.words, state.recipe, mixMode);
    recipeBox.hidden = false;
    document.querySelectorAll('[data-mix-mode]').forEach(control => control.classList.toggle('active', control.dataset.mixMode === mixMode));
  }
  if (action === 'keep') {
    saveDrop({ words: state.words, recipe: recipeBox.hidden ? '' : recipeText.textContent, recipeId: state.recipe.id });
    say('keep this? saved.');
  }
});

document.querySelector('.mix-modes').addEventListener('click', event => {
  if (!event.target.dataset.mixMode) return;
  mixMode = event.target.dataset.mixMode;
  recipeText.textContent = buildSentence(state.words, state.recipe, mixMode);
  document.querySelectorAll('[data-mix-mode]').forEach(control => control.classList.toggle('active', control.dataset.mixMode === mixMode));
});

render();
