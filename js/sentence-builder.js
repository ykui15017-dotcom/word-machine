const t=value=>value?.text||'';
const visualSentence=plan=>{if(!plan.visual)return '';const visual=t(plan.visual),subject=t(plan.subject);if(/照亮|投向|打在/.test(visual))return `${visual}${subject}的边缘、表面起伏和接触位置。`;if(/光|高光|阴影|反射|过曝/.test(visual))return `${visual}沿着${subject}的边缘、表面起伏和接触位置出现。`;return `${visual}集中出现在${subject}的边缘和接触位置。`};
const secondarySentence=plan=>plan.secondaryOperation?.relation?`${plan.secondaryOperation.relation}。`:'';
export function buildSentence(input,legacyOperation,mode='expanded'){
  const plan=input?.operation&&input?.relation?input:legacyOperation?.scenePlan;
  if(!plan)return '';
  const opening=`${plan.relation}。`,extras=[secondarySentence(plan),visualSentence(plan)].filter(Boolean);
  if(mode==='short')return [opening,...extras.slice(0,1)].join('');
  return [opening,...extras].slice(0,3).join('');
}
