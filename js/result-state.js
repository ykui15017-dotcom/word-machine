const REQUIRED_ROLES=[
  ['subject','主体'],
  ['support','容器 / 场域'],
  ['placement','初始位置'],
  ['path','路径 / 出口'],
  ['secondary_action','后续动作'],
  ['result','结果形态']
];

export function formatResultState(result){
  if(result.status==='conflict')return '需要调整：路径与当前对象不匹配';
  if(result.status==='ok')return '结构完整';
  const roles=result.roles||{};
  const missing=REQUIRED_ROLES.filter(([role])=>role==='support'
    ?!roles.container?.length&&!roles.setting?.length
    :!roles[role]?.length).map(([,label])=>label);
  return missing.length?`还缺：${missing.join(' · ')}`:'结构完整';
}
