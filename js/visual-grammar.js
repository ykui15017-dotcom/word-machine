const text=item=>(item?.text||'').trim();
const first=(roles,role)=>roles?.[role]?.[0]||null;
const all=(roles,role)=>roles?.[role]||[];

export const GRAMMAR_TYPES={
  RELATION_TARGET:'relation-target',
  RELATION_OPEN:'relation-open',
  CONTAINER_FLOW:'container-flow',
  CONTAINED_ACTION:'contained-action',
  SPACE_ACTION:'space-action',
  TRANSFORMATION:'transformation',
  LEGACY:'legacy'
};

export function relationTargetFor(roles={}){
  return first(roles,'secondary')||first(roles,'container')||first(roles,'setting')||null;
}

const DIRECT_RELATION=/^(缠绕|贴附|贴合|覆盖|包裹|围绕|悬挂于|嵌入|连接|支撑|托住|替代|映照|遮挡|漂在上方|沉在下方|相互打结|彼此托举|轻轻碰触|并排|首尾相连)$/;
const FLOW_ACTION=/^(流出|滑出|渗出|漏出|倾泻|散落|垂落)$/;

export function analyzeVisualGrammar(roles={}){
  const subject=first(roles,'subject');
  const relation=first(roles,'relation');
  const target=relationTargetFor(roles);
  const container=first(roles,'container');
  const setting=first(roles,'setting');
  const placement=first(roles,'placement');
  const path=first(roles,'path');
  const action=first(roles,'secondary_action');
  const result=first(roles,'result');
  const state=first(roles,'modifier_state');
  const secondary=first(roles,'secondary');

  if(subject&&relation){
    if(!target)return {type:GRAMMAR_TYPES.RELATION_TARGET,complete:false,missingRoles:['target'],target:null};
    // A second physical object is a genuine anchor/target. Containers and spaces
    // are also allowed when the relation itself is spatially complete, or when a
    // follow-up action/result makes the intent explicit.
    if(secondary||action||result||DIRECT_RELATION.test(text(relation))){
      return {type:GRAMMAR_TYPES.RELATION_TARGET,complete:true,missingRoles:[],target};
    }
  }

  // Two physical objects without a relation are treated as an unfinished
  // object-to-object composition rather than being forced into a scene slot.
  if(subject&&secondary&&!relation&&!action&&!placement&&!path){
    return {type:GRAMMAR_TYPES.RELATION_OPEN,complete:false,missingRoles:['relation'],target:secondary};
  }

  // Preserve the established inside-to-outside action chain. A path always
  // selects this grammar; a clear outward-flow action plus placement does too.
  if(subject&&container&&(path||(placement&&action&&FLOW_ACTION.test(text(action))))){
    const missing=[];
    if(!placement)missing.push('placement');
    if(!path)missing.push('path');
    if(!action)missing.push('secondary_action');
    if(!result)missing.push('result');
    return {type:GRAMMAR_TYPES.CONTAINER_FLOW,complete:missing.length===0,missingRoles:missing,target:container};
  }

  // A container does not always imply an exit path. "水母 / 玻璃罐 / 下沉"
  // is already a valid visual relationship and should not be padded with a fake exit.
  if(subject&&container&&(action||state)){
    return {type:GRAMMAR_TYPES.CONTAINED_ACTION,complete:true,missingRoles:[],target:container};
  }

  if(subject&&setting&&(action||result)){
    return {type:GRAMMAR_TYPES.SPACE_ACTION,complete:true,missingRoles:[],target:setting};
  }

  if(subject&&action&&(state||result)){
    return {type:GRAMMAR_TYPES.TRANSFORMATION,complete:true,missingRoles:[],target:null};
  }

  const missing=[];
  if(!subject)missing.push('subject');
  if(!container&&!setting)missing.push('support');
  if(!placement)missing.push('placement');
  if(!path)missing.push('path');
  if(!action)missing.push('secondary_action');
  if(!result)missing.push('result');
  return {type:GRAMMAR_TYPES.LEGACY,complete:missing.length===0,missingRoles:missing,target:null};
}

