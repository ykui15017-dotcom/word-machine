import {BASE_WORDS,CATEGORIES,CATEGORY_LABELS,CATEGORY_DISPLAY_LABELS} from '../data/words/index.js';
import {getMyWords,addMyWord,removeMyWord,getHiddenWordIds,hideBaseWord,restoreHiddenWords,getElementDrop,setElementDrop} from './storage.js';
import {DROP_SIZE,uniquePool,freshDrop,replaceSlot} from './element-drop.js';
import {initNav,escapeHtml} from './common.js';

initNav();
const LABELS={...CATEGORY_LABELS,...CATEGORY_DISPLAY_LABELS};
const filters=document.querySelector('.filters');
const list=document.querySelector('.word-list');
const input=document.querySelector('.search');
const count=document.querySelector('.bank-count');
const restoreButton=document.querySelector('.restore-hidden');
const form=document.querySelector('.my-word-form');
const categorySelect=form.querySelector('select');
let active=location.hash==='#my-words'?'my-words':'all';
let selectedSlot=0;
let toastTimer;
let words=getElementDrop();

categorySelect.innerHTML=CATEGORIES.map(category=>`<option value="${category}">${LABELS[category]}</option>`).join('');
if(words.length!==DROP_SIZE){words=freshDrop(words,uniquePool(BASE_WORDS,getMyWords(),getHiddenWordIds()));setElementDrop(words)}

function allWords(){return uniquePool(BASE_WORDS,getMyWords(),getHiddenWordIds())}
function say(text){const toast=document.querySelector('.toast');clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)}
function renderFilters(){const labels=[['all','全部'],...CATEGORIES.map(category=>[category,LABELS[category]]),['my-words','我的词语']];filters.innerHTML=labels.map(([value,label])=>`<button class="filter ${active===value?'active':''}" data-cat="${value}">${escapeHtml(label)}</button>`).join('')}
function renderDock(){document.querySelector('.dock-ingredients').innerHTML=words.map((word,index)=>`<button class="dock-slot ${selectedSlot===index?'active':''}" data-slot="${index}"><span>0${index+1}</span><strong>${escapeHtml(word.text)}</strong><small>${escapeHtml(LABELS[word.category]||word.category)}</small></button>`).join('')}
function render(){
  renderFilters();
  const query=input.value.trim().toLowerCase();
  const all=allWords();
  const shown=all.filter(word=>(active==='all'||(active==='my-words'?word.source==='user':word.category===active))&&(!query||[word.text,word.category,...(word.tags||[])].join(' ').toLowerCase().includes(query)));
  count.textContent=`${shown.length} / ${all.length} 个元素词`;
  const currentTexts=new Set(words.map(word=>word.text));
  list.innerHTML=shown.slice(0,500).map(word=>`<article class="bank-word"><span class="word-index"><b>${escapeHtml(word.text)}</b><small>${escapeHtml(LABELS[word.category]||word.category)}</small></span><button class="delete-word" data-delete="${escapeHtml(word.id)}">${word.source==='user'?'删除':'隐藏'}</button><button class="add-machine ${currentTexts.has(word.text)?'added':''}" data-id="${escapeHtml(word.id)}">${currentTexts.has(word.text)?'✓ 已在机器中':`放入第 ${selectedSlot+1} 格`}</button></article>`).join('')+(shown.length>500?'<p class="empty">结果较多，请继续输入关键词缩小范围。</p>':'');
  restoreButton.hidden=getHiddenWordIds().length===0;
  renderDock();
}

filters.addEventListener('click',event=>{const category=event.target.closest('[data-cat]')?.dataset.cat;if(!category)return;active=category;render()});
input.addEventListener('input',render);
list.addEventListener('click',event=>{
  const deleteId=event.target.closest('[data-delete]')?.dataset.delete;
  if(deleteId){const word=allWords().find(item=>item.id===deleteId);if(word?.source==='user')removeMyWord(deleteId);else if(word)hideBaseWord(deleteId);say('已从当前词仓视图移除。');render();return}
  const id=event.target.closest('[data-id]')?.dataset.id;
  const word=allWords().find(item=>item.id===id);
  if(!word)return;
  words=replaceSlot(words,selectedSlot,word);setElementDrop(words);say(`${word.text} 已放入第 ${selectedSlot+1} 格。`);selectedSlot=(selectedSlot+1)%DROP_SIZE;render();
});
document.querySelector('.dock-ingredients').addEventListener('click',event=>{const slot=event.target.closest('[data-slot]')?.dataset.slot;if(slot===undefined)return;selectedSlot=Number(slot);render()});
restoreButton.addEventListener('click',()=>{restoreHiddenWords();render()});
form.addEventListener('submit',event=>{
  event.preventDefault();
  const raw=form.querySelector('textarea').value;
  const category=categorySelect.value;
  const existing=new Set(allWords().map(word=>word.text));
  const additions=[...new Set(raw.split(/[、，,\n]+/).map(text=>text.trim()).filter(Boolean))].filter(text=>!existing.has(text));
  additions.reverse().forEach((text,index)=>addMyWord({id:`user_${Date.now()}_${index}`,text,category,subcategory:'personal',tags:['我的词语',text],source:'user',weight:1}));
  form.reset();active='my-words';say(`已添加 ${additions.length} 个词。`);render();
});
render();
