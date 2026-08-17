export const DROP_SIZE=5;
export const DROP_GROUPS=[['object','container'],['life','organic_matter'],['material'],['action','state','relation'],['space','visual','scale']];
const randomIndex=(length,rng)=>Math.min(length-1,Math.floor(rng()*length));
const shuffle=(items,rng)=>{const copy=items.slice();for(let i=copy.length-1;i>0;i--){const j=randomIndex(i+1,rng);[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
const sourceFor=(word,source='random')=>({...word,source,locked:source==='manual'});
const categoryGroup=category=>DROP_GROUPS.findIndex(group=>group.includes(category));
const pick=(pool,categories,used,rng)=>{const candidates=pool.filter(word=>categories.includes(word.category)&&!used.has(word.text));return candidates.length?candidates[randomIndex(candidates.length,rng)]:null};
export function uniquePool(baseWords=[],myWords=[],hiddenIds=[]){const hidden=new Set(hiddenIds),map=new Map();for(const word of [...myWords,...baseWords])if(word?.text&&!hidden.has(word.id)&&!map.has(word.text))map.set(word.text,word);return [...map.values()]}
export function freshDrop(current=[],pool=[],rng=Math.random){
  const result=Array(DROP_SIZE).fill(null),used=new Set(),represented=new Set();
  current.slice(0,DROP_SIZE).forEach((word,index)=>{if(word?.locked){result[index]={...word};used.add(word.text);represented.add(categoryGroup(word.category))}});
  const missingGroups=shuffle(DROP_GROUPS.map((_,index)=>index).filter(index=>!represented.has(index)),rng),fallbackGroups=shuffle(DROP_GROUPS.map((_,index)=>index),rng);
  for(let index=0;index<DROP_SIZE;index++){if(result[index])continue;const groupIndex=missingGroups.shift()??fallbackGroups[index%fallbackGroups.length];const word=pick(pool,DROP_GROUPS[groupIndex],used,rng)||pick(pool,pool.map(item=>item.category),used,rng);if(word){result[index]=sourceFor(word);used.add(word.text)}}
  return result.filter(Boolean);
}
export function replaceSlot(words,index,word){
  const next=words.slice(0,DROP_SIZE);
  if(index<0||index>=DROP_SIZE||!word)return next;
  const duplicate=next.findIndex((item,itemIndex)=>itemIndex!==index&&item.text===word.text);
  if(duplicate>=0){const previous=next[index];next[index]=sourceFor(next[duplicate],'manual');next[duplicate]=previous}
  else next[index]=sourceFor(word,'manual');
  return next;
}
export function toggleLock(words,index){return words.map((word,i)=>i===index?{...word,locked:!word.locked}:word)}
export function unlockAll(words){return words.map(word=>({...word,locked:false}))}
export const formatDrop=words=>words.slice(0,DROP_SIZE).map(word=>word.text).join('、');
