import {getSaved,removeSaved,setElementDrop,setDoodle} from './storage.js';
import {formatDrop} from './element-drop.js';
import {initNav,escapeHtml} from './common.js';
initNav();
const grid=document.querySelector('.saved-grid');
let toastTimer;
function say(text){const toast=document.querySelector('.toast');clearTimeout(toastTimer);toast.textContent=text;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)}
async function copy(text){try{await navigator.clipboard.writeText(text)}catch{const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();document.execCommand('copy');area.remove()}say('已复制这组词。')}
function validSaved(){return getSaved().filter(item=>Array.isArray(item.words)&&item.words.length)}
function render(){const saved=validSaved();grid.innerHTML=saved.length?saved.map(item=>{const text=formatDrop(item.words);return `<article class="saved-card"><time class="saved-date">${new Date(item.savedAt).toLocaleString('zh-CN')}</time><p class="saved-words">${escapeHtml(text)}</p><div class="saved-actions"><button class="tiny-button" data-open="${item.id}">重新打开</button><button class="text-button" data-copy="${item.id}">复制</button><button class="text-button" data-remove="${item.id}">删除</button></div></article>`}).join(''):'<p class="empty">还没有保存的词组。回到机器，让七个词先掉下来。</p>'}
grid.addEventListener('click',event=>{const id=event.target.dataset.open||event.target.dataset.copy||event.target.dataset.remove;const item=validSaved().find(saved=>saved.id===id);if(!item)return;if(event.target.dataset.remove){removeSaved(id);render()}if(event.target.dataset.copy)copy(formatDrop(item.words));if(event.target.dataset.open){setElementDrop(item.words);if(item.doodle)setDoodle(item.doodle);location.href='./index.html'}});
render();
