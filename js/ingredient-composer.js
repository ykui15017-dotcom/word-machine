export const SCENE_ROLES=['subject','scene','secondary','relation','action','state_material','visual','concept'];

export const ROLE_LABELS={subject:'主体',scene:'场域',secondary:'陪体',relation:'关系',action:'动作',state_material:'状态／材质',visual:'视觉',concept:'概念'};

const EXACT={
  '购物车':['subject','secondary'],'鱼缸':['subject','secondary','scene'],'板装药片':['subject','secondary'],
  '花丛':['scene','secondary'],'走廊':['scene'],'浴室':['scene'],'桌面':['scene'],
  '缠绕':['relation','action'],'穿过':['relation','action'],'贴合':['relation'],'覆盖':['relation','action'],'悬挂':['relation','action'],
  '半浸':['state_material','relation'],'潮湿':['state_material'],'褪色':['state_material'],'发亮':['state_material'],'变形':['state_material'],
  '冷白漫射光':['visual'],'低机位':['visual'],'逆光':['visual'],'俯拍':['visual'],'浅景深':['visual'],
  '临时搭建的秩序':['concept']
};
const patterns=[
  [/光|机位|视角|景深|俯拍|仰拍|平视|高光|色调|构图|前景|背景虚化|与.+平齐/,['visual']],
  [/走廊|浴室|桌面|花丛|房间|厨房|阳台|街道|地面|墙角|湖面|空间|室内|室外/,['scene','secondary']],
  [/缠绕|穿过|贴合|覆盖|悬挂|包裹|夹在|围绕|依靠|嵌入|连接/,['relation','action']],
  [/滴落|流淌|生长|挤压|散落|折叠|漂浮|堆积/,['action','relation']],
  [/潮湿|褪色|发亮|变形|半浸|生锈|透明|柔软|粗糙|破损|冻结|材质/,['state_material']],
  [/秩序|感觉|记忆|日常病变|错误|临时|陌生|不安|被发现/,['concept']]
];
const CATEGORY={object:['subject','secondary'],container:['subject','secondary','scene'],life:['subject','secondary'],organic_matter:['secondary','subject'],space:['scene'],relation:['relation'],action:['action','relation'],state:['state_material'],material:['state_material','secondary'],visual:['visual'],scale:['visual']};
const clean=item=>(item?.text||'').trim();

export function inferRoles(item){
  const label=clean(item);
  const suppliedRole={subject:['subject','secondary'],space:['scene'],condition:['state_material'],relation:['relation','action'],view:['visual']}[item.role];
  if(suppliedRole)return suppliedRole;
  if(EXACT[label])return EXACT[label];
  const matched=patterns.find(([pattern])=>pattern.test(label));
  return matched?.[1]||CATEGORY[item.category]||['concept'];
}

export function normalizeIngredient(item,index=0){
  const inferredRoles=inferRoles(item);
  const override=SCENE_ROLES.includes(item.userRoleOverride)?item.userRoleOverride:null;
  return {...item,inferredRoles,inferredRole:inferredRoles[0],userRoleOverride:override,finalRole:override||inferredRoles[0],selectionIndex:index};
}

export function planComposition(ingredients=[]){
  const normalized=ingredients.map(normalizeIngredient);
  // Keep an explicit/manual subject stable; otherwise the first strong physical item wins.
  let primary=normalized.find(w=>w.userRoleOverride==='subject')||normalized.find(w=>w.finalRole==='subject');
  if(!primary)primary=normalized.find(w=>w.inferredRoles.includes('subject'));
  const roles=Object.fromEntries(SCENE_ROLES.map(role=>[role,[]]));
  for(const word of normalized){
    let role=word.finalRole;
    if(role==='subject'&&primary&&word!==primary&&!word.userRoleOverride)role='secondary';
    roles[role].push({...word,finalRole:role});
  }
  const warnings=[];
  if(!roles.subject.length)warnings.push('还缺少一个明确主体，谁是画面的主角？');
  if(!roles.scene.length)warnings.push('还缺少一个空间／场域词，画面发生在哪里？');
  if(!roles.relation.length&&!roles.action.length)warnings.push('还缺少一个关系词，这些元素之间如何相遇？');
  if((roles.relation.length||roles.action.length)&&!roles.secondary.length)warnings.push('关系词还缺少作用对象，可以加入一个陪体。');
  if(!roles.visual.length)warnings.push('当前缺少视觉条件，可以加入光线、视角或色彩词。');
  const explicitSubjects=normalized.filter(w=>w.userRoleOverride==='subject');
  if(explicitSubjects.length>1)warnings.unshift('当前有两个主体，建议保留一个作为主角。');
  const hasDirectedRelation=(roles.relation.length||roles.action.length)&&roles.secondary.length;
  const status=explicitSubjects.length>1?'conflict':roles.subject.length&&roles.scene.length&&hasDirectedRelation?'ok':'incomplete';
  return {status,warnings,roles,ingredients:SCENE_ROLES.flatMap(role=>roles[role])};
}

const list=items=>items.map(clean).filter(Boolean).join('、');
export function generateDraft(plan,variation=0){
  const {roles}=plan,s=clean(roles.subject[0]);
  if(!s)return '';
  const scene=list(roles.scene),secondary=list(roles.secondary),relation=list(roles.relation),action=list(roles.action),state=list(roles.state_material),visual=list(roles.visual),concept=list(roles.concept);
  let first=scene?`${s}被放置在${scene}中`:`以${s}作为画面中心`;
  if(state)first+=`，呈现${state}的状态`;
  if(secondary){
    const connector=relation||action;
    first+=connector?`。${secondary}${action?`以${action}的动作`:''}${relation?`${action?'，并':''}${relation}`:''}${s}`:`。${secondary}作为陪体靠近${s}，但两者的具体关系仍待确定`;
  }else if(relation||action){
    first+=`。保留“${relation||action}”作为待落实的关系，补入作用对象后再确定它如何发生`;
  }
  if(visual){
    const visualLead=variation%2?'画面以':'镜头采用';
    first+=`。${visualLead}${visual}，让主体、陪体与空间层次清楚可见`;
  }
  if(concept)first+=`，整体带一点${concept}的感觉`;
  return `${first.replace(/[。；，]+$/,'')}。`;
}

export function composeIngredients(ingredients,variation=0){
  const plan=planComposition(ingredients);
  return {...plan,draftText:generateDraft(plan,variation),nextSuggestion:plan.warnings[0]||''};
}

export const composeIngredientText=(ingredients,variation=0)=>composeIngredients(ingredients,variation).draftText;
