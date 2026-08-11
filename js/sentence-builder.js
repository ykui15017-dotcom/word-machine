const byRole=(words,role)=>words.find(word=>word.role===role)?.text;
const core=words=>({subject:byRole(words,'subject'),anomaly:byRole(words,'anomaly'),relation:byRole(words,'relation')?.replace(/^被/,'') ,space:byRole(words,'space'),visual:byRole(words,'visual'),detail:byRole(words,'detail'),scale:byRole(words,'scale'),concept:byRole(words,'concept')});
const where=x=>x.space?`在${x.space}中，`:'';
const lit=x=>x.visual?`${x.visual}落在${x.subject}${x.anomaly||x.detail?`与${x.anomaly||x.detail}`:''}上。`:'';
const detail=x=>x.detail?`${x.detail}保留在${x.subject}的局部。`:'';
const patterns={
  wrong_contents:x=>`${where(x)}${x.subject}里${x.relation}着${x.anomaly}。`,
  structure_replacement:x=>`${where(x)}${x.subject}的${x.detail}被${x.anomaly}${x.relation}。`,
  organic_invasion:x=>`${where(x)}${x.anomaly}从${x.subject}表面${x.relation}。`,
  surface_transfer:x=>`${where(x)}${x.anomaly}被${x.relation}到${x.subject}表面。`,
  scale_anomaly:x=>`${where(x)}${x.subject}被${x.relation}至${x.scale}。`,
  function_misplacement:x=>`${where(x)}${x.subject}被用于${x.anomaly}，并开始${x.relation}。`,
  space_closure:x=>`${x.space}中，${x.subject}通过${x.relation}形成“${x.concept}”的空间规则。`,
  wrong_attachment:x=>`${where(x)}${x.anomaly}在${x.subject}表面${x.relation}。`,
  quantity_anomaly:x=>`${where(x)}${x.subject}中，${x.scale}的${x.anomaly}不断${x.relation}。`,
  material_illusion:x=>`${where(x)}${x.subject}保持原形，但表面呈现${x.anomaly}，并${x.relation}。`,
  observation_magnify:x=>`${where(x)}${x.anomaly}被${x.relation}到${x.subject}上${x.scale?`，并呈现${x.scale}`:''}。`,
  still_life_collision:x=>`${where(x)}${x.subject}与${x.anomaly}发生${x.relation}。`
};
export function buildSentence(words,recipe,mode='expanded'){const x=core(words),opening=(patterns[recipe?.sentence]||patterns.still_life_collision)(x);if(mode==='short')return `${opening}${x.visual?` ${x.visual}照亮两者。`:''}`;return [opening,lit(x),detail(x)].filter(Boolean).join(' ')}
