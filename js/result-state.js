const REQUIRED_ROLES=[
  ['subject','主体'],
  ['support','容器 / 场域'],
  ['placement','初始位置'],
  ['path','路径 / 出口'],
  ['secondary_action','后续动作'],
  ['result','结果形态']
];

const ROLE_LABELS={
  subject:'主体',
  target:'作用对象',
  relation:'核心关系',
  support:'容器 / 场域',
  placement:'初始位置',
  path:'路径 / 出口',
  secondary_action:'后续动作',
  result:'结果形态'
};

export const COMPLETION_HINTS={
  target:{label:'作用对象',description:'主体正在和什么对象、表面或空间发生关系？'},
  relation:{label:'核心关系',description:'两个对象如何接触、连接、覆盖、穿过或彼此作用？'},
  path:{label:'路径 / 出口',description:'元素从哪里经过、出来或向外延伸？'},
  result:{label:'结果形态',description:'动作结束后，元素最终呈现什么形态？'}
};

const describe=role=>({role,label:ROLE_LABELS[role]||role,...COMPLETION_HINTS[role]});

export function missingResultRoles(result){
  if(Array.isArray(result.missingRoles))return result.missingRoles.map(describe);
  const roles=result.roles||{};
  return REQUIRED_ROLES.filter(([role])=>role==='support'
    ?!roles.container?.length&&!roles.setting?.length
    :!roles[role]?.length).map(([role])=>describe(role));
}

export function formatResultState(result){
  if(result.status==='conflict')return '需要调整：路径与当前对象不匹配';
  if(result.status==='ok')return '结构完整';
  const missing=missingResultRoles(result);
  return missing.length?`还可以补充：${missing.map(item=>item.label).join(' · ')}`:'结构完整';
}
