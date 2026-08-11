import {newDrop,replaceUnlocked,addWord,removeOptional,validateDrop} from './random-engine.js';
import {resolveRecipe} from '../data/recipes.js';
import {buildSentence} from './sentence-builder.js';
import {saveDrop,setMachineState,getMachineState,takeIncoming} from './storage.js';
import {initNav,escapeHtml} from './common.js';

initNav();
const wrap=document.querySelector('.machine-wrap'),lever=document.querySelector('.drop-lever'),row=document.querySelector('.word-row'),recipeBox=document.querySelector('.recipe-box'),recipeText=document.querySelector('.recipe-text'),aside=document.querySelector('.aside-message'),legend=document.querySelector('.category-legend');
let state=getMachineState(),mixMode='short',distance=state?.distance||'odd';
const categoryNames={object:'物件',container:'容器',space:'空间',living:'生命',organic:'有机物',material:'材质',action:'动作',state:'状态',relation:'关系',scale:'尺度',visual:'光线/视觉',concept:'概念',detail:'细节',observation:'生活观察'};
const incoming=takeIncoming();
if(incoming){const base=newDrop(4,[{...incoming,locked:true}],null,distance);state={...base,recipeId:base.recipe.id}}
if(state?.words?.length){state.recipe=resolveRecipe(state.recipeId||state.recipe?.id);if(!state.words.every(word=>word.role)||!validateDrop(state).valid)state=newDrop(4,state.words.filter(word=>word.locked),state.recipe,distance)}
if(!state?.words?.length){const base=newDrop(4,[],null,distance);state={...base,recipeId:base.recipe.id}}
function persist(){setMachineState({recipe:state.recipe,recipeId:state.recipe.id,words:state.words,distance})}
function render(animate=false){
  row.innerHTML=state.words.map((word,index)=>`<span class="word-chip ${animate?'enter':''} category-${word.category}" style="animation-delay:${index*80}ms" title="类别：${categoryNames[word.category]||word.category}"><i class="cat-dot"></i><span class="word-content"><small>${categoryNames[word.category]||word.category}</small>${escapeHtml(word.text)}</span><button class="lock" data-i="${index}" aria-label="${word.locked?'解锁':'锁定'} ${escapeHtml(word.text)}" aria-pressed="${!!word.locked}">${word.locked?'●':'○'}</button></span>`).join('');
  const shown=[...new Set(state.words.map(word=>word.category))];
  legend.innerHTML=shown.map(category=>`<span class="legend-item category-${category}"><i class="cat-dot"></i>${categoryNames[category]||category}</span>`).join('');
  persist();
}
function say(message){aside.textContent=message;setTimeout(()=>{if(aside.textContent===message)aside.textContent=''},2200)}
function drop(freshRecipe=true,count=3+Math.floor(Math.random()*3)){
  recipeBox.hidden=true;
  const locked=state.words.filter(word=>word.locked);
  state=newDrop(count,locked,freshRecipe?null:state.recipe,distance);
  const colors=['var(--blue)','var(--yellow)','var(--red)','var(--sage)'];
  state.words.forEach((_,index)=>setTimeout(()=>{const pellet=document.createElement('i');pellet.className='drop-pellet';pellet.style.background=colors[index%4];wrap.append(pellet);setTimeout(()=>pellet.remove(),650)},index*110));
  setTimeout(()=>render(true),180);
}
lever.addEventListener('click',()=>{wrap.classList.add('shaking');setTimeout(()=>wrap.classList.remove('shaking'),480);drop(true)});
row.addEventListener('click',event=>{const button=event.target.closest('.lock');if(!button)return;const word=state.words[+button.dataset.i];word.locked=!word.locked;render()});
document.querySelector('.actions').addEventListener('click',event=>{
  const action=event.target.dataset.action;if(!action)return;
  if(action==='again'){state=replaceUnlocked(state.words,state.recipe,distance);recipeBox.hidden=true;render(true);say('same recipe, new words.')}
  if(action==='more'){state=addWord(state.words,state.recipe,distance);render(true)}
  if(action==='less'){state.words=removeOptional(state.words,state.recipe);render()}
  if(action==='mix'){recipeText.textContent=buildSentence(state.words,state.recipe,mixMode);recipeBox.hidden=false}
  if(action==='keep'){saveDrop({words:state.words,recipe:recipeBox.hidden?'':recipeText.textContent,recipeId:state.recipe.id});say('keep this? saved.')}
});
recipeBox.addEventListener('click',event=>{const mode=event.target.dataset.mode;if(!mode)return;mixMode=mode;recipeBox.querySelectorAll('.mix-mode').forEach(button=>button.classList.toggle('active',button.dataset.mode===mode));recipeText.textContent=buildSentence(state.words,state.recipe,mixMode)});
document.querySelector('.distance-switch').addEventListener('click',event=>{const next=event.target.dataset.distance;if(!next)return;distance=next;document.querySelectorAll('[data-distance]').forEach(button=>button.classList.toggle('active',button.dataset.distance===distance));drop(false)});
document.querySelectorAll('[data-distance]').forEach(button=>button.classList.toggle('active',button.dataset.distance===distance));
render();
