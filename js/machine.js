import {BASE_WORDS,CATEGORY_DISPLAY_LABELS as CATEGORY_LABELS} from '../data/words/index.js';
import {getMyWords,getHiddenWordIds,getElementDrop,setElementDrop,saveDrop,getDoodle,setDoodle} from './storage.js';
import {DROP_SIZE,uniquePool,freshDrop,replaceSlot,removeSlot,toggleLock,unlockAll,formatDrop} from './element-drop.js';
import {createVisualTrace,visualTraceSvg} from './doodle-card.js';
import {initNav,escapeHtml} from './common.js';

initNav();
const slots=document.querySelector('.drop-slots');
const line=document.querySelector('.drop-line');
const picker=document.querySelector('.manual-picker');
const pickerInput=picker.querySelector('input');
const pickerResults=picker.querySelector('.picker-results');
const visualNote=document.querySelector('.visual-note');
const doodlePaper=document.querySelector('.doodle-paper');
let words=getElementDrop();
let doodle=getDoodle();
let selectedSlot=0;
let toastTimer;

const currentPool=()=>uniquePool(BASE_WORDS,getMyWords(),getHiddenWordIds());
const categoryLabel=category=>CATEGORY_LABELS[category]||category;

if(!words.length){
  words=freshDrop([],currentPool());
  setElementDrop(words);
}

function say(text){const toast=document.querySelector('.toast');clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)}
const sameDoodleWords=()=>doodle?.words?.join('\u0000')===words.map(word=>word.text).join('\u0000');
function refreshDoodle(){
  if(!words.length)return;
  doodle=createVisualTrace(words);
  setDoodle(doodle);
}
function render(){
  slots.innerHTML=words.map((word,index)=>`<article class="drop-card ${word.locked?'is-locked':''}">
    <span class="slot-number">${String(index+1).padStart(2,'0')}</span>
    <button class="lock-word" data-lock="${index}" aria-pressed="${word.locked}" aria-label="${word.locked?'解锁':'锁定'} ${escapeHtml(word.text)}">${word.locked?'● LOCKED':'○ LOCK'}</button>
    <strong>${escapeHtml(word.text)}</strong>
    <small>${escapeHtml(categoryLabel(word.category))}</small>
    <div class="card-actions"><button class="replace-word" data-replace="${index}">替换</button><button class="remove-word" data-remove="${index}" aria-label="从本轮移除 ${escapeHtml(word.text)}">删除</button></div>
  </article>`).join('');
  line.textContent=formatDrop(words);
  visualNote.hidden=!words.length;
  if(words.length){
    if(!sameDoodleWords())refreshDoodle();
    doodlePaper.innerHTML=visualTraceSvg(doodle,words);
  }else{
    doodlePaper.innerHTML='';
  }
}
function persist(refresh=false){setElementDrop(words);if(refresh)refreshDoodle();render()}
function openPicker(index=0){selectedSlot=index;picker.hidden=false;pickerInput.value='';renderPicker();picker.scrollIntoView({behavior:'smooth',block:'center'});pickerInput.focus()}
function closePicker(){picker.hidden=true}
function renderPicker(){
  const query=pickerInput.value.trim().toLowerCase();
  const shown=currentPool().filter(word=>!query||[word.text,word.category,...(word.tags||[])].join(' ').toLowerCase().includes(query)).slice(0,96);
  pickerResults.innerHTML=shown.map(word=>`<button data-word="${escapeHtml(word.id)}"><span>${escapeHtml(word.text)}</span><small>${escapeHtml(categoryLabel(word.category))}</small></button>`).join('')||'<p class="empty">没有找到这个词，可以去词仓添加。</p>';
}
async function copyCurrent(){
  const text=formatDrop(words);
  if(!text){say('当前没有可复制的词。');return}
  try{await navigator.clipboard.writeText(text)}catch{const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();document.execCommand('copy');area.remove()}
  say('已复制：'+text);
}

slots.addEventListener('click',event=>{
  const lock=event.target.closest('[data-lock]');
  const replace=event.target.closest('[data-replace]');
  const remove=event.target.closest('[data-remove]');
  if(lock){words=toggleLock(words,Number(lock.dataset.lock));persist()}
  if(replace)openPicker(Number(replace.dataset.replace));
  if(remove){
    const index=Number(remove.dataset.remove),removed=words[index];
    words=removeSlot(words,index);
    closePicker();
    persist(true);
    say(`${removed?.text||'这个词'} 已从本轮移除。`);
  }
});
document.querySelector('.drop-controls').addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='new'){
    if(words.length===DROP_SIZE&&words.every(word=>word.locked)){say('七个词都已锁定，请先解锁一个。');return}
    words=freshDrop(words,currentPool());persist(true);say('新的七个元素已经掉落。');
  }
  if(action==='manual')openPicker(words.findIndex(word=>!word.locked)>=0?words.findIndex(word=>!word.locked):0);
  if(action==='copy')copyCurrent();
  if(action==='save'){
    if(!words.length){say('当前没有可保存的词。');return}
    saveDrop({words:words.map(word=>({...word})),doodle:words.length?{...doodle}:null,format:'elements-v2'});say('已保存这组词。');
  }
});
document.querySelector('[data-action="unlock"]').addEventListener('click',()=>{words=unlockAll(words);persist();say('当前词语已全部解锁。')});
picker.querySelector('.picker-close').addEventListener('click',closePicker);
pickerInput.addEventListener('input',renderPicker);
pickerResults.addEventListener('click',event=>{
  const id=event.target.closest('[data-word]')?.dataset.word;
  const word=currentPool().find(item=>item.id===id);
  if(!word)return;
  words=replaceSlot(words,selectedSlot,word);persist(true);closePicker();say(`${word.text} 已放入第 ${selectedSlot+1} 格。`);
});
render();
