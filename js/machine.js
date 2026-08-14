import {composeIngredients,normalizeIngredient,ROLE_LABELS,SCENE_ROLES} from './ingredient-composer.js';
import {completeConstrainedIngredients} from './constrained-drop.js';
import {saveDrop,setMachineState,getMachineState,getIngredients,setIngredients,setIngredientRole,removeIngredient,clearIngredients} from './storage.js';
import {initNav,escapeHtml} from './common.js';

initNav();
const idea=document.querySelector('.recipe-text');
const message=document.querySelector('.aside-message');
const resultState=document.querySelector('.result-state');
const developPanel=document.querySelector('.develop-panel');
const compositionDial=document.querySelector('.composition-dial');
let variation=0;
let hasResult=false;
let messageTimer;

const ingredientKey=items=>items.map(item=>`${item.id}:${item.userRoleOverride||''}`).join('|');
const savedState=getMachineState();
if(savedState?.composerKey===ingredientKey(getIngredients())&&savedState.composedText){
  idea.textContent=savedState.composedText;
  variation=savedState.variation||0;
  hasResult=true;
  resultState.textContent='已恢复构想';
}

function ingredientCard(word,compact=false){
  const normalized=normalizeIngredient(word);
  const roleOptions=SCENE_ROLES.map(role=>`<option value="${role}" ${normalized.finalRole===role?'selected':''}>${ROLE_LABELS[role]}</option>`).join('');
  return `<span class="ingredient ${compact?'compact':''}"><i class="category-${escapeHtml(word.category)}"></i><b>${escapeHtml(word.text)}</b><label class="role-control"><span class="sr-only">调整 ${escapeHtml(word.text)} 的角色</span><select data-role-for="${escapeHtml(word.id)}" title="调整词语角色">${roleOptions}</select></label><button data-remove="${escapeHtml(word.id)}" aria-label="删除 ${escapeHtml(word.text)}">×</button></span>`;
}
function refreshDraft(label='结构已更新'){
  const ingredients=getIngredients();
  if(!ingredients.length)return;
  const result=composeIngredients(ingredients,variation);
  idea.textContent=result.draftText||result.nextSuggestion;
  resultState.textContent=result.status==='ok'?label:result.nextSuggestion;
  idea.dataset.status=result.status;
  hasResult=Boolean(result.draftText);
  setMachineState({composerKey:ingredientKey(ingredients),composedText:idea.textContent,variation,words:ingredients,status:result.status,warnings:result.warnings});
}
function renderTray(){
  const ingredients=getIngredients();
  document.querySelectorAll('.ingredient-tray').forEach((tray,index)=>{
    tray.innerHTML=ingredients.length?ingredients.map(word=>ingredientCard(word,index>0)).join(''):(index>0?'<span class="tray-empty">还没有选择词语</span>':'');
  });
  if(!ingredients.length){hasResult=false;idea.textContent='从词库选择词语，再让它们在这里相遇。';resultState.textContent='等待词语'}
  else refreshDraft();
}
function say(text){
  clearTimeout(messageTimer);message.textContent=text;
  messageTimer=setTimeout(()=>{if(message.textContent===text)message.textContent=''},2600);
}
function spinDial(){
  compositionDial.classList.remove('is-spinning');
  void compositionDial.offsetWidth;
  compositionDial.classList.add('is-spinning');
}
function compose(isAnother=false){
  const ingredients=getIngredients();
  if(!ingredients.length){say('请先从词库添加词语。');return}
  variation=isAnother?variation+1:hasResult?variation+1:0;
  idea.classList.remove('result-enter');void idea.offsetWidth;
  const result=composeIngredients(ingredients,variation);
  idea.textContent=result.draftText||result.nextSuggestion;
  idea.classList.add('result-enter');hasResult=true;
  resultState.textContent=result.status==='ok'?(isAnother?'已换一种组合 · 原词保留':'组合完成 · 原词保留'):result.nextSuggestion;
  setMachineState({composerKey:ingredientKey(ingredients),composedText:idea.textContent,variation,words:ingredients,status:result.status,warnings:result.warnings});
  say(isAnother?'表达已改写；原词保持不变。':'组合完成。');
}

document.addEventListener('click',event=>{
  const remove=event.target.closest('[data-remove]');
  if(remove){removeIngredient(remove.dataset.remove);hasResult=false;renderTray();say('已移除词语。');return}
  if(event.target.closest('.clear-ingredients')){clearIngredients();hasResult=false;renderTray();say('已清空词卡托盘。');return}
  const control=event.target.closest('[data-action]');
  const action=control?.dataset.action;
  if(action==='random'){
    const current=getIngredients();
    setIngredients(completeConstrainedIngredients(current));
    hasResult=false;renderTray();
    say(current.length&&current.length<5?'已保留现有词语，并补成一组视觉元素。':'已随机掉落一组视觉元素。');
  }
  if(action==='compose'){spinDial();compose(false)}
  if(action==='another'){spinDial();compose(true)}
  if(action==='save'){
    if(!hasResult){say('请先生成构想，再保存当前结果。');return}
    const ingredients=getIngredients();saveDrop({words:ingredients,ingredients,recipe:idea.textContent,recipeId:'ingredient-composer'});say('灵感已保存，可在收藏页面查看。');
  }
  if(action==='develop'){
    const opening=developPanel.hidden;developPanel.hidden=!opening;control.setAttribute('aria-expanded',opening);
    say(opening?'已打开下一阶段说明。':'已收起开发说明。');
  }
});
document.addEventListener('change',event=>{
  const select=event.target.closest('[data-role-for]');
  if(!select)return;
  setIngredientRole(select.dataset.roleFor,select.value);
  variation=0;hasResult=false;renderTray();say(`已将词语设为${ROLE_LABELS[select.value]}。`);
});
renderTray();
