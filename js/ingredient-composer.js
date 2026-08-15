/** Sentence roles are deliberately narrower than Word Bank categories.  A
 * category says what a word is; a sentence role says what it does here. */
export const SCENE_ROLES=['subject','setting','container','modifier_state','placement','path','secondary_action','result','visual_detail','relation','light','perspective','secondary'];

export const ROLE_LABELS={subject:'主体',setting:'场域',container:'容器',modifier_state:'状态修饰',placement:'初始放置',path:'路径／出口',secondary_action:'后续动作',result:'结果形态',visual_detail:'视觉补充',relation:'补充关系',light:'光线',perspective:'视角',secondary:'陪体'};

const EXACT={
  '花瓣':['subject'],'购物车':['subject'],'飞鸟':['subject'],'纸箱':['container'],'玻璃碗':['container'],'搪瓷碗':['container'],
  '花丛':['setting'],'湖面':['setting'],'被雨打湿的':['modifier_state'],'被雨水打湿的':['modifier_state'],
  '放置在':['placement'],'堆积在':['placement'],'卡在':['placement'],'贴附在':['placement'],'包裹在':['placement'],'沉在':['placement'],'夹在':['placement'],
  '从缝隙中':['path'],'从箱体缝隙中':['path'],'沿边缘':['path'],'从箱口':['path'],'顺着裂口':['path'],'从底部':['path'],'向外':['path'],'沿台面':['path'],'沿地面':['path'],
  '流出':['secondary_action'],'滑出':['secondary_action'],'渗出':['secondary_action'],'垂落':['secondary_action'],'散落':['secondary_action'],'扩散':['secondary_action'],'蔓延':['secondary_action'],'倾泻':['secondary_action'],'塌下':['secondary_action'],'堆叠':['secondary_action'],
  '散开':['result'],'铺开':['result'],'零散分布':['result'],'向四周扩开':['result'],'留下一条痕迹':['result'],'堆成一小片':['result'],'形成拖尾':['result'],'涟漪':['result'],
  '缓慢地':['visual_detail'],'局部地':['visual_detail'],'疏密不均地':['visual_detail'],'断续地':['visual_detail'],'凌乱地':['visual_detail'],'边缘发亮地':['visual_detail'],'贴近表面地':['visual_detail'],
  '冷白顶光':['light'],'冷白漫射光':['light'],'自然散射光':['light'],'逆光':['light'],'局部高光':['light'],'偏灰日光':['light'],
  '俯视':['perspective'],'平视':['perspective'],'贴近地面':['perspective'],'与花平齐':['perspective'],'近距离特写':['perspective'],'低机位':['perspective'],
  '紫色花朵':['secondary'],'绿色枝杆':['secondary'],'绿色枝茎':['secondary'],'红线':['secondary'],'血滴':['secondary_action'],
  '被包围':['relation'],'穿过':['relation']
};
const patterns=[
  [/顶光|散射光|逆光|高光|日光|侧光|月光|烛光|光束|阴影|反射/,['light']],
  [/机位|视角|景深|俯视|俯拍|仰拍|平视|特写|与.+平齐|贴近地面/,['perspective']],
  [/仓库|阳台|厨房|浴室|门口|窗边|花丛|湖面|走廊|房间|通道|车站|地面|墙角|空间|店|市场|车库/,['setting']],
  [/箱|碗|盆|托盘|袋|抽屉|缸|罐|瓶|篮|桶|槽|罩|盒|杯|锅/,['container','subject']],
  [/从.+中|从.+口|从.+部|沿.+|顺着.+|向外/,['path']],
  [/放置在|堆积在|贴附在|卡在|悬挂于|包裹在|沉在|夹在/,['placement']],
  [/流出|滑出|渗出|垂落|扩散|蔓延|倾泻|散落|塌下|堆叠|滴落|流淌|掠过|飘落/,['secondary_action']],
  [/散开|铺开|零散分布|四周扩开|留下.+痕迹|堆成|形成拖尾|涟漪/,['result']],
  [/潮湿|雨.*湿|塌陷|发皱|起皱|浸泡|浸水|冷白色|破损|褪色|发亮|变形|生锈|透明|柔软|冻结|裂开/,['modifier_state']],
  [/缓慢|局部|疏密不均|断续|凌乱|边缘发亮|贴近表面/,['visual_detail']],
  [/靠近|穿过|贴合|覆盖|包围|被包围|悬挂|缠绕|围绕|连接|嵌入/,['relation']]
];
const CATEGORY={object:['subject'],container:['container','subject'],life:['subject'],organic_matter:['subject'],space:['setting'],relation:['relation'],action:['secondary_action'],state:['modifier_state'],material:['secondary'],visual:['light','perspective'],scale:['visual_detail']};
const LEGACY_ROLE={scene:'setting',space:'setting',condition:'modifier_state',action:'secondary_action',state_material:'modifier_state',visual:'visual_detail',view:'perspective'};
const clean=item=>(item?.text||'').trim();

