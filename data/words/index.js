import { CORE_WORDS } from '../word-bank-v2.js';
import { expandedWords } from './expanded.js';
import { details } from './details.js';
import { ELEMENT_EXPANSION } from '../element-expansion.js';

const LEGACY_CATEGORY={living:'life',organic:'organic_matter',detail:'material'};
const roleFor=(category,text)=>{
  if(category==='space')return 'setting';
  if(category==='container')return 'container';
  if(category==='state')return 'modifier_state';
  if(category==='action')return 'secondary_action';
  if(category==='relation')return /从|沿|向|出口|入口|缝隙/.test(text)?'path':'relation';
  if(category==='visual')return /拍|视|景|焦|构图/.test(text)?'perspective':'light';
  if(category==='material'||category==='scale')return 'visual_detail';
  return 'subject';
};
const normalize=word=>{
  const category=LEGACY_CATEGORY[word.category]||word.category;
  const sentenceRole=word.sentenceRole||word.syntaxRole||roleFor(category,word.text);
  return {...word,category,sentenceRole,syntaxRole:sentenceRole,tags:Array.isArray(word.tags)?word.tags:[category]};
};
const cleanExpansion=expandedWords.filter(word=>!['observation','concept','detail'].includes(word.category));
const candidates=[...CORE_WORDS,...cleanExpansion,...details.map(word=>({...word,category:'material'})),...ELEMENT_EXPANSION].map(normalize);

/** Public corpus of atomic visual elements. Observation sentences and scene
 * rules remain separate and can never be selected by the five-word drop. */
const unique=new Map();
for(const word of candidates)if(!unique.has(word.text))unique.set(word.text,word);
export const BASE_WORDS=[...unique.values()];
export const CATEGORIES = ['object','container','space','life','organic_matter','material','action','state','relation','visual','scale'];
export const CATEGORY_LABELS={organic_matter:'ORGANIC MATTER'};
export const CATEGORY_DISPLAY_LABELS = {
  object:'物件',container:'容器',space:'空间',life:'生命',organic_matter:'自然物',
  material:'材质与痕迹',action:'动作',state:'状态',relation:'关系',visual:'光线与视觉',scale:'形态与尺度'
};
