import {BASE_WORDS,CATEGORIES,CATEGORY_LABELS,CATEGORY_DISPLAY_LABELS} from '../data/words/index.js';
import {getMyWords,addMyWord,removeMyWord} from './storage.js';
import {initNav,escapeHtml} from './common.js';

initNav();
const LABELS={...CATEGORY_LABELS,...CATEGORY_DISPLAY_LABELS};
const form=document.querySelector('.my-word-form');
const textarea=form.querySelector('textarea');
const categorySelect=form.querySelector('select');
const list=document.querySelector('.my-word-list');
const count=document.querySelector('.my-word-count');
let toastTimer;

categorySelect.innerHTML=CATEGORIES.map(category=>`<option value="${category}">${escapeHtml(LABELS[category]||category)}</option>`).join('');

function say(text){const toast=document.querySelector('.toast');clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)}
function render(){
  const words=getMyWords();
  count.textContent=`${words.length} 个词`;
  list.innerHTML=words.length
    ?words.map(word=>`<article class="bank-word personal-word-row"><span class="word-index"><b>${escapeHtml(word.text)}</b></span><button class="delete-word" data-delete="${escapeHtml(word.id)}">删除</button></article>`).join('')
    :'<p class="empty">还没有自己的词。上面添加的词会出现在这里。</p>';
}

form.addEventListener('submit',event=>{
  event.preventDefault();
  const raw=textarea.value;
  const category=categorySelect.value;
  const existing=new Set([...BASE_WORDS,...getMyWords()].map(word=>word.text));
  const additions=[...new Set(raw.split(/[、，,\n]+/).map(text=>text.trim()).filter(Boolean))].filter(text=>!existing.has(text));
  if(!additions.length){say('这些词已经在词仓里了。');return}
  additions.slice().reverse().forEach((text,index)=>addMyWord({id:`user_${Date.now()}_${index}`,text,category,subcategory:'personal',tags:['我的词语',text],source:'user',weight:1}));
  form.reset();
  say(`已添加 ${additions.length} 个词。`);
  render();
});

list.addEventListener('click',event=>{
  const id=event.target.closest('[data-delete]')?.dataset.delete;
  if(!id)return;
  removeMyWord(id);
  say('已删除这个词。');
  render();
});

render();
