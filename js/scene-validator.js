import {getOperation} from '../data/visual-operations.js';
import {normalizeWord,isPhysicalSubject} from './semantic-layer.js';

const fragments=/^(替代|覆盖|悬挂于|穿插|发生|放大|附着)$/;
export function validateScenePlan(plan){
  const errors=[];
  if(!plan?.subject?.text)errors.push('missing_subject');
  if(!plan?.operation||getOperation(plan.operation).id!==plan.operation)errors.push('missing_operation');
  if(!plan?.anomalySource?.text)errors.push('missing_source');
  if(!plan?.target||!plan?.transformation)errors.push('missing_direction');
  if(!plan?.relation||plan.relation.length<10||fragments.test(plan.relation))errors.push('relation_fragment');
  if(plan?.subject&&!isPhysicalSubject(normalizeWord(plan.subject))&&plan.operation!=='OBSERVATION_MAGNIFY')errors.push('non_physical_subject');
  if(['visual','scale','action','relation','state'].includes(plan?.subject?.category))errors.push(`${plan.subject.category}_as_subject`);
  const used=new Set(plan?.usedWordIds||[]),raw=plan?.ingredients||[];
  if(raw.some(word=>!used.has(word.id)))errors.push('unused_core_word');
  if(new Set(raw.map(word=>word.id)).size!==raw.length)errors.push('duplicate_word_id');
  return {valid:errors.length===0,errors,pictureability:errors.length?0:1};
}