export function inferRoles(item){
  const label=clean(item);
  const explicit=item.sentenceRole||item.syntaxRole||LEGACY_ROLE[item.role]||item.role;
  if(SCENE_ROLES.includes(explicit))return [explicit];
  if(EXACT[label])return EXACT[label];
  const matched=patterns.find(([pattern])=>pattern.test(label));
  return matched?.[1]||CATEGORY[item.category]||['secondary'];
}

export function normalizeIngredient(item,index=0){
  const inferredRoles=inferRoles(item);
  const override=SCENE_ROLES.includes(item.userRoleOverride)?item.userRoleOverride:null;
  const finalRole=override||inferredRoles[0];
  return {...item,inferredRoles,inferredRole:inferredRoles[0],sentenceRole:finalRole,syntaxRole:finalRole,userRoleOverride:override,finalRole,selectionIndex:index};
}

export function planComposition(ingredients=[]){
  const normalized=ingredients.map(normalizeIngredient);
  let primary=normalized.find(w=>w.userRoleOverride==='subject')||normalized.find(w=>w.finalRole==='subject')||normalized.find(w=>w.inferredRoles.includes('subject'));
  const roles=Object.fromEntries(SCENE_ROLES.map(role=>[role,[]]));
  for(const word of normalized){
    let role=word.finalRole;
    if(role==='subject'&&primary&&word!==primary&&!word.userRoleOverride)role=word.inferredRoles.includes('container')?'container':'secondary';
    roles[role].push({...word,finalRole:role,sentenceRole:role,syntaxRole:role});
  }
  const relationTargetAvailable=!!(roles.relation.length&&(roles.setting.length||roles.container.length||roles.secondary.length));
  const warnings=[];
  if(!roles.subject.length)warnings.push('还缺少一个主体，什么东西是画面的主角？');
  if(!roles.container.length&&!roles.setting.length&&!relationTargetAvailable)warnings.push('还缺少一个容器或场域，画面发生在哪里？');
  if(!roles.placement.length&&!relationTargetAvailable)warnings.push('还缺少一个初始位置或放置方式，主体一开始如何出现？');
  if(!roles.path.length&&!relationTargetAvailable)warnings.push('还缺少一个路径/出口，元素是如何从内部过渡到外部的？');
  if(!roles.secondary_action.length)warnings.push('还缺少一个后续动作，主体会如何继续展开？');
  if(!roles.result.length)warnings.push('还缺少一个结果形态，这些元素最终变成什么样？');
  const explicitSubjects=normalized.filter(w=>w.userRoleOverride==='subject');
  if(explicitSubjects.length>1)warnings.unshift('当前有两个主体，建议保留一个作为主角。');
  const actionChainComplete=roles.subject.length&&(roles.container.length||roles.setting.length)&&roles.placement.length&&roles.path.length&&roles.secondary_action.length&&roles.result.length;
  const relationCompositionComplete=roles.subject.length&&relationTargetAvailable&&roles.secondary_action.length&&roles.result.length;
  const complete=actionChainComplete||relationCompositionComplete;
  return {status:explicitSubjects.length>1?'conflict':complete?'ok':'incomplete',warnings,roles,ingredients:SCENE_ROLES.flatMap(role=>roles[role])};
}

