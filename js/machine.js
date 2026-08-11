import {newDrop,replaceUnlocked} from './random-engine.js';
import {buildSentence} from './sentence-builder.js';
import {saveDrop,setMachineState,getMachineState,getIngredients,removeIngredient,clearIngredients} from './storage.js';
import {initNav,escapeHtml} from './common.js';

initNav();
let state=getMachineState();
if(!state?.scenePlan) state=newDrop(4,[],null,'odd');
let developed=false;
const idea=document.querySelector('.recipe-text');
const message=document.querySelector('.aside-message');

function renderTray(){
  const ingredients=getIngredients();
  document.querySelectorAll('.ingredient-tray').forEach((tray,index)=>{
    tray.innerHTML=ingredients.length?ingredients.map(word=>`<span class="ingredient ${index?'compact':''}"><i class="category-${word.category}"></i><b>${escapeHtml(word.text)}</b><small>${escapeHtml(word.category)}</small><button data-remove="${escapeHtml(word.id)}" aria-label="删除 ${escapeHtml(word.text)}">×</button></span>`).join(''):`<a class="empty-slot" href="./word-bank.html">＋<small>ADD FROM ARCHIVE</small></a>`;
  });
}
function persist(){setMachineState({...state,distance:'odd'})}
function compose(){
  developed=false;
  idea.textContent=buildSentence(state.scenePlan,null,'short');
  persist();
}
function say(text){message.textContent=text;setTimeout(()=>{if(message.textContent===text)message.textContent=''},2400)}

document.addEventListener('click',event=>{
  const remove=event.target.closest('[data-remove]');
  if(remove){removeIngredient(remove.dataset.remove);renderTray();return}
  if(event.target.closest('.clear-ingredients')){clearIngredients();renderTray();return}
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='compose') compose();
  if(action==='another'){
    // Phase one deliberately leaves the persistent ingredient tray untouched.
    state=replaceUnlocked(state.words,state.operation,'odd');compose();say('Another arrangement; your ingredients stayed in place.');
  }
  if(action==='save'){
    saveDrop({words:state.words,recipe:idea.textContent,recipeId:state.operation.id,scenePlan:state.scenePlan,ingredients:getIngredients()});say('Idea saved.');
  }
  if(action==='develop'){
    developed=!developed;idea.textContent=buildSentence(state.scenePlan,null,developed?'expanded':'short');say(developed?'Expanded using the current Composer.':'Returned to the short idea.');
  }
});
renderTray();
