import {BASE_WORDS,CATEGORIES,CATEGORY_LABELS} from '../data/words/index.js';
import {getMyWords,getIngredients,addIngredient,removeIngredient,clearIngredients} from './storage.js';
import {initNav,escapeHtml} from './common.js';

initNav();
const filters=document.querySelector('.filters'),list=document.querySelector('.word-list'),input=document.querySelector('.search'),count=document.querySelector('.bank-count');
let active='all';
const labels=['all',...CATEGORIES,'my words'];
filters.innerHTML=labels.map((x,i)=>`<button class="filter ${i?'':'active'}" data-cat="${x.replace(' ','-')}">${CATEGORY_LABELS[x]||x.toUpperCase()}</button>`).join('');
const allWords=()=>[...BASE_WORDS,...getMyWords()];

function renderDock(){
  const chosen=getIngredients(),dock=document.querySelector('.dock-ingredients');
  dock.innerHTML=chosen.length?chosen.map(word=>`<span class="dock-card"><small>${escapeHtml(word.category)}</small>${escapeHtml(word.text)}<button data-remove="${escapeHtml(word.id)}" aria-label="删除 ${escapeHtml(word.text)}">×</button></span>`).join(''):'<p class="dock-empty">No ingredients yet — add a word from the index.</p>';
}
function render(){
  const q=input.value.trim().toLowerCase(),chosen=new Set(getIngredients().map(word=>word.id));
  const shown=allWords().filter(w=>(active==='all'||(active==='my-words'?w.source==='user':w.category===active))&&(!q||[w.text,w.category,...w.tags].join(' ').toLowerCase().includes(q)));
  count.textContent=`${shown.length} VISUAL UNITS`;
  list.innerHTML=shown.slice(0,300).map(w=>`<article class="bank-word"><span class="word-index">${escapeHtml(w.text)}</span><span class="category">${escapeHtml(w.category.toUpperCase())}</span><button class="add-machine ${chosen.has(w.id)?'added':''}" data-id="${escapeHtml(w.id)}">${chosen.has(w.id)?'✓ IN MACHINE':'+ ADD TO MACHINE'}</button></article>`).join('')+(shown.length>300?'<p class="empty">继续输入关键词以缩小结果。</p>':'');
  renderDock();
}
filters.addEventListener('click',e=>{if(!e.target.dataset.cat)return;active=e.target.dataset.cat;filters.querySelector('.active')?.classList.remove('active');e.target.classList.add('active');render()});
input.addEventListener('input',render);
list.addEventListener('click',e=>{const id=e.target.closest('[data-id]')?.dataset.id;if(!id)return;const existing=getIngredients().some(word=>word.id===id);existing?removeIngredient(id):addIngredient(allWords().find(word=>word.id===id));render()});
document.querySelector('.machine-dock').addEventListener('click',e=>{const id=e.target.closest('[data-remove]')?.dataset.remove;if(id)removeIngredient(id);if(e.target.closest('.clear-ingredients'))clearIngredients();render()});
render();