const surfaceTarget=target=>{
  const label=text(target);
  return target?.finalRole==='setting'||target?.category==='space'?`${label}上`:`${label}表面`;
};

/**
 * Convert a relation word into a predicate that can be attached after a subject.
 * These are language-level relation families, not noun-specific exceptions.
 */
export function relationPredicate(relation,target){
  const r=text(relation),t=text(target);
  if(!r)return '';
  if(!t)return r;

  if(r==='被包围')return `被${t}包围`;
  if(/缠绕/.test(r))return `缠绕在${t}上`;
  if(r==='贴附'||r==='贴着表面')return `贴附在${surfaceTarget(target)}`;
  if(r==='贴合')return `贴合${surfaceTarget(target)}`;
  if(r==='覆盖')return `覆盖在${surfaceTarget(target)}`;
  if(r==='包裹')return `包裹着${t}`;
  if(r==='围绕')return `围绕${t}`;
  if(r==='围住空白')return `围住${t}周围的空白`;
  if(r==='悬挂于')return `悬挂于${t}`;
  if(r==='穿过')return `穿过${t}`;
  if(r==='穿过中心')return `穿过${t}中心`;
  if(r==='从孔洞穿出')return `从${t}的孔洞穿出`;
  if(r==='嵌入')return `嵌入${t}`;
  if(r==='塞在内部')return `塞在${t}内部`;
  if(r==='连接')return `连接${t}`;
  if(r==='被绳子连接')return `与${t}被绳子连接`;
  if(r==='支撑')return `支撑着${t}`;
  if(r==='托住')return `托住${t}`;
  if(r==='替代')return `替代${t}`;
  if(r==='映照')return `映照着${t}`;
  if(r==='遮挡')return `遮挡住${t}`;
  if(r==='漂在上方')return `漂在${t}上方`;
  if(r==='沉在下方')return `沉在${t}下方`;
  if(r==='被压在下面')return `被压在${t}下面`;
  if(r==='在表面投影')return `在${t}表面投影`;
  if(r==='与轮廓重合')return `与${t}的轮廓重合`;
  if(r==='沿裂缝排列')return `沿${t}的裂缝排列`;
  if(r==='沿折痕相接')return `沿${t}的折痕相接`;
  if(r==='沿着折痕延伸')return `沿${t}的折痕延伸`;
  if(r==='沿表面')return `沿${t}表面延伸`;
  if(r==='沿边缘')return `沿${t}边缘延伸`;
  if(r==='从容器边缘')return `从${t}边缘向外延伸`;
  if(r==='从内部向外')return `从${t}内部向外延伸`;

  if(/^(并排|共享同一影子|互相穿插|隔着玻璃相望|叠放在一起|彼此吸附|互相排斥|保持错位|交叉成网|轻轻碰触|平行延伸|交替出现|相互打结|彼此托举|在反光中重叠|对称排列|首尾相连)/.test(r))return `与${t}${r}`;
  if(r==='与影子错位')return `与${t}的影子错位`;
  if(r==='背靠背站立')return `与${t}背靠背排列`;
  if(r==='被细线牵住')return `被${t}牵住`;
  if(r==='被胶带固定')return `被${t}固定`;
  if(r==='被薄膜隔开')return `与${t}被薄膜隔开`;
  if(r==='卡在中间')return `卡在${t}附近`;

  return `${r}${t}`;
}

const DISTRIBUTION=/^(散开|铺开|零散分布|向四周扩开|向四周展开|堆积|形成拖尾|形成一条线|聚集成一片|疏密不均地分布|停留在边缘)$/;
const OUTWARD_MOTION=/^(飘落|垂落|滑落|散落|坠落|滴落|脱落|滑出|流出|渗出|漏出|流淌)$/;
const CONTINUING_ACTION=/^(生长|蔓延|扩张|扩散|发芽|爬行|卷曲|拉伸|延伸)$/;

