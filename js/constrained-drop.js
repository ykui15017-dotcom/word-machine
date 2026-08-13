import {ELIGIBLE_RANDOM_WORDS} from '../data/constrained-random-pool.js';

export const DROP_STRUCTURES = {
  quick:['subject','space','condition'],
  scene:['subject','space','condition','relation','view'],
  seeded:['subject','space','condition','relation','view']
};

const roleFor=word=>word.role||(['object','life','container'].includes(word.category)?'subject':word.category==='space'?'space':['state','material'].includes(word.category)?'condition':['relation','action'].includes(word.category)?'relation':word.category==='visual'?'view':null);
const pick=(items,rng)=>items[Math.floor(rng()*items.length)];
const poolFor=role=>ELIGIBLE_RANDOM_WORDS.filter(word=>word.role===role);
const uniquePush=(result,word)=>{if(word&&!result.some(item=>item.id===word.id))result.push({...word,role:roleFor(word)})};

// These are scene rhythms rather than a mandatory category checklist. Some
// drops lean on two visible subjects, while others emphasize action or view.
const MACHINE_STRUCTURES=[
  ['subject','space','relation','condition','view'],
  ['subject','subject','relation','condition','view'],
  ['subject','space','relation','relation','view'],
  ['subject','subject','space','relation','condition']
];

/** Preserve up to three hand-picked words and complete them into a scene. */
export function completeConstrainedIngredients(seeds=[],rng=Math.random){
  const kept=seeds.length<5?seeds.slice(0,3):[];
  const result=[];
  kept.forEach(word=>uniquePush(result,{...word,role:roleFor(word),isSeed:true}));
  const structure=MACHINE_STRUCTURES[Math.floor(rng()*MACHINE_STRUCTURES.length)];
  for(const role of structure){
    if(result.length>=5)break;
    uniquePush(result,pick(poolFor(role).filter(word=>!result.some(item=>item.id===word.id)),rng));
  }
  // A duplicate seed/category can consume a slot in the rhythm; use concrete
  // subjects as a stable fallback so the machine still returns five cards.
  while(result.length<5)uniquePush(result,pick(ELIGIBLE_RANDOM_WORDS.filter(word=>!result.some(item=>item.id===word.id)),rng));
  return result;
}

/** Generate by scene roles, never by sampling the complete word bank. */
export function createConstrainedDrop(mode='quick',seed=null,rng=Math.random){
  const structure=DROP_STRUCTURES[mode]||DROP_STRUCTURES.quick;
  const result=[];
  if(mode==='seeded'&&seed)uniquePush(result,{...seed,role:roleFor(seed),isSeed:true});
  const target=mode==='seeded'?(result.length?5:4):structure.length;
  for(const role of structure){
    if(result.length>=target)break;
    if(result.some(word=>word.role===role))continue;
    uniquePush(result,pick(poolFor(role),rng));
  }
  // An unsupported seed still remains visible, while the four structural
  // foundations are supplied beside it.
  for(const role of structure.slice(0,4)){
    if(result.length>=5)break;
    if(!result.some(word=>word.role===role))uniquePush(result,pick(poolFor(role),rng));
  }
  return {mode,words:result,draft:buildVisualDraft(result)};
}

const find=(words,role)=>words.find(word=>word.role===role)?.text;
export function buildVisualDraft(words){
  const subject=find(words,'subject')||words[0]?.text||'一个具体物件';
  const space=find(words,'space');
  const condition=find(words,'condition');
  const relation=find(words,'relation');
  const view=words.find(word=>word.role==='view');
  const placement=space?`被放置在${space}`:'被放在画面中央';
  const state=condition?`，${condition}`:'';
  const relationText=relation?`；让现场的枝杆、细线或边缘${relation}${subject}的结构`:'；保留它与周围环境清楚的接触关系';
  const viewText=view?.viewKind==='light'?`，${view.text}使主体表面与空间层次同时可见`:view?`，镜头${view.text}，让前后层次保持可辨`:'，用平视近景记录材质与环境的连接';
  return `${subject}${placement}${state}${relationText}${viewText}。`;
}
