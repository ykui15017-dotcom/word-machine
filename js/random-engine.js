import {BASE_WORDS} from '../data/words/index.js'; import {RECIPES} from '../data/recipes.js'; import {getMyWords} from './storage.js';
const all=()=>[...BASE_WORDS,...getMyWords()];
const weighted=list=>{const total=list.reduce((n,w)=>n+(w.weight||1),0);let n=Math.random()*total;return list.find(w=>(n-=w.weight||1)<=0)||list[0]};
const pick=(category,excluded=[])=>weighted(all().filter(w=>w.category===category&&!excluded.includes(w.id)));
export function newDrop(count=4,locked=[],preferredRecipe=null){const compatible=RECIPES.filter(r=>locked.every(w=>r.slots.includes(w.category)));const recipe=(preferredRecipe&&compatible.some(r=>r.id===preferredRecipe.id)?preferredRecipe:null)||compatible[Math.floor(Math.random()*compatible.length)]||RECIPES[0];const kept=locked.slice(0,count);const result=[...kept];let slots=recipe.slots.slice();
  kept.forEach(k=>{const i=slots.indexOf(k.category);if(i>=0)slots.splice(i,1)});
  while(result.length<count){const cat=slots.shift()||recipe.slots[result.length%recipe.slots.length];const word=pick(cat,result.map(x=>x.id));if(word)result.push({...word,locked:false});else break}
  return {recipe,words:result};
}
export function replaceUnlocked(current,recipe){return {recipe,words:current.map(w=>w.locked?w:{...pick(w.category,current.map(x=>x.id)),locked:false})}}
export function addWord(current,recipe){if(current.length>=5)return {recipe,words:current};const slot=recipe.slots.find(c=>!current.some(w=>w.category===c))||recipe.slots[current.length%recipe.slots.length];return {recipe,words:[...current,{...pick(slot,current.map(x=>x.id)),locked:false}]}}