const one=(roles,role)=>clean(roles[role][0]);
const all=(roles,role)=>roles[role].map(clean).filter(Boolean);
const statefulContainer=(container,state)=>state?`${state.replace(/的$/,'')}的${container}`:container;
const punctuate=s=>`${s.replace(/[。；，]+$/,'')}。`;
const bindRelation=(relation,target)=>{
  if(!relation||!target)return '';
  if(relation==='缠绕')return `缠绕在${target}上`;
  if(relation==='贴附')return `贴附在${target}上`;
  if(relation==='贴合')return `贴合${target}表面`;
  if(relation==='覆盖')return `覆盖在${target}表面`;
  if(relation==='包裹')return `包裹着${target}`;
  if(relation==='围绕')return `围绕${target}`;
  if(relation==='嵌入')return `嵌入${target}`;
  if(relation==='悬挂于')return `悬挂于${target}`;
  return `${relation}${target}`;
};
const DISTRIBUTION_RESULTS=/^(散开|铺开|零散分布|向四周扩开|疏密不均地分布)$/;

export function generateDraft(plan,variation=0){
  const r=plan.roles,s=one(r,'subject');
  if(!s){const fallback=clean(plan.ingredients[0]);return fallback?`以${fallback}作为待确定的画面元素。`:''}
  const container=one(r,'container'),setting=one(r,'setting'),state=one(r,'modifier_state');
  const placement=one(r,'placement'),path=one(r,'path'),action=one(r,'secondary_action'),result=one(r,'result');
  const relation=one(r,'relation'),details=all(r,'visual_detail'),secondary=all(r,'secondary');
  const place=container?statefulContainer(container,state):setting;
  let sentence;
  if(container&&placement&&path&&action&&result){
    const templates=[
      `${s}被${placement}${place}中，随后${path}${details[0]||''}${action}，并在${/^(形成|留)/.test(result)?'外部':''}${/^(形成|留)/.test(result)?result:`外部${result}`}。`,
      `${s}${placement}${place}中，部分${path}${details[0]||''}${action}，最终在外部${result}。`,
      `${s}原本位于${place}内部，随后${path}${action}，在外部${result}。`,
      `将${s}放入${place}，让它${path}${action}，最后在外部${result}。`
    ];sentence=templates[variation%templates.length];
  }else if(setting&&secondary.length>=2&&relation){
    sentence=`${s}停留在${setting}中，${secondary.join('和')}从四周${relation.replace(/^被/,'')}它，使它像被周围环境吞没的一件日常物。`;
  }else if(setting&&relation&&secondary.length&&action&&result){
    sentence=`${s}${relation}${secondary[0]}掠过${setting}，${secondary.slice(1).join('和')||secondary[0]}随动作延伸，${action}${result==='涟漪'?'落入水中并激起一圈圈涟漪':`并${result}`}。`;
  }else if(relation&&(secondary.length||container||setting)&&(action||result)){
    const target=secondary[0]||container||setting;
    sentence=`${s}${bindRelation(relation,target)}`;
    if(action&&result){
      sentence+=DISTRIBUTION_RESULTS.test(result)
        ?`，部分${s}${action}在${target}四周，并${result}`
        :`，部分${s}${action}，并${result}`;
    }else if(action){
      sentence+=`，部分${s}${action}`;
    }else if(result){
      sentence+=DISTRIBUTION_RESULTS.test(result)?`，部分${s}${result}在${target}四周`:`，部分${s}${result}`;
    }
    sentence=punctuate(sentence);
  }else{
    const where=place?`${state&&!container?state:''}${place}`:'待确定的场域';
    sentence=`${s}${placement||'位于'}${where}${container?'中':''}`;
    if(path||action)sentence+=`，随后${path||''}${details[0]||''}${action||'继续展开'}`;
    if(result)sentence+=`，最终${result}`;
    if(relation&&secondary.length)sentence+=`；${secondary.join('和')}${relation}${s}`;
    sentence=punctuate(variation%2?sentence.replace('位于','暂留在'):sentence);
  }
  const perspective=all(r,'perspective'),light=all(r,'light');
  if(perspective.length||light.length){
    const view=perspective.length?`画面采用${perspective.join('、')}的视角`:'';
    const lighting=light.length?`${view?'，':''}${light.join('、')}让主体边缘、材质和接触位置更清楚`:'';
    sentence+=`${view}${lighting}。`;
  }
  return sentence;
}

export function composeIngredients(ingredients,variation=0){const plan=planComposition(ingredients);return {...plan,draftText:generateDraft(plan,variation),nextSuggestion:plan.warnings[0]||''}}
export const composeIngredientText=(ingredients,variation=0)=>composeIngredients(ingredients,variation).draftText;
