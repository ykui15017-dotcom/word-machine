import {createConstrainedDrop} from './constrained-drop.js';
import {saveDrop,getIngredients,setMachineState} from './storage.js';
import {initNav,escapeHtml} from './common.js';

initNav();
const roleLabels={subject:'核心主体',space:'空间 / 容器',condition:'状态 / 材质',relation:'关系 / 动作',view:'光线 / 视角',seed:'种子词'};
const recipe=document.querySelector('.recipe-text');
const roleStrip=document.querySelector('.role-strip');
const resultState=document.querySelector('.result-state');
const message=document.querySelector('.aside-message');
const actions=[...document.querySelectorAll('[data-action]')];
let current=null;
let currentMode=null;

const seed=()=>getIngredients()[0]||null;
const seedStatus=document.querySelector('.seed-status');
if(seed())seedStatus.textContent=`当前种子：${seed().text}`;

function render(drop){
  current=drop;
  roleStrip.innerHTML=drop.words.map(word=>`<article class="role-card ${word.isSeed?'is-seed':''}"><small>${escapeHtml(word.isSeed?'种子词':roleLabels[word.role]||word.category)}</small><b>${escapeHtml(word.text)}</b></article>`).join('');
  recipe.classList.remove('result-enter');void recipe.offsetWidth;
  recipe.textContent=drop.draft;recipe.classList.add('result-enter');
  resultState.textContent=`${drop.words.length} 个视觉元素 · 已整理成句`;
  actions.forEach(button=>button.disabled=false);
  setMachineState({dropMode:drop.mode,words:drop.words,composedText:drop.draft});
}
function run(mode){
  const selectedSeed=seed();
  if(mode==='seeded'&&!selectedSeed){message.textContent='请先进入词仓，选择 1 个种子词。';return}
  currentMode=mode;message.textContent='';render(createConstrainedDrop(mode,selectedSeed));
}
document.addEventListener('click',event=>{
  const entry=event.target.closest('[data-drop]');if(entry){run(entry.dataset.drop);return}
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='again'&&currentMode)run(currentMode);
  if(action==='save'&&current){saveDrop({words:current.words,ingredients:current.words,recipe:current.draft,recipeId:`constrained-${current.mode}`});message.textContent='视觉草稿已保存。'}
});
