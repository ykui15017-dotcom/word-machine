const value = (words, category, fallback) => words.find(word => word.category === category)?.text || fallback;
const choose = values => values[Math.floor(Math.random() * values.length)];

function context(words) {
  return {
    object: value(words, 'object', '一件日常物品'), container: value(words, 'container', '透明容器'),
    space: value(words, 'space', '空房间'), living: value(words, 'living', '小型生物'),
    organic: value(words, 'organic', '一簇植物'), material: value(words, 'material', '半透明材料'),
    action: value(words, 'action', '缓慢移动'), state: value(words, 'state', '安静悬停'),
    relation: value(words, 'relation', '彼此交叠'), scale: value(words, 'scale', '密集的一整排'),
    visual: value(words, 'visual', '柔和侧光'), concept: value(words, 'concept', '短暂的秩序'),
    detail: value(words, 'detail', '细小划痕'), observation: value(words, 'observation', '玻璃上未干的水痕')
  };
}

const SHORT_TEMPLATES = {
  contents: [
    c => `${c.container}里装着${c.object}，整体${c.state}，近处可见${c.detail}。`,
    c => `${c.object}填进${c.container}，以${c.scale}的数量排列，${c.visual}从上方照入。`,
    c => `一个${c.container}被${c.object}占满，内容物${c.state}，边缘留下${c.detail}。`,
    c => `${c.container}内部重复出现${c.object}，密度逐渐增加，表面落着${c.visual}。`,
    c => `${c.object}从${c.container}的开口向外溢出，保持${c.state}，背景大面积留白。`,
    c => `把${c.object}整齐封在${c.container}中，数量为${c.scale}，只照亮轮廓和${c.detail}。`,
    c => `${c.container}倒置，${c.object}仍停在内部，呈现${c.state}的悬浮层次。`,
    c => `${c.object}贴着${c.container}内壁排列，${c.visual}穿过容器，在表面形成反射。`,
    c => `半开的${c.container}中挤着${c.object}，局部${c.state}，带有${c.concept}的安静气氛。`,
    c => `${c.scale}的${c.object}堆在${c.container}底部，细节集中在${c.detail}和透明边缘。`
  ],
  physical: [
    c => `${c.object}呈现${c.state}，表面替换成${c.material}，${c.visual}强调边缘厚度。`,
    c => `一件${c.object}被拉伸到${c.scale}，材质像${c.material}，近处布满${c.detail}。`,
    c => `${c.object}正在${c.action}，外壳由${c.material}构成，内部仍保持半透明。`,
    c => `把${c.object}压平，保留原有轮廓，以${c.material}的反光和${c.detail}表现表面。`,
    c => `${c.object}局部${c.state}，硬质部分逐渐转为${c.material}，背景使用${c.visual}。`,
    c => `一个放大的${c.object}悬在白色空间，表面为${c.material}，边缘出现${c.detail}。`,
    c => `${c.object}像软体结构一样${c.action}，${c.material}外皮被挤出连续褶皱。`,
    c => `只保留${c.object}的基本形状，将内部换成${c.material}，整体处于${c.state}。`,
    c => `${c.visual}照亮${c.object}，材质在${c.material}与潮湿表面之间变化。`,
    c => `${c.object}被切开一半，断面呈${c.material}质感，并显露${c.detail}。`
  ],
  space: [
    c => `${c.object}出现在${c.space}中央，正在${c.action}，${c.visual}把影子拉向一侧。`,
    c => `空旷的${c.space}里只放着${c.object}，物体${c.state}，周围保留大量空白。`,
    c => `${c.scale}的${c.object}沿${c.space}地面延伸，重复轮廓被${c.visual}切开。`,
    c => `${c.object}卡在${c.space}不合用途的位置，表面带着潮湿使用痕迹。`,
    c => `从远处观看${c.space}，${c.object}正在${c.action}，尺度接近一件大型家具。`,
    c => `${c.space}的出口被${c.object}遮住，整体${c.state}，只留下窄缝光。`,
    c => `在${c.space}角落重复摆放${c.object}，密度由疏到密，光线保持冷白。`,
    c => `${c.object}悬在${c.space}半空，${c.visual}从下方照亮，地面没有支撑结构。`,
    c => `${c.space}保持原有陈设，只有${c.object}以${c.scale}的异常尺度出现。`,
    c => `潮湿的${c.space}中，${c.object}缓慢${c.action}，倒影与实物轻微错位。`
  ],
  relation: [
    c => `${c.object}与${c.organic}${c.relation}，连接处可见${c.detail}，使用${c.visual}。`,
    c => `${c.organic}从${c.object}内部长出，两者以${c.relation}的方式共享同一轮廓。`,
    c => `把${c.object}和${c.living}并置，让它们${c.relation}，表面统一为${c.material}。`,
    c => `${c.object}被${c.organic}包围，枝叶穿过开口，在接触位置留下细小压痕。`,
    c => `${c.living}停在${c.object}表面，双方${c.relation}，比例接近一比一。`,
    c => `${c.object}与${c.organic}上下倒置，影子在地面连接，实体保持分离。`,
    c => `${c.organic}沿${c.object}边缘生长，逐渐覆盖一半表面，细节清晰可见。`,
    c => `两组${c.object}和${c.organic}交替排列，以${c.relation}形成重复结构。`,
    c => `${c.visual}下，${c.object}的硬边与${c.organic}的柔软表面彼此重叠。`,
    c => `${c.object}托住${c.organic}，连接部分换成${c.material}，整体轻微失衡。`
  ],
  quantity: [
    c => `${c.scale}的${c.object}铺满${c.space}，密度向画面中心增加。`,
    c => `${c.object}不断复制，最终以${c.scale}占据地面，只保留一条通道。`,
    c => `在${c.space}中排列${c.scale}的${c.object}，每个间距完全一致。`,
    c => `${c.scale}的${c.object}悬在半空，${c.visual}制造密集重叠的影子。`,
    c => `${c.object}从一个增加到${c.scale}，沿墙面${c.relation}，色彩保持低饱和。`,
    c => `让${c.object}以${c.scale}堆到${c.space}顶部，边缘零散滑落。`,
    c => `${c.space}里只有重复的${c.object}，数量${c.scale}，尺寸由近到远递减。`,
    c => `${c.object}密集塞进画面一角，其余空间留白，形成数量上的偏重。`,
    c => `${c.scale}的${c.object}围成一个空心圆，${c.visual}只照亮外侧边缘。`,
    c => `俯视${c.space}，${c.object}像颗粒一样扩散，范围达到${c.scale}。`
  ],
  scene: [
    c => `${c.space}里，${c.object}处于${c.state}，${c.visual}掠过表面并照出${c.detail}。`,
    c => `一个${c.container}放在${c.space}中央，内部${c.action}，环境使用${c.visual}。`,
    c => `${c.visual}照进${c.space}，${c.object}沿地面排列，近处保留${c.detail}。`,
    c => `${c.space}空无一人，只有${c.scale}的${c.object}处于${c.state}。`,
    c => `从门口望向${c.space}，${c.container}半开，${c.object}从里面缓慢溢出。`,
    c => `${c.space}保持浅灰背景，${c.object}被${c.visual}分成明暗两部分。`,
    c => `潮湿的${c.space}中放着${c.container}，周围散落${c.detail}，光线冷而平。`,
    c => `${c.object}在${c.space}里${c.action}，运动轨迹由重复影子表现。`,
    c => `广角观看${c.space}，中央物体仅占很小比例，${c.visual}覆盖大面积地面。`,
    c => `${c.space}内形成${c.concept}的布置：${c.object}、浅色表面和清晰阴影。`
  ],
  living: [
    c => `${c.living}覆盖着${c.material}表皮，正在${c.action}，近处可见${c.detail}。`,
    c => `${c.living}处于${c.state}，身体像${c.material}一样半透明，边缘被${c.visual}照亮。`,
    c => `一只${c.living}被放大，表面替换成${c.material}，仍保留自然关节结构。`,
    c => `${c.living}缓慢${c.action}，身后留下${c.material}质感的薄膜和水痕。`,
    c => `${c.scale}的${c.living}彼此${c.relation}，皮肤呈现统一的${c.material}光泽。`,
    c => `${c.visual}穿过${c.living}的半透明身体，内部结构形成细碎投影。`,
    c => `${c.living}停在白色背景前，局部${c.state}，表面布满${c.detail}。`,
    c => `让${c.living}与${c.material}共用同一种纹理，动作保持缓慢、克制。`,
    c => `${c.living}从${c.material}薄层里探出，连接处柔软并带有冷凝水。`,
    c => `${c.living}排列成一行，每只都在${c.action}，${c.visual}制造轻微错位的影子。`
  ],
  observation: [
    c => `以“${c.observation}”为近景，旁边放置${c.object}，使用${c.visual}记录表面变化。`,
    c => `放大观察${c.observation}，让${c.detail}占据画面中心，背景为${c.space}。`,
    c => `从“${c.observation}”延伸出一组${c.object}，彼此${c.relation}，光线保持自然。`,
    c => `${c.space}中的局部特写：${c.observation}，边缘出现${c.detail}和浅色反光。`,
    c => `保留${c.observation}的真实尺度，只增加${c.visual}和一块大面积空白。`,
    c => `围绕“${c.observation}”安排${c.scale}的重复细节，焦点落在最潮湿的位置。`,
    c => `${c.observation}与${c.object}在同一平面出现，材质、折痕和水汽清晰可见。`,
    c => `拍摄${c.observation}的侧面，让${c.visual}擦过凸起与凹陷。`,
    c => `把${c.observation}置于${c.space}背景前，仅保留灰白色、反光和使用痕迹。`,
    c => `${c.observation}被进一步放大，${c.detail}形成近似地形的表面层次。`
  ],
  surface: [
    c => `${c.material}表面布满${c.detail}，${c.visual}从低角度擦过，显出细微起伏。`,
    c => `${c.object}的局部特写，材质为${c.material}，磨损集中在${c.detail}。`,
    c => `一层${c.material}覆盖${c.container}，边缘${c.state}，留下连续的${c.detail}。`,
    c => `放大${c.detail}，让它在${c.material}上形成重复纹理和浅色阴影。`,
    c => `${c.visual}照亮${c.material}与潮湿表面的交界，中央出现${c.detail}。`,
    c => `${c.object}只露出一角，其余被${c.material}包住，封口处有${c.detail}。`,
    c => `俯拍一块${c.material}，表面${c.state}，细节从中心向外变淡。`,
    c => `${c.container}内壁呈${c.material}质感，水汽聚成${c.detail}，背景保持干净。`,
    c => `把${c.detail}排列成规则网格，嵌在${c.material}表面，使用平坦冷光。`,
    c => `${c.material}被反复折叠，凸起处发亮，凹处保留${c.detail}。`
  ],
  concept: [
    c => `${c.space}中呈现“${c.concept}”：${c.object}保持${c.state}，环境使用${c.visual}。`,
    c => `用${c.object}、空白地面和${c.visual}构成${c.concept}的静物场景。`,
    c => `${c.scale}的${c.object}在${c.space}中${c.relation}，表达${c.concept}。`,
    c => `${c.concept}被处理成具体画面：一件${c.object}、一道窄光和清晰使用痕迹。`,
    c => `围绕${c.concept}布置${c.object}，整体${c.state}，不出现人物。`,
    c => `${c.object}留在${c.space}中央，${c.visual}缓慢变暗，形成${c.concept}的气氛。`,
    c => `把${c.concept}压缩成一个近景：${c.object}表面、折痕、灰尘和低饱和光线。`,
    c => `${c.space}里重复出现${c.object}，数量${c.scale}，画面指向${c.concept}。`,
    c => `一个${c.object}与自己的倒影${c.relation}，用简单构图表现${c.concept}。`,
    c => `${c.visual}只照亮${c.object}的一半，其余藏进${c.space}，保持${c.concept}的安静感。`
  ],
  organic: [
    c => `${c.organic}从${c.space}地面${c.action}，数量达到${c.scale}，被${c.visual}照亮。`,
    c => `${c.space}里生长着${c.organic}，枝叶${c.relation}，近处可见${c.detail}。`,
    c => `${c.organic}沿${c.space}墙面扩散，密度逐渐增加，阴影保持清晰。`,
    c => `${c.scale}的${c.organic}填满${c.space}，只留出原有通道和门框。`,
    c => `${c.visual}穿过${c.organic}，在${c.space}地面形成重复斑点。`,
    c => `${c.organic}从排水口和接缝中${c.action}，表面带着${c.detail}。`,
    c => `把${c.organic}放大到家具尺度，置于${c.space}中央，边缘轻微卷曲。`,
    c => `${c.space}保持日常照明，${c.organic}与固定设施${c.relation}。`,
    c => `${c.organic}被透明薄膜覆盖，仍在${c.action}，水汽凝在薄膜内侧。`,
    c => `俯视${c.space}，${c.organic}从一个角落向外扩散，范围为${c.scale}。`
  ],
  fragment: [
    c => `记录“${c.observation}”，并放大${c.detail}、${c.material}与${c.visual}的交界。`,
    c => `${c.observation}的近距离切片，表面${c.state}，背景仅保留${c.space}的颜色。`,
    c => `从侧面拍摄${c.observation}，让${c.visual}显出边缘厚度和${c.detail}。`,
    c => `${c.scale}地放大${c.observation}，使微小磨损呈现为完整地形。`,
    c => `${c.space}里的一个安静局部：${c.observation}，材质接近${c.material}。`,
    c => `画面只截取${c.observation}的一半，另一半留白，焦点位于${c.detail}。`,
    c => `把${c.observation}置于平坦冷光下，保留真实污渍、折痕和水汽。`,
    c => `${c.observation}沿画面边缘重复出现，密度从左到右逐渐降低。`,
    c => `微距观察${c.observation}，${c.material}表面反射出一小块${c.visual}。`,
    c => `${c.observation}保持原样，周围加入${c.scale}的空白和一条清晰阴影。`
  ]
};

const EXPANDED_ENDINGS = [
  c => `构图以正面或轻微俯视为主，保留大面积浅色留白；重点呈现${c.detail}、材质厚度与真实使用痕迹。`,
  c => `使用克制的低饱和色彩和${c.visual}，让近处纹理清楚、远处空间安静，不增加文字或人物。`,
  c => `画面强调${c.scale}的尺度对比、${c.relation}的空间关系，以及潮湿表面上细碎但不过曝的反光。`,
  c => `保持日常环境可信，镜头关注边缘、接缝、折痕与透明层次，气氛接近安静的编辑摄影。`
];

export function buildSentence(words, recipe, mode = 'short') {
  const c = context(words);
  const templates = SHORT_TEMPLATES[recipe?.sentence] || SHORT_TEMPLATES.physical;
  const short = choose(templates)(c);
  return mode === 'expanded' ? `${short}${choose(EXPANDED_ENDINGS)(c)}` : short;
}

export const templateCount = Object.values(SHORT_TEMPLATES).reduce((sum, templates) => sum + templates.length, 0);
