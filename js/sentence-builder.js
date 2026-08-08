const find=(words,category)=>words.find(word=>word.category===category)?.text;
const choose=list=>list[Math.floor(Math.random()*list.length)];
const join=words=>words.map(word=>word.text).join('、');
const recipeOpenings={
  contents:'把容器当作一处微型现场', physical:'把熟悉物件处理成物理异常', space:'让主体进入不合用途的空间', relation:'让两类形态发生直接接触', quantity:'用数量与尺度重新组织画面', scene:'建立一处可进入的完整场景', living:'把生命体的表面重新制作', observation:'从具体生活痕迹开始取景', concept:'把抽象概念落实为可见布景', detail:'将表面细节推到画面中心', ecosystem:'把容器变成一套小型生态', light:'让光线与尺度共同控制画面'
};

// Ten composition patterns apply to every recipe, while recipe openings and
// available category phrases keep their emphasis distinct (12 × 10 variants).
const expandedPatterns=[
  x=>`${x.open}：${x.subject}位于${x.space}，${x.action}，${x.material}与${x.detail}在${x.light}下同时可见；${x.scale}，画面保持${x.mood}。`,
  x=>`${x.space}里出现${x.subject}。它以${x.state}的状态${x.relation}，近处能看到${x.detail}，${x.light}把${x.material}的表面分成明暗两层，尺度设为${x.scale}。`,
  x=>`以${x.subject}为主体，背景只保留${x.space}的结构；让它${x.action}并与周围${x.relation}，突出${x.material}、${x.detail}和${x.light}，整体密度${x.density}。`,
  x=>`${x.open}。镜头从${x.detail}开始，逐渐露出${x.subject}和${x.space}；${x.light}沿着${x.material}移动，所有元素以${x.scale}排列，不加入解释性文字。`,
  x=>`在${x.space}搭建一幅${x.mood}的静物场景：${x.subject}${x.relation}，表面呈${x.state}，${x.detail}保留在近景，使用${x.light}与${x.density}的分布。`,
  x=>`${x.subject}被放大为${x.scale}并置于${x.space}，它正在${x.action}；用${x.material}表现外层，以${x.detail}表现使用痕迹，光线采用${x.light}。`,
  x=>`正面观察${x.subject}：前景是${x.detail}，中景发生${x.relation}，后景为${x.space}。${x.light}形成清晰层次，物体维持${x.state}，气氛偏${x.mood}。`,
  x=>`让${x.subject}从${x.space}的边缘进入画面，密度由疏到${x.density}；${x.material}表面正在${x.action}，只有${x.light}照亮${x.detail}，尺度为${x.scale}。`,
  x=>`${x.open}，采用贴近表面的视角。${x.subject}与环境${x.relation}，呈现${x.state}；强调${x.detail}的真实质感、${x.light}和${x.material}之间的微弱反射。`,
  x=>`构图中心放置${x.subject}，四周留出${x.space}的空白。以${x.scale}控制比例，以${x.density}控制重复，以${x.light}控制气氛，并清楚保留${x.detail}。`
];
const shortPatterns=[
  x=>`${x.subject}在${x.space}${x.action}，${x.light}照出${x.detail}。`,
  x=>`${x.scale}的${x.subject}与${x.material}${x.relation}。`,
  x=>`${x.subject}呈${x.state}，置于${x.light}中的${x.space}。`,
  x=>`近看${x.detail}，远处是${x.subject}和${x.space}。`,
  x=>`${x.subject}被${x.material}包裹，密度${x.density}。`
];

export function buildSentence(words,recipe,mode='expanded'){
  const get=(category,fallback)=>find(words,category)||fallback;
  const x={
    open:recipeOpenings[recipe?.sentence]||'建立一处视觉现场', subject:get('observation',get('object',get('living',get('container',words[0]?.text||'一个物件')))),
    space:get('space','一处空白房间'), action:get('action',get('state','缓慢发生变化')), state:get('state','轻微变形'), material:get('material','半透明材料'),
    relation:get('relation','彼此贴合'), light:get('visual','冷白漫射光'), scale:get('scale','接近真实尺寸'), detail:get('detail','细小的表面痕迹'),
    density:get('scale','疏密不均'), mood:get('concept','安静而具体')
  };
  if(mode==='short')return choose(shortPatterns)(x);
  return choose(expandedPatterns)(x)+(words.length?` 视觉元素：${join(words)}。`:``);
}
