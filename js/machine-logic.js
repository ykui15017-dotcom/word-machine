import {ELIGIBLE_RANDOM_WORDS} from '../data/constrained-random-pool.js';
import {normalizeIngredient} from './ingredient-composer.js';

export const MACHINE_LIMIT=5;
export const STRUCTURE=[
  {id:'subject',roles:['subject'],required:true},
  {id:'place',roles:['setting','container']},
  {id:'entry',roles:['placement','path']},
  {id:'action',roles:['secondary_action','relation']},
  {id:'finish',roles:['result','light','visual_detail']}
];
const roleOf=word=>normalizeIngredient(word).finalRole;
const slotFor=word=>STRUCTURE.find(slot=>slot.roles.includes(roleOf(word)));
const pick=(items,rng)=>items[Math.floor(rng()*items.length)];
const randomFor=(slot,current,rng)=>{
  const ids=new Set(current.map(word=>word.id));
  return pick(ELIGIBLE_RANDOM_WORDS.filter(word=>slot.roles.includes(roleOf(word))&&!ids.has(word.id)),rng);
};
const asRandom=word=>({...word,source:'random',locked:false});

export function inspectMachine(items=[]){
  const occupied=new Set(items.map(slotFor).filter(Boolean).map(slot=>slot.id));
  return {hasSubject:occupied.has('subject'),hasSupport:occupied.has('place')||occupied.has('entry')||occupied.has('action'),missing:STRUCTURE.filter(slot=>!occupied.has(slot.id)),full:items.length>=MACHINE_LIMIT,complete:occupied.has('subject')&&(occupied.has('place')||occupied.has('entry')||occupied.has('action'))};
}
export function supplementMissing(items=[],rng=Math.random,maxAdd=2){
  const result=items.slice(0,MACHINE_LIMIT),status=inspectMachine(result);
  if(status.full)return result;
  for(const slot of status.missing.slice(0,Math.min(2,maxAdd))){
    if(result.length>=MACHINE_LIMIT)break;
    const word=randomFor(slot,result,rng);if(word)result.push(asRandom(word));
  }
  return result;
}
export function replaceRandom(items=[],rng=Math.random){
  const fixed=items.filter(word=>word.source!=='random');
  return items.map(word=>{
    if(word.source!=='random'||word.locked)return word;
    const slot=slotFor(word);if(!slot)return word;
    const replacement=randomFor(slot,[...fixed,...items],rng);
    return replacement?asRandom(replacement):word;
  });
}
export function fullRandom(rng=Math.random,count=5){
  const result=[];
  for(const slot of STRUCTURE.slice(0,Math.max(4,Math.min(5,count)))){const word=randomFor(slot,result,rng);if(word)result.push(asRandom(word))}
  return result;
}
