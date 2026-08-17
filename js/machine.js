import {BASE_WORDS,CATEGORIES,CATEGORY_DISPLAY_LABELS as CATEGORY_LABELS} from '../data/words/index.js';
import {getMyWords,addMyWord,getHiddenWordIds,getElementDrop,setElementDrop,saveDrop,getRecentElementDrops,rememberElementDrop} from './storage.js';
import {DROP_SIZE,uniquePool,freshDrop,replaceSlot,toggleLock,unlockAll,formatDrop} from './element-drop.js';
import {initNav,escapeHtml} from './common.js';

initNav();
const slots=document.querySelector('.drop-slots');
const line=document.querySelector('.drop-line');
const picker=document.querySelector('.manual-picker');
const pickerInput=picker.querySelector('input');
const pickerResults=picker.querySelector('.picker-results');
const quickForm=document.querySelector('.quick-word-form');
const quickInput=quickForm.querySelector('input');
const quickCategory=quickForm.querySelector('select');
const myWordChips=document.querySelector('.my-word-chips');
const recentDrops=document.querySelector('.recent-drops');
let words=getElementDrop();
let selectedSlot=0;
let toastTimer;

const currentPool=()=>uniquePool(BASE_WORDS,getMyWords(),getHiddenWordIds());
const categoryLabel=category=>CATEGORY_LABELS[category]||category;
quickCategory.innerHTML=CATEGORIES.map(category=>`<option value="${category}">${escapeHtml(categoryLabel(category))}</option>`).join('');

if(words.length!==DROP_SIZE){
  words=freshDrop(words,currentPool());
  setElementDrop(words);
  rememberElementDrop(words);
}

function say(text){const toast=document.querySelector('.toast');clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)}
function renderPersonal(){
  const personal=getMyWords().slice(0,12);
  myWordChips.innerHTML=personal.length
    ?personal.map(word=>`<span class="my-word-chip"><b>${escapeHtml(word.text)}</b><small>${escapeHtml(categoryLabel(word.category))}</small></span>`).join('')
    :'<p class="desk-empty">还没有自己的词。想到一个，就从左边留下来。</p>';

  const history=getRecentElementDrops().slice(0,5);
  recentDrops.innerHTML=history.length
    ?history.map((entry,index)=>`<article class="recent-drop-row"><span class="recent-index">0${index+1}</span><p class="recent-drop-words">${entry.words.map(word=>escapeHtml(word.text)).join('、')}</p><button data-reuse-drop="${index}">USE AGAIN</button></article>`).join('')
    :'<p class="desk-empty">还没有历史组合。按一次 NEW DROP 后会出现在这里。</p>';
}
function render(){
  slots.innerHTML=words.map((word,index)=>`<article class="drop-card ${word.locked?'is-locked':''}">
    <span class="slot-number">0${index+1}</span>
    <button class="lock-word" data-lock="${index}" aria-pressed="${word.locked}" aria-label="${word.locked?'解锁':'锁定'} ${escapeHtml(word.text)}">${word.locked?'● LOCKED':'○ LOCK'}</button>
    <strong>${escapeHtml(word.text)}</strong>
    <small>${escapeHtml(categoryLabel(word.category))}</small>
    <button class="replace-word" data-replace="${index}">替换</button>
  </article>`).join('');
  line.textContent=formatDrop(words);
  renderPersonal();
}
function persist(remember=false){
  setElementDrop(words);
  if(remember)rememberElementDrop(words);
  render();
}
function openPicker(index=0){selectedSlot=index;picker.hidden=false;pickerInput.value='';renderPicker();picker.scrollIntoView({behavior:'smooth',block:'center'});pickerInput.focus()}
function closePicker(){picker.hidden=true}
function renderPicker(){
  const query=pickerInput.value.trim().toLowerCase();
  const shown=currentPool().filter(word=>!query||[word.text,word.category,...(word.tags||[])].join(' ').toLowerCase().includes(query)).slice(0,96);
  pickerResults.innerHTML=shown.map(word=>`<button data-word="${escapeHtml(word.id)}"><span>${escapeHtml(word.text)}</span><small>${escapeHtml(categoryLabel(word.category))}</small></button>`).join('')||'<p class="empty">没有找到这个词，可以去词仓添加。</p>';
}
async function copyCurrent(){
  const text=formatDrop(words);
  try{await navigator.clipboard.writeText(text)}catch{const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();document.execCommand('copy');area.remove()}
  say('已复制：'+text);
}

slots.addEventListener('click',event=>{
  const lock=event.target.closest('[data-lock]');
  const replace=event.target.closest('[data-replace]');
  if(lock){words=toggleLock(words,Number(lock.dataset.lock));persist(false)}
  if(replace)openPicker(Number(replace.dataset.replace));
});
document.querySelector('.drop-controls').addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='new'){
    if(words.every(word=>word.locked)){say('五个词都已锁定，请先解锁一个。');return}
    words=freshDrop(words,currentPool());persist(true);say('新的五个元素已经掉落。');
  }
  if(action==='manual')openPicker(words.findIndex(word=>!word.locked)>=0?words.findIndex(word=>!word.locked):0);
  if(action==='copy')copyCurrent();
  if(action==='save'){saveDrop({words:words.map(word=>({...word})),format:'elements-v2'});say('已保存这组词。')}
});
document.querySelector('[data-action="unlock"]').addEventListener('click',()=>{words=unlockAll(words);persist(false);say('五个词已全部解锁。')});
picker.querySelector('.picker-close').addEventListener('click',closePicker);
pickerInput.addEventListener('input',renderPicker);
pickerResults.addEventListener('click',event=>{
  const id=event.target.closest('[data-word]')?.dataset.word;
  const word=currentPool().find(item=>item.id===id);
  if(!word)return;
  words=replaceSlot(words,selectedSlot,word);persist(true);closePicker();say(`${word.text} 已放入第 ${selectedSlot+1} 格。`);
});
quickForm.addEventListener('submit',event=>{
  event.preventDefault();
  const category=quickCategory.value;
  const raw=quickInput.value;
  const existing=new Set([...BASE_WORDS,...getMyWords()].map(word=>word.text));
  const additions=[...new Set(raw.split(/[、，,]+/).map(text=>text.trim()).filter(Boolean))].filter(text=>!existing.has(text));
  if(!additions.length){say('这些词已经在词仓里了。');return}
  additions.slice().reverse().forEach((text,index)=>addMyWord({
    id:`user_${Date.now()}_${index}`,
    text,
    category,
    subcategory:'personal',
    tags:['我的词语',text],
    source:'user',
    weight:1
  }));
  quickForm.reset();
  renderPersonal();
  if(!picker.hidden)renderPicker();
  say(additions.length===1?`${additions[0]} 已加入 MY WORDS。`:`已加入 ${additions.length} 个词。`);
});
recentDrops.addEventListener('click',event=>{
  const index=event.target.closest('[data-reuse-drop]')?.dataset.reuseDrop;
  if(index===undefined)return;
  const entry=getRecentElementDrops()[Number(index)];
  if(!entry)return;
  words=entry.words.map(word=>({...word,locked:false}));
  setElementDrop(words);
  rememberElementDrop(words);
  render();
  say('这组词已经重新放回机器。');
  document.querySelector('.drop-machine')?.scrollIntoView({behavior:'smooth',block:'start'});
});
render();
