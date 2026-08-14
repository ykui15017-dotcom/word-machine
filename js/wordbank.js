import {BASE_WORDS,CATEGORIES,CATEGORY_LABELS} from '../data/words/index.js';
import {getMyWords,getIngredients,setIngredients,removeIngredient,clearIngredients} from './storage.js';
import {initNav,escapeHtml} from './common.js';
import {addManualToMachine} from './machine-logic.js';

initNav();
const filters=document.querySelector('.filters'),list=document.querySelector('.word-list'),input=document.querySelector('.search'),count=document.querySelector('.bank-count');
const guide=document.querySelector('.intent-guide');
const intent=new URLSearchParams(location.search).get('intent');
const intentConfig={
  path:{label:'路径 / 出口',description:'主体经过哪里、从哪里出来或沿哪里移动。',roles:['path']},
  result:{label:'结果形态',description:'动作完成后，元素最终呈现出的空间状态。',roles:['result']}
};
const currentIntent=intentConfig[intent];
let active='all';
let pendingWord=null;
const labels=['all',...CATEGORIES,'my words'];
filters.innerHTML=labels.map((x,i)=>`<button class="filter ${i?'':'active'}" data-cat="${x.replace(' ','-')}">${CATEGORY_LABELS[x]||x.toUpperCase()}</button>`).join('');
const allWords=()=>[...BASE_WORDS,...getMyWords()];
const roleOf=word=>word.syntaxRole||word.sentenceRole||word.role;
const matchesIntent=word=>!currentIntent||currentIntent.roles.includes(roleOf(word))||word.tags?.some(tag=>currentIntent.roles.includes(tag));

if(currentIntent){
  guide.hidden=false;
  guide.innerHTML=`<span>YOU ARE LOOKING FOR</span><strong>${escapeHtml(currentIntent.label)}</strong><p>${escapeHtml(currentIntent.description)}</p><a href="./index.html">← BACK TO MACHINE</a>`;
}

function renderDock(){
  const chosen=getIngredients(),dock=document.querySelector('.dock-ingredients');
  const cards=chosen.length?chosen.map(word=>`<span class="dock-card"><small>${escapeHtml(word.category)}</small>${escapeHtml(word.text)}<button data-remove="${escapeHtml(word.id)}" aria-label="删除 ${escapeHtml(word.text)}">×</button></span>`).join(''):'<p class="dock-empty">No ingredients yet — add a word from the index.</p>';
  const chooser=pendingWord?`<div class="replacement-chooser"><strong>当前已有 5 个元素，选择一个替换。</strong><div>${chosen.map(word=>`<button data-replace="${escapeHtml(word.id)}">${escapeHtml(word.text)}</button>`).join('')}</div><button class="cancel-replacement">取消</button></div>`:'';
  dock.innerHTML=cards+chooser;
}
function render(){
  const q=input.value.trim().toLowerCase(),chosen=new Set(getIngredients().map(word=>word.id));
  const shown=allWords().filter(w=>matchesIntent(w)&&(active==='all'||(active==='my-words'?w.source==='user':w.category===active))&&(!q||[w.text,w.category,...w.tags].join(' ').toLowerCase().includes(q)));
  count.textContent=`${shown.length} VISUAL UNITS`;
  list.innerHTML=shown.slice(0,300).map(w=>`<article class="bank-word"><span class="word-index">${escapeHtml(w.text)}</span><span class="category">${escapeHtml(w.category.toUpperCase())}</span><button class="add-machine ${chosen.has(w.id)?'added':''}" data-id="${escapeHtml(w.id)}">${chosen.has(w.id)?'✓ IN MACHINE':'+ ADD TO MACHINE'}</button></article>`).join('')+(shown.length>300?'<p class="empty">继续输入关键词以缩小结果。</p>':'');
  renderDock();
}
filters.addEventListener('click',e=>{if(!e.target.dataset.cat)return;active=e.target.dataset.cat;filters.querySelector('.active')?.classList.remove('active');e.target.classList.add('active');render()});
input.addEventListener('input',render);
list.addEventListener('click',e=>{const id=e.target.closest('[data-id]')?.dataset.id;if(!id)return;const current=getIngredients(),existing=current.some(word=>word.id===id);if(existing){removeIngredient(id);pendingWord=null}else{const result=addManualToMachine(current,allWords().find(word=>word.id===id));if(result.status==='choose')pendingWord=allWords().find(word=>word.id===id);else{setIngredients(result.items);pendingWord=null}}render()});
document.querySelector('.machine-dock').addEventListener('click',e=>{const replacement=e.target.closest('[data-replace]')?.dataset.replace;if(replacement&&pendingWord){setIngredients(getIngredients().map(word=>word.id===replacement?{...pendingWord,source:'manual',locked:true}:word));pendingWord=null;render();return}if(e.target.closest('.cancel-replacement')){pendingWord=null;render();return}const id=e.target.closest('[data-remove]')?.dataset.remove;if(id)removeIngredient(id);if(e.target.closest('.clear-ingredients')){clearIngredients();pendingWord=null}render()});
render();
