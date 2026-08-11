import {BASE_WORDS} from '../data/words/index.js';
import {VISUAL_OPERATIONS,getOperation} from '../data/visual-operations.js';
import {getMyWords} from './storage.js';
import {normalizeWord,isPhysicalSubject} from './semantic-layer.js';
import {composeScenePlan} from './scene-composer.js';
import {validateScenePlan} from './scene-validator.js';

const all=()=>[...BASE_WORDS,...getMyWords()].map(normalizeWord);
const pick=list=>list.length?list[Math.floor(Math.random()*list.length)]:null;
const unique=words=>[...new Map(words.filter(Boolean).map(w=>[w.id,w])).values()];
const candidates=(categories,excluded=[])=>all().filter(w=>categories.includes(w.category)&&!excluded.includes(w.id));
const optionalCategories={space:['space'],visual:['visual'],detail:['detail','observation'],scale:['scale'],quantity:['scale'],rule:['concept']};
const roleForLocked=word=>word.category==='space'?'space':word.category==='visual'?'visual':word.category==='scale'?'scale':word.category==='concept'?'rule':word.category==='observation'?'source':isPhysicalSubject(word)?'subject':'detail';
const acceptsLocked=(op,word)=>op.subjects.includes(word.category)||op.sources.includes(word.category)||op.optional.some(role=>(optionalCategories[role]||[]).includes(word.category));
const compatibleOperations=locked=>VISUAL_OPERATIONS.filter(op=>locked.every(word=>acceptsLocked(op,normalizeWord(word))));
function assign(operation,locked=[]){
  const words=unique(locked.map(normalizeWord)).map(word=>({...word,sceneRole:roleForLocked(word),locked:true}));
  const subjectLocked=words.find(w=>w.sceneRole==='subject'&&operation.subjects.includes(w.category));if(subjectLocked)subjectLocked.sceneRole='subject';
  else {const misplaced=words.find(w=>operation.subjects.includes(w.category));if(misplaced)misplaced.sceneRole='subject';}
  const sourceLocked=words.find(w=>w.sceneRole==='source'&&operation.sources.includes(w.category))||words.find(w=>w.sceneRole!=='subject'&&operation.sources.includes(w.category));if(sourceLocked)sourceLocked.sceneRole='source';
  const ids=()=>words.map(w=>w.id);
  if(!words.some(w=>w.sceneRole==='subject'))words.push({...pick(candidates(operation.subjects,ids())),sceneRole:'subject',locked:false});
  if(!words.some(w=>w.sceneRole==='source'))words.push({...pick(candidates(operation.sources,ids())),sceneRole:'source',locked:false});
  return words.filter(w=>w.id);
}
function addOptionals(words,operation,mode,count){
  const desired=mode==='near'?Math.min(1,count):mode==='wild'?Math.min(4,count):Math.min(2,count);
  const priority=mode==='wild'?['space','scale','detail','visual']:['space','visual','detail','scale'];
  for(const role of priority){if(words.length>=2+desired)break;if(words.some(w=>w.sceneRole===role))continue;const word=pick(candidates(optionalCategories[role]||[],words.map(w=>w.id)));if(word)words.push({...word,sceneRole:role,locked:false})}
  return words;
}
export function newDrop(count=4,locked=[],preferredOperation=null,mode='odd'){
  const normalizedLocks=unique(locked.map(normalizeWord));let pool=compatibleOperations(normalizedLocks);
  if(mode==='near')pool=pool.filter(op=>op.near);
  let operation=preferredOperation?getOperation(preferredOperation.id||preferredOperation):pick(pool.length?pool:VISUAL_OPERATIONS);
  if(normalizedLocks.length&&!pool.includes(operation))operation=pick(pool.length?pool:VISUAL_OPERATIONS);
  let last;
  for(let retry=0;retry<10;retry++){
    const words=addOptionals(assign(operation,normalizedLocks),operation,mode,Math.max(0,count-2));
    const secondary=mode==='wild'&&words.some(w=>w.sceneRole==='detail')?'SURFACE_TRANSFER':null;
    const scenePlan=composeScenePlan({operation:operation.id,words,mode,secondaryOperation:secondary,retryCount:retry});
    last={operation,recipe:operation,recipeId:operation.id,words,scenePlan,distance:mode,retries:retry};if(scenePlan.validation.valid)return last;
  }
  return last;
}
export function replaceUnlocked(current,operation,mode='odd'){return newDrop(current.length,current.filter(w=>w.locked),operation,mode)}
export function addWord(current,operation,mode='odd'){
  const op=getOperation(operation?.id||operation),roles=['space','visual','detail','scale'];const missing=roles.find(role=>!current.some(w=>w.sceneRole===role)&&op.optional.includes(role));if(!missing)return hydrate(current,op,mode);
  const word=pick(candidates(optionalCategories[missing],current.map(w=>w.id)));return hydrate(word?[...current,{...word,sceneRole:missing,locked:false}]:current,op,mode);
}
const hydrate=(words,operation,mode)=>{const secondary=mode==='wild'&&words.some(w=>w.sceneRole==='detail')?'SURFACE_TRANSFER':null;return {operation,recipe:operation,recipeId:operation.id,words,scenePlan:composeScenePlan({operation:operation.id,words,mode,secondaryOperation:secondary}),distance:mode}};
export function removeOptional(current,operation,mode='odd'){const i=[...current].map((word,i)=>({word,i})).reverse().find(x=>!x.word.locked&&!['subject','source'].includes(x.word.sceneRole))?.i;return hydrate(i===undefined?current:[...current.slice(0,i),...current.slice(i+1)],getOperation(operation?.id||operation),mode)}
export function validateDrop(drop){const validation=drop.scenePlan?validateScenePlan(drop.scenePlan):{valid:false,errors:['missing_scene_plan']};return {...validation,score:validation.valid?10:0}}

export function composeFixture(operation,ingredients,mode='odd'){
  const op=getOperation(operation),words=ingredients.map(normalizeWord);const assigned=[];
  const take=(predicate,sceneRole)=>{const word=words.find(w=>!assigned.includes(w)&&predicate(w));if(word){word.sceneRole=sceneRole;assigned.push(word)}return word};
  if(operation==='OBSERVATION_MAGNIFY')take(w=>w.category==='space'||isPhysicalSubject(w),'subject');else take(w=>op.subjects.includes(w.category),'subject');
  take(w=>op.sources.includes(w.category),'source');
  for(const role of ['space','scale','visual','detail','rule'])take(w=>!['subject','source'].includes(w.sceneRole)&&(optionalCategories[role]||[]).includes(w.category),role);
  for(const word of words.filter(w=>!assigned.includes(w))){word.sceneRole=word.category==='concept'?'rule':word.category==='observation'?'detail':'detail';assigned.push(word)}
  const secondary=mode==='wild'&&assigned.some(w=>w.sceneRole==='detail')?'SURFACE_TRANSFER':null;return composeScenePlan({operation,words:assigned,mode,secondaryOperation:secondary});
}
