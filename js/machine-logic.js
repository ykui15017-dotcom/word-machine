import {candidatesForRoles} from '../data/random-word-source.js';
import {normalizeIngredient,composeIngredients} from './ingredient-composer.js';
import {missingResultRoles} from './result-state.js';

export const MACHINE_LIMIT=5;
export const MANUAL_LIMIT=8;
export const STRUCTURE=[
  {id:'subject',roles:['subject'],required:true},
  {id:'place',roles:['setting','container']},
  {id:'entry',roles:['placement','path']},
  {id:'action',roles:['secondary_action','relation']},
  {id:'finish',roles:['result','light','visual_detail']}
];
const roleOf=word=>normalizeIngredient(word).finalRole;
const slotFor=word=>STRUCTURE.find(slot=>slot.roles.includes(roleOf(word)));
const pick=(items,rng)=>items.length?items[Math.min(items.length-1,Math.floor(rng()*items.length))]:null;
const withoutUsedText=(items,current)=>{const texts=new Set(current.map(word=>word.text));return items.filter(word=>!texts.has(word.text))};
const randomFor=(slot,current,rng)=>pick(withoutUsedText(candidatesForRoles(slot.roles),current),rng);
const randomForMissing=(missing,current,rng)=>{
  const roles=missing.role==='support'?['setting','container']
    :missing.role==='target'?['subject']
    :missing.role==='relation'?['relation']
    :[missing.role];
  return pick(withoutUsedText(candidatesForRoles(roles),current),rng);
};
const asRandom=word=>({...word,source:'random',locked:false});

export function inspectMachine(items=[]){
  const occupied=new Set(items.map(slotFor).filter(Boolean).map(slot=>slot.id));
  const composition=composeIngredients(items);
  const missing=missingResultRoles(composition);
  const hasRelationalSupport=composition.grammarType==='relation-target'||composition.grammarType==='relation-open';
  return {hasSubject:occupied.has('subject'),hasSupport:hasRelationalSupport||occupied.has('place')||occupied.has('entry')||occupied.has('action'),missing,full:items.length>=MACHINE_LIMIT,complete:missing.length===0};
}
export function supplementMissing(items=[],rng=Math.random,maxAdd=2){
  const result=items.slice(),status=inspectMachine(result);
  const targets=status.missing.filter(item=>item.role==='support'||item.role==='target'||item.role==='relation'||STRUCTURE.some(slot=>slot.roles.includes(item.role)));
  if(status.full){
    const redundant=findRedundantRandomIndex(result);
    if(redundant<0||!targets.length)return items;
    const word=randomForMissing(targets[0],result.filter((_,index)=>index!==redundant),rng);
    if(!word)return items;
    result.splice(redundant,1,asRandom(word));return result;
  }
  for(const target of targets.slice(0,Math.min(2,maxAdd))){
    if(result.length>=MACHINE_LIMIT)break;
    const word=randomForMissing(target,result,rng);if(word)result.push(asRandom(word));
  }
  return result;
}
const priority=word=>STRUCTURE.findIndex(slot=>slot===slotFor(word));
function findRedundantRandomIndex(items){
  const counts=new Map();
  items.forEach(word=>{const role=roleOf(word);counts.set(role,(counts.get(role)||0)+1)});
  return items.map((word,index)=>({word,index,role:roleOf(word)}))
    .filter(({word,role})=>word.source==='random'&&!word.locked&&((counts.get(role)||0)>1||!['subject','setting','container','placement','path','secondary_action','result'].includes(role)))
    .sort((a,b)=>priority(b.word)-priority(a.word))[0]?.index??-1;
}
export function addManualToMachine(items=[],word){
  if(items.some(item=>item.id===word.id))return {status:'exists',items};
  const manual={...word,source:'manual',locked:true};
  if(items.length<MANUAL_LIMIT)return {status:'added',items:[...items,manual]};
  return {status:'limit',items};
}
export function replaceRandom(items=[],rng=Math.random){
  const fixed=items.filter(word=>word.source!=='random');
  const replaced=[];
  for(const word of items){
    if(word.source!=='random'||word.locked){replaced.push(word);continue}
    const slot=slotFor(word);if(!slot){replaced.push(word);continue}
    const otherKept=items.filter(item=>item===word||item.source!=='random'||item.locked).filter(item=>item!==word);
    const replacement=randomFor(slot,[...fixed,...otherKept,...replaced],rng);
    replaced.push(replacement?asRandom(replacement):word);
  }
  return replaced;
}
export function fullRandom(itemsOrRng=[],rngOrCount=Math.random,count=5){
  // Keep the old fullRandom(rng, count) API for callers and deterministic tests.
  const legacy=typeof itemsOrRng==='function';
  const items=legacy?[]:itemsOrRng;
  const rng=legacy?itemsOrRng:rngOrCount;
  const requested=legacy&&typeof rngOrCount==='number'?rngOrCount:count;
  const manual=items.filter(word=>word.source!=='random');
  const randomCount=Math.min(Math.max(4,Math.min(MACHINE_LIMIT,requested)),MANUAL_LIMIT-manual.length);
  const random=[];
  for(const slot of STRUCTURE.slice(0,randomCount)){
    const word=randomFor(slot,[...manual,...random],rng);
    if(word)random.push(asRandom(word));
  }
  return [...manual,...random];
}
