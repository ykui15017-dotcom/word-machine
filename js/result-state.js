const REQUIRED_ROLES=[
  ['subject','主体'],
  ['support','容器 / 场域'],
  ['placement','初始位置'],
  ['path','路径 / 出口'],
  ['secondary_action','后续动作'],
  ['result','结果形态']
];

export const COMPLETION_HINTS={
  path:{label:'路径 / 出口',description:'它从哪里经过、滑出或向外延伸？',examples:['从缝隙中','沿边缘','从底部','顺着裂口','沿地面','从容器边缘']},
  result:{label:'结果形态',description:'动作结束后，元素最后呈现什么形态？',examples:['散开','零散分布','堆积','铺开','形成拖尾','停留在边缘']}
};

export function missingResultRoles(result){
  const roles=result.roles||{};
  return REQUIRED_ROLES.filter(([role])=>role==='support'
    ?!roles.container?.length&&!roles.setting?.length
    :!roles[role]?.length).map(([role,label])=>({role,label,...COMPLETION_HINTS[role]}));
}

export function formatResultState(result){
  if(result.status==='conflict')return '需要调整：路径与当前对象不匹配';
  if(result.status==='ok')return '结构完整';
  const missing=missingResultRoles(result);
  return missing.length?`还可以补充：${missing.map(item=>item.label).join(' · ')}`:'结构完整';
}
