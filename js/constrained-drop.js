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