export function renderRelationTarget(roles={},target=relationTargetFor(roles)){
  const subject=text(first(roles,'subject'));
  if(!subject||!target)return '';
  const relations=all(roles,'relation');
  if(!relations.length)return '';
  const action=text(first(roles,'secondary_action'));
  const result=text(first(roles,'result'));
  const detail=text(first(roles,'visual_detail'));
  const path=text(first(roles,'path'));
  const state=text(first(roles,'modifier_state'));
  const targetText=text(target);
  const subjectLabel=state?`${state.replace(/的$/,'')}的${subject}`:subject;

  let sentence=`${subjectLabel}${relationPredicate(relations[0],target)}`;

  if(action){
    if(OUTWARD_MOTION.test(action)){
      const origin=path||`从${targetText}边缘`;
      sentence+=`，部分${subject}${origin}${detail}${action}`;
    }else if(CONTINUING_ACTION.test(action)){
      sentence+=`，部分${subject}${detail}继续${action}`;
    }else{
      sentence+=`，部分${subject}${detail}${action}`;
    }
  }

  for(const extraRelation of relations.slice(1)){
    sentence+=`，并逐渐${relationPredicate(extraRelation,target)}`;
  }

  if(result){
    if(DISTRIBUTION.test(result)){
      if(/^向四周/.test(result))sentence+=`，并${result}`;
      else sentence+=`，并在四周${result}`;
    }else if(!relations.slice(1).some(item=>text(item)===result)){
      sentence+=`，最终${result}`;
    }
  }

  return `${sentence.replace(/[。；，]+$/,'')}。`;
}

export function renderContainedAction(roles={}){
  const subject=text(first(roles,'subject')),container=text(first(roles,'container'));
  if(!subject||!container)return '';
  const state=text(first(roles,'modifier_state'));
  const placement=text(first(roles,'placement'));
  const action=text(first(roles,'secondary_action'));
  const result=text(first(roles,'result'));
  const detail=text(first(roles,'visual_detail'));
  const subjectLabel=state?`${state.replace(/的$/,'')}的${subject}`:subject;
  let sentence=placement?`${subjectLabel}${placement}${container}中`:`${subjectLabel}位于${container}中`;
  if(action)sentence+=`，并${detail}${action}`;
  if(result)sentence+=DISTRIBUTION.test(result)?`，最终在容器内部${result}`:`，最终${result}`;
  return `${sentence.replace(/[。；，]+$/,'')}。`;
}

export function renderSpaceAction(roles={}){
  const subject=text(first(roles,'subject')),setting=text(first(roles,'setting'));
  if(!subject||!setting)return '';
  const state=text(first(roles,'modifier_state'));
  const placement=text(first(roles,'placement'));
  const path=text(first(roles,'path'));
  const action=text(first(roles,'secondary_action'));
  const result=text(first(roles,'result'));
  const detail=text(first(roles,'visual_detail'));
  const subjectLabel=state?`${state.replace(/的$/,'')}的${subject}`:subject;
  let sentence=placement?`${subjectLabel}${placement}${setting}中`:`${subjectLabel}位于${setting}中`;
  if(action)sentence+=`，随后${path||''}${detail}${action}`;
  if(result)sentence+=DISTRIBUTION.test(result)?`，并在空间中${result}`:`，最终${result}`;
  return `${sentence.replace(/[。；，]+$/,'')}。`;
}

export function renderTransformation(roles={}){
  const subject=text(first(roles,'subject'));
  if(!subject)return '';
  const state=text(first(roles,'modifier_state'));
  const action=text(first(roles,'secondary_action'));
  const result=text(first(roles,'result'));
  const detail=text(first(roles,'visual_detail'));
  let sentence=state?`${subject}处于${state.replace(/的$/,'')}的状态`:`${subject}`;
  if(action)sentence+=`${state?'，并':'开始'}${detail}${action}`;
  if(result)sentence+=`，最终${result}`;
  return `${sentence.replace(/[。；，]+$/,'')}。`;
}
