import {normalizeIngredient} from './ingredient-composer.js';

const q=value=>`「${value}」`;
const hash=text=>[...text].reduce((sum,char)=>((sum*31)+char.charCodeAt(0))>>>0,17);
const pick=(items,seed)=>{
  const start=seed%items.length;
  return Array.from({length:3},(_,index)=>items[(start+index)%items.length]);
};

function context(ingredients){
  const normalized=ingredients.map(normalizeIngredient);
  const byRole=role=>normalized.find(item=>item.finalRole===role)?.text;
  return {
    seed:hash(normalized.map(item=>`${item.text}:${item.finalRole}:${item.sourceCategory||item.category}`).join('|')),
    subject:byRole('subject')||normalized[0]?.text||'主体',
    setting:byRole('setting')||byRole('container')||'当前空间',
    relation:byRole('placement')||byRole('path')||byRole('relation')||'当前关系',
    action:byRole('secondary_action')||byRole('result')||'当前动作',
    detail:byRole('visual_detail')||byRole('modifier_state'),
    light:byRole('light')
  };
}

const move=(name,text)=>({name,text});
export function buildVisualDevelop(ingredients=[]){
  const c=context(ingredients),s=q(c.subject),place=q(c.setting),relation=q(c.relation),action=q(c.action);
  const relationMoves=[
    move('PASS THROUGH',`让${s}不再只是${relation}，而是从接触位置或边缘穿出。`),
    move('WRAP',`让${s}沿${place}的轮廓包裹，使接触关系变得连续。`),
    move('PRESS',`让${s}在${relation}的位置受到挤压，强化接触与形变。`),
    move('COVER',`让${s}从局部接触逐渐覆盖原本可见的表面。`),
    move('ATTACH',`只保留少数连接点，让${s}与${place}的依附方式清楚可见。`),
    move('SUSPEND',`让${s}离开承接面，在${action}发生前保持悬停。`),
    move('LEAK',`让${s}从${relation}的细小开口断续漏出。`),
    move('INSERT',`把${s}的一部分嵌入接触位置，另一部分留在外部。`),
    move('SURROUND',`让${s}从多个方向靠近并围住当前接触位置。`),
    move('SEPARATE',`拉开${s}与${place}的距离，只留下关系即将中断的张力。`),
    move('INTERLOCK',`让${s}与接触边缘彼此穿插，而不是单向覆盖。`),
    move('SPILL',`让${s}从原本局部的位置逐渐向外溢出。`)
  ];
  const scaleMoves=[
    move('REPEAT',`把${s}从少量变成大量重复，让它开始改变${place}。`),
    move('ENLARGE',`只放大一个${c.subject}，让周围结构成为尺度参照。`),
    move('OVERFLOW',`让${s}超过${place}可以容纳的范围，并继续向画面外发展。`),
    move('MINIATURIZE',`缩小${s}，让${place}的尺度显得异常巨大。`),
    move('ACCUMULATE',`让${s}由零散逐步积聚成一个占比明确的群体。`),
    move('ISOLATE',`只留下一个${c.subject}，用大面积空白强化它的尺度。`),
    move('OCCUPY',`逐步提高${s}在画面中的占比，直到空间退为边缘。`),
    move('DENSITY',c.detail?`把${q(c.detail)}从局部分布扩大成整个画面的疏密节奏。`:`让${s}由密到疏分布，形成可见的数量节奏。`)
  ];
  const materialMoves=[
    move('WET',`保留${s}的形态，但让表面吸水、贴合并产生重量感。`),
    move('TRANSLUCENT',`降低${s}的不透明度，让边缘、重叠和透光关系显现。`),
    move('BRITTLE',`让${s}出现脆裂、断层或碎片化，但不更换主体。`),
    move('SOFT',`让${s}在${relation}的位置变软并顺着接触面形变。`),
    move('REFLECTIVE',`让${s}的表面反射周围明暗，弱化原有颜色。`),
    move('WAXY',`让${s}保留形态，同时出现蜡质的厚度与钝光。`),
    move('METALLIC',`把${s}的表面变为金属质感，突出折痕和受力位置。`),
    move('PAPER-LIKE',`让${s}变薄、起折，并在边缘显出纸张般的层次。`),
    move('MELTING',`让${s}的轮廓仍可辨认，但在接触处逐渐融化。`),
    move('POROUS',`让${s}表面出现可吸收光线与水分的细小孔隙。`)
  ];
  const spaceMoves=[
    move('EDGE',`把主要关系压缩到${place}的边缘，而不是放在空间中央。`),
    move('CORNER',`让${action}集中发生在${place}的角落，强化两个面的夹合。`),
    move('SEAM',`把${s}放到${place}的接缝处，让关系沿缝隙继续。`),
    move('INSIDE',`让主要关系退到${place}内部，只从开口显露一部分。`),
    move('THRESHOLD',`让${s}停在${place}内外的交界，不完全进入任何一侧。`),
    move('SUSPENDED',`让关系离开地面，在${place}中保持悬置。`),
    move('ENCLOSED',`缩小可用空间，让${s}与四周边界同时发生接触。`),
    move('EMPTY FIELD',`把关系移入${place}的大面积空白中，让距离成为重点。`),
    move('BEYOND FRAME',`让${action}明显继续到画面之外，使${place}看起来无法容纳它。`)
  ];
  const lightMoves=[
    move('BACKLIT',`从${s}背后照亮，使边缘、透明度和重叠关系显现。`),
    move('DIFFUSED',`用漫射光减弱明确阴影，让${relation}的细微接触更容易看见。`),
    move('HARD SIDE LIGHT',`用硬侧光拉出表面起伏与${action}的方向。`),
    move('SHADOWLESS',`减少方向性阴影，让${s}更接近标本或档案记录。`),
    move('LOCAL LIGHT',`只照亮${action}发生的位置，让${place}退入暗部。`),
    move('LOW CONTRAST',`压低明暗差，让${s}与${place}的边界变得含混。`),
    move('HIGH CONTRAST',`扩大明暗差，只保留动作轮廓和关键接触点。`),
    move('REFLECTED',`用反射光绕回接触面，使阴影内部仍保留细节。`),
    move('GLOW THROUGH',`让光穿过${s}，把厚薄变化转成亮度变化。`)
  ];
  // A known light offsets the choices, deliberately proposing alternatives.
  const lightSeed=c.seed+(c.light?5:0);
  const momentMoves=[
    move('BEFORE',`停在${action}之前，让${s}与接触面之间仍保留距离。`),
    move('BEGINNING',`不要表现${action}已经完成，而停在刚开始脱离接触面的瞬间。`),
    move('MID-ACTION',`选择${action}正在进行、起点与去向同时可见的一刻。`),
    move('PEAK',`选择${action}最明显、运动方向最清楚的一刻。`),
    move('ABOUT TO BREAK',`停在连接即将断开但仍未分离的瞬间。`),
    move('AFTER',`不再强调${s}本身，只保留${action}之后的残余。`),
    move('RESIDUE',`把时间推到动作结束后，用接触面上的残留说明发生过什么。`),
    move('TRACE',`隐藏动作主体，只让${action}经过的路径留在画面中。`)
  ];
  return {
    relation:pick(relationMoves,c.seed+1),scale:pick(scaleMoves,c.seed+3),material:pick(materialMoves,c.seed+5),
    space:pick(spaceMoves,c.seed+7),light:pick(lightMoves,lightSeed+9),moment:pick(momentMoves,c.seed+11)
  };
}
