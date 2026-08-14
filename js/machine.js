import {composeIngredients,normalizeIngredient,ROLE_LABELS,SCENE_ROLES} from './ingredient-composer.js';
import {supplementMissing,replaceRandom,fullRandom,inspectMachine} from './machine-logic.js';
import {saveDrop,setMachineState,getMachineState,getIngredients,setIngredients,setIngredientRole,toggleIngredientLock,clearRandomIngredients,removeIngredient,clearIngredients} from './storage.js';
import {initNav,escapeHtml} from './common.js';
import {formatResultState,missingResultRoles} from './result-state.js';

initNav();
const idea=document.querySelector('.recipe-text');
const message=document.querySelector('.aside-message');
const resultState=document.querySelector('.result-state');
const developPanel=document.querySelector('.develop-panel');
const compositionDial=document.querySelector('.composition-dial');
let variation=0;
let hasResult=false;
let messageTimer;
let rolePopover;

function renderResultState(result){
  const text=formatResultState(result);
  if(result.status==='ok'||result.status==='conflict'){resultState.textContent=text;return}
  const missing=missingResultRoles(result);
  resultState.replaceChildren(document.createTextNode('还可以补充：'));
  missing.forEach((item,index)=>{
    if(index)resultState.append(document.createTextNode(' · '));
    if(!item.description){resultState.append(document.createTextNode(item.label));return}
    const link=document.createElement('a');
    link.className='completion-link';link.href=`./word-bank.html?intent=${encodeURIComponent(item.role)}`;
    link.textContent=item.label;link.dataset.tooltip=item.description;
    link.setAttribute('aria-label',`${item.label}：${link.dataset.tooltip}`);
    resultState.append(link);
  });
}

const ingredientKey=items=>items.map(item=>`${item.id}:${item.userRoleOverride||''}:${item.source||'manual'}:${Boolean(item.locked)}`).join('|');
const savedState=getMachineState();
if(savedState?.composerKey===ingredientKey(getIngredients())&&savedState.composedText){
  idea.textContent=savedState.composedText;
  variation=savedState.variation||0;
  hasResult=true;
  resultState.textContent='已恢复构想';
}

function ingredientCard(word,compact=false){
  const normalized=normalizeIngredient(word);
  const roleControl=compact?'':`<button class="role-trigger" data-role-trigger="${escapeHtml(word.id)}" aria-haspopup="menu" aria-expanded="false">${ROLE_LABELS[normalized.finalRole]}<span aria-hidden="true">▾</span></button>`;
  const lockControl=compact?'':`<button class="ingredient-lock" data-lock="${escapeHtml(word.id)}" aria-label="${word.locked?'解锁':'锁定'} ${escapeHtml(word.text)}" aria-pressed="${Boolean(word.locked)}">${word.locked?'🔒':'♢'}</button>`;
  return `<span class="ingredient ${compact?'compact':''}" data-source="${word.source}"><i class="category-${escapeHtml(word.category)}"></i><b>${escapeHtml(word.text)}</b>${roleControl}${lockControl}<button class="ingredient-remove" data-remove="${escapeHtml(word.id)}" aria-label="删除 ${escapeHtml(word.text)}">×</button></span>`;
}
function closeRolePopover(){
  if(!rolePopover)return;
  document.querySelector(`[data-role-trigger="${CSS.escape(rolePopover.dataset.wordId)}"]`)?.setAttribute('aria-expanded','false');
  rolePopover.remove();rolePopover=null;
}
function openRolePopover(trigger){
  closeRolePopover();
  const word=getIngredients().find(item=>item.id===trigger.dataset.roleTrigger);
  if(!word)return;
  const selectedRole=normalizeIngredient(word).finalRole;
  rolePopover=document.createElement('div');
  rolePopover.className='role-popover';rolePopover.setAttribute('role','menu');rolePopover.dataset.wordId=word.id;
  rolePopover.innerHTML=SCENE_ROLES.map(role=>`<button role="menuitemradio" aria-checked="${role===selectedRole}" data-role-choice="${role}">${ROLE_LABELS[role]}</button>`).join('');
  document.body.append(rolePopover);
  const rect=trigger.getBoundingClientRect();
  rolePopover.style.left=`${Math.min(rect.left,window.innerWidth-rolePopover.offsetWidth-8)}px`;
  rolePopover.style.top=`${rect.bottom+5}px`;
  trigger.setAttribute('aria-expanded','true');
  rolePopover.querySelector('[aria-checked="true"]')?.focus();
}
function refreshDraft(){
  const ingredients=getIngredients();
  if(!ingredients.length)return;
  const result=composeIngredients(ingredients,variation);
  idea.textContent=result.draftText||result.nextSuggestion;
  renderResultState(result);
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
  const structure=inspectMachine(ingredients);
  if(!structure.hasSubject){say('还缺少主体，请先补入画面的主角。');return}
  if(!structure.hasSupport){say('还缺少场域/容器或动作/路径。');return}
  if(ingredients.length<3){say('当前少于 3 张词卡，建议先补足结构再生成完整视觉构想。');return}
  variation=isAnother?variation+1:hasResult?variation+1:0;
  idea.classList.remove('result-enter');void idea.offsetWidth;
  const result=composeIngredients(ingredients,variation);
  idea.textContent=result.draftText||result.nextSuggestion;
  idea.classList.add('result-enter');hasResult=true;
  renderResultState(result);
  setMachineState({composerKey:ingredientKey(ingredients),composedText:idea.textContent,variation,words:ingredients,status:result.status,warnings:result.warnings});
  say(isAnother?'表达已改写；原词保持不变。':'组合完成。');
}

