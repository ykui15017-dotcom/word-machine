const by=(words,c)=>words.find(w=>w.category===c)?.text;
export function buildSentence(words,recipe){const v=c=>by(words,c);const first=words[0]?.text||'某样东西';
 const templates={
  contents:()=>`一个${v('container')||first}里，${v('object')||'陌生物件'}以${v('state')||'安静'}的状态挤在一起，像是日常秩序里出现了一处小小的错误。`,
  physical:()=>`${v('object')||first}呈现出${v('state')||'异样'}的姿态，表面像${v('material')||'陌生材料'}，熟悉的轮廓因此变得难以解释。`,
  space:()=>`${v('object')||first}出现在${v('space')||'空房间'}里，正在${v('action')||'缓慢移动'}；周围的尺度让这一幕显得真实又不合时宜。`,
  relation:()=>`${v('object')||first}与${v('organic')||'植物'}彼此${v('relation')||'缠绕'}，两种原本无关的世界共享同一个轮廓。`,
  quantity:()=>`${v('scale')||'数百个'}${v('object')||first}散落在${v('space')||'房间'}中，重复的形状几乎把空间原有的用途完全覆盖。`,
  scene:()=>`一个${v('container')||first}放在${v('space')||'空房间'}中央，里面的${v('object')||'物件'}正在${v('state')||'漂浮'}，${v('visual')||'柔和侧光'}掠过表面，留下细碎反射。`,
  living:()=>`${v('living')||first}覆盖着${v('material')||'薄膜'}般的表面，正${v('action')||'缓慢移动'}，近处还能看见${v('detail')||'细小划痕'}。`,
  observation:()=>`从“${v('observation')||first}”开始，${v('object')||'一个物件'}与它${v('relation')||'并排'}出现，${v('visual')||'安静的光'}让这段日常观察像一帧未完成的电影。`};
 return (templates[recipe?.sentence]||templates.physical)();
}
