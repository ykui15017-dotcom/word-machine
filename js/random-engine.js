import {BASE_WORDS} from '../data/words/index.js';
import {RECIPES} from '../data/recipes.js';
import {getMyWords} from './storage.js';

const all=()=>[...BASE_WORDS,...getMyWords()];
const weighted=list=>{const total=list.reduce((n,w)=>n+(w.weight||1),0);let n=Math.random()*total;return list.find(w=>(n-=w.weight||1)<=0)||list[0]};
const shuffle=list=>{const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
const pick=(category,excluded=[])=>weighted(all().filter(w=>w.category===category&&!excluded.includes(w.id)));
const chooseRecipe=list=>weighted(list.map(recipe=>({...recipe,weight:recipe.weight||1})));

function categoriesFor(recipe,count,locked){
  const used=locked.map(word=>word.category);
  const remainingCore=shuffle((recipe.coreSlots||[]).filter(category=>!used.includes(category)));
  const optional=shuffle((recipe.optionalSlots||recipe.slots).filter(category=>!used.includes(category)&&!remainingCore.includes(category)));
  const categories=[...remainingCore];
  // Pick optional categories at random rather than truncating the recipe's head.
  while(categories.length<count-locked.length&&optional.length)categories.push(optional.shift());
  const fallback=shuffle(recipe.slots);
  while(categories.length<count-locked.length)categories.push(fallback[categories.length%fallback.length]);
  return shuffle(categories);
}

export function newDrop(count=4,locked=[],preferredRecipe=null){
  const compatible=RECIPES.filter(recipe=>locked.every(word=>recipe.slots.includes(word.category)));
  const recipe=preferredRecipe&&compatible.some(item=>item.id===preferredRecipe.id)?preferredRecipe:chooseRecipe(compatible.length?compatible:RECIPES);
  const kept=locked.slice(0,count), result=[...kept];
  for(const category of categoriesFor(recipe,count,kept)){
    const word=pick(category,result.map(item=>item.id));
    if(word)result.push({...word,locked:false});
  }
  return {recipe,words:result.slice(0,count)};
}

export function replaceUnlocked(current,recipe){
  const excluded=current.map(item=>item.id);
  return {recipe,words:current.map(word=>word.locked?word:{...pick(word.category,excluded),locked:false})};
}

export function addWord(current,recipe){
  if(current.length>=5)return {recipe,words:current};
  const available=shuffle(recipe.slots.filter(category=>!current.some(word=>word.category===category)));
  const category=available[0]||shuffle(recipe.slots)[0];
  return {recipe,words:[...current,{...pick(category,current.map(item=>item.id)),locked:false}]};
}
