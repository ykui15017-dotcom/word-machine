import {candidatesForRole} from '../data/random-word-source.js';
import {composeIngredientText,normalizeIngredient} from './ingredient-composer.js';

export const DROP_STRUCTURES={
  quick:['subject','container','placement','path','secondary_action','result'],
  scene:['subject','setting','placement','path','secondary_action','result','visual_detail'],
  seeded:['subject','container','placement','path','secondary_action','result']
};
const pick=(items,rng)=>items[Math.floor(rng()*items.length)];
const poolFor=role=>candidatesForRole(role);
const uniquePush=(result,word)=>{if(word&&!result.some(item=>item.text===word.text))result.push({...word})};
const hasRole=(items,role)=>items.some(item=>normalizeIngredient(item).finalRole===role);

/** Preserve hand-picked nouns/places, then complete a full action chain. */
export function completeConstrainedIngredients(seeds=[],rng=Math.random){
  const keepExisting=seeds.length>0&&seeds.length<7;
  const result=keepExisting?seeds.slice(0,3).map(word=>({...word,isSeed:true})):[];
  const required=['subject',hasRole(result,'setting')?'setting':'container','placement','path','secondary_action','result'];
  for(const role of required){
    if(hasRole(result,role))continue;
    const pool=poolFor(role).filter(word=>!result.some(item=>item.text===word.text));
    uniquePush(result,pick(pool,rng));
  }
  if(result.length<7){
    const pool=poolFor('visual_detail').filter(word=>!result.some(item=>item.text===word.text));
    uniquePush(result,pick(pool,rng));
  }
  return result.slice(0,7);
}

export function createConstrainedDrop(mode='quick',seed=null,rng=Math.random){
  const structure=DROP_STRUCTURES[mode]||DROP_STRUCTURES.quick,result=[];
  if(mode==='seeded'&&seed)uniquePush(result,{...seed,isSeed:true});
  for(const role of structure)if(!hasRole(result,role))uniquePush(result,pick(poolFor(role).filter(word=>!result.some(item=>item.text===word.text)),rng));
  return {mode,words:result,draft:composeIngredientText(result)};
}
export const buildVisualDraft=words=>composeIngredientText(words);