document.addEventListener('click',event=>{
  const roleChoice=event.target.closest('[data-role-choice]');
  if(roleChoice){
    const wordId=rolePopover?.dataset.wordId;
    const role=roleChoice.dataset.roleChoice;
    closeRolePopover();setIngredientRole(wordId,role);
    variation=0;hasResult=false;renderTray();say(`已将词语设为${ROLE_LABELS[role]}。`);return;
  }
  const roleTrigger=event.target.closest('[data-role-trigger]');
  if(roleTrigger){
    if(rolePopover?.dataset.wordId===roleTrigger.dataset.roleTrigger)closeRolePopover();else openRolePopover(roleTrigger);
    return;
  }
  closeRolePopover();
  const remove=event.target.closest('[data-remove]');
  if(remove){removeIngredient(remove.dataset.remove);hasResult=false;renderTray();say('已移除词语。');return}
  const lock=event.target.closest('[data-lock]');
  if(lock){toggleIngredientLock(lock.dataset.lock);renderTray();say('词卡锁定状态已更新。');return}
  if(event.target.closest('.clear-ingredients')){clearIngredients();hasResult=false;renderTray();say('已清空词卡托盘。');return}
  const control=event.target.closest('[data-action]');
  const action=control?.dataset.action;
  if(action==='supplement'){
    const current=getIngredients();
    const before=inspectMachine(current);
    if(!before.missing.length){say('当前结构已完整。');return}
    const supplemented=supplementMissing(current);
    if(current.length>=5&&supplemented===current){say(`当前词卡已满，但结构仍缺少：${before.missing.map(item=>item.label).join(' / ')}。可删除或替换一个元素。`);return}
    setIngredients(supplemented);
    hasResult=false;renderTray();
    const complete=inspectMachine(getIngredients()).missing.length===0;
    say(complete?'当前组合结构已基本完整，可换随机词、继续展开，或保存灵感。':current.some(word=>word.source==='manual')?'已检测到手动选词，随机功能将只补足缺失类别。':'已补足当前缺失类别。');
  }
  if(action==='replace-random'){setIngredients(replaceRandom(getIngredients()));hasResult=false;renderTray();say('已替换随机词，手动词保持不变。')}
  if(action==='full-random'){setIngredients(fullRandom());hasResult=false;renderTray();say('已清空原组合并生成完整随机结构。')}
  if(action==='clear-random'){clearRandomIngredients();hasResult=false;renderTray();say('已清除随机词。')}
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
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&rolePopover){
    const wordId=rolePopover.dataset.wordId;
    closeRolePopover();document.querySelector(`[data-role-trigger="${CSS.escape(wordId)}"]`)?.focus();
  }
});
window.addEventListener('resize',closeRolePopover);
window.addEventListener('scroll',closeRolePopover,true);
renderTray();
