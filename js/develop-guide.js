import {normalizeIngredient} from './ingredient-composer.js';

const ROLE_LABELS={
  subject:'SUBJECT',setting:'SCENE',container:'CONTAINER',placement:'PLACEMENT',
  path:'PATH',secondary_action:'ACTION',result:'RESULT',modifier_state:'STATE',
  light:'LIGHT',perspective:'VIEWPOINT',visual_detail:'VISUAL'
};

const quote=value=>value?`「${value}」`:'';
const first=(groups,...roles)=>roles.map(role=>groups[role]?.[0]?.text).find(Boolean);
const add=(prompts,label,text)=>prompts.push({label,text});
const finish=prompts=>prompts.slice(0,7);

function understand(ingredients){
  const groups={};
  const known=[];
  for(const ingredient of ingredients){
    const item=normalizeIngredient(ingredient);
    const role=item.finalRole;
    const isMaterial=(item.sourceCategory||item.category)==='material';
    const label=isMaterial?'MATERIAL':ROLE_LABELS[role];
    if(!groups[role])groups[role]=[];
    groups[role].push(item);
    if(isMaterial){
      if(!groups.material)groups.material=[];
      groups.material.push(item);
    }
    if(label)known.push({role:label,text:item.text});
  }
  return {groups,known};
}

function aiImage(groups){
  const prompts=[];
  const subject=first(groups,'subject');
  const scene=first(groups,'setting');
  const container=first(groups,'container');
  const action=first(groups,'secondary_action');
  const path=first(groups,'path');
  const relation=first(groups,'placement','relation');
  const result=first(groups,'result');
  const state=first(groups,'modifier_state');
  const light=first(groups,'light');
  const viewpoint=first(groups,'perspective');
  const visual=first(groups,'visual_detail');
  const core=subject||container||'当前关系';

  if(viewpoint)add(prompts,'VIEWPOINT',`${quote(viewpoint)}应该更靠近${quote(core)}，还是保留能看清整体关系的距离？`);
  else add(prompts,'CAMERA',`镜头应该从什么高度和距离观察${quote(core)}？`);
  if(scene)add(prompts,'DEPTH',`${quote(core)}在${quote(scene)}中应该贴近前景、停在中景，还是让关系延伸到背景？`);
  else add(prompts,'BACKGROUND',`${quote(core)}需要什么样的背景，才能让当前关系被看清？`);
  if(action||path||result)add(prompts,'MOMENT',`${quote(action||path||result)}最关键的瞬间在哪里停止，才能让动作方向最清楚？`);
  else add(prompts,'COMPOSITION',`${quote(core)}应该居中、偏离中心，还是向画面外延续？`);
  if(light)add(prompts,'LIGHT TREATMENT',`在${quote(light)}下，应该重点强调轮廓、材质还是接触位置？`);
  else add(prompts,'LIGHT',`什么样的光线最适合表现${quote(action||relation||core)}？`);
  if(visual)add(prompts,'DENSITY',`${quote(visual)}应该主要体现在数量、间距还是前后层次？`);
  else if(state)add(prompts,'MATERIAL VISIBILITY',`怎样让${quote(state)}同时体现在${quote(core)}的边缘、表面和接触位置？`);
  else add(prompts,'FOCUS',`${quote(core)}的哪个接触位置或层次必须最清楚？`);
  if(container)add(prompts,'FRAMING',`画面边界应该保留完整的${quote(container)}，还是裁切它以放大与${quote(core)}的关系？`);
  else if(relation)add(prompts,'NEGATIVE SPACE',`${quote(relation)}周围要留出多少空间，才不会让关系变得含糊？`);
  else if(prompts.length<6)add(prompts,'FRAMING',`画面边界应紧贴${quote(core)}，还是保留更多环境信息？`);
  return finish(prompts);
}

function stillLife(groups){
  const prompts=[];
  const subject=first(groups,'subject')||'主体';
  const action=first(groups,'secondary_action');
  const path=first(groups,'path');
  const result=first(groups,'result');
  const state=first(groups,'modifier_state');
  const material=first(groups,'material');
  const scene=first(groups,'setting');
  const container=first(groups,'container');
  const light=first(groups,'light');
  const visual=first(groups,'visual_detail');
  add(prompts,material||state?'MATERIAL TEST':'REAL MATERIAL',material||state?`哪种真实材料测试最能稳定表现${quote(material||state)}，又不显得是后期效果？`:`${quote(subject)}用什么真实材料或替代物制作，才能承受拍摄？`);
  if(path)add(prompts,'PHYSICAL PATH',`现实搭建时，怎样让${quote(subject)}沿${quote(path)}发生，同时隐藏辅助结构？`);
  else add(prompts,'SURFACE',`${quote(subject)}需要什么表面来承接、摩擦或留下痕迹？`);
  if(action)add(prompts,'FREEZE THE ACTION',`怎样让${quote(action)}停留在可拍摄、且方向最清楚的瞬间？`);
  else add(prompts,'STABILITY',`怎样固定${quote(subject)}，让它在拍摄期间维持当前关系？`);
  if(container||path||action)add(prompts,'SUPPORT',`${quote(container||subject)}需要哪些隐藏支撑、固定点或重量平衡？`);
  if(result||visual)add(prompts,'TRACE',`${quote(result||visual)}要靠残留物、表面变化还是数量分布留在现场？`);
  else add(prompts,'SHOOT',`哪个拍摄角度最能证明${quote(subject)}是真实搭建的？`);
  if(light)add(prompts,'LIGHT',`拍摄时怎样保留${quote(light)}，同时让材料、支撑和痕迹可辨？`);
  else add(prompts,'LIGHT',`什么样的光线最能证明${quote(subject)}的材料、接触位置和真实痕迹？`);
  if(scene)add(prompts,'PRACTICAL RISK',`在${quote(scene)}内实拍时，最可能失控的是材料、动作还是现场保护？`);
  return finish(prompts);
}

function setDesign(groups){
  const prompts=[];
  const subject=first(groups,'subject')||'主体';
  const scene=first(groups,'setting');
  const container=first(groups,'container');
  const movement=first(groups,'path','secondary_action');
  const action=first(groups,'secondary_action');
  const state=first(groups,'modifier_state','material');
  const visual=first(groups,'visual_detail');
  const light=first(groups,'light');
  if(scene)add(prompts,'OCCUPY THE SPACE',`${quote(subject)}应该只占据${quote(scene)}的局部，还是逐渐改变整个空间？`);
  else add(prompts,'SPACE',`当前关系应该被放大到房间、通道，还是更开放的空间尺度？`);
  if(movement)add(prompts,'EXTEND THE ACTION',`${quote(movement)}放大到空间尺度后，应该从哪里开始、经过哪里并延伸多远？`);
  else add(prompts,'ROUTE',`观众应该沿什么路线逐步看懂${quote(subject)}与空间的关系？`);
  add(prompts,'SCALE',container?`${quote(container)}应该保持物体尺度，还是成为能包围观众的空间结构？`:`${quote(subject)}放大到什么尺度后，仍然能被辨认而不只是装饰？`);
  if(visual)add(prompts,'DENSITY',`${quote(visual)}应该主要发生在数量、间距，还是空间前后层次？`);
  else add(prompts,'REPETITION',`${quote(subject)}需要重复多少次、以什么间距分布，才能改变空间？`);
  if(state)add(prompts,'MATERIAL',`哪种真实材料能在大尺度下保持${quote(state)}，并承受结构重量？`);
  else add(prompts,'BUILD',`${quote(subject)}应该被拆成哪些可制作、运输和现场组装的部件？`);
  if(light)add(prompts,'LIGHT AS SPACE',`怎样让${quote(light)}界定路线、深度或边界，而不只是照明？`);
  else add(prompts,'VIEWER POSITION',`观众应该站在${quote(subject)}之内、之间，还是从外部观看它？`);
  if(action)add(prompts,'FRAME / BEYOND FRAME',`${quote(action)}应该在可见边界内结束，还是暗示它会继续到空间之外？`);
  return finish(prompts);
}

export function buildDevelopGuide(ingredients=[],mode='ai-image'){
  const {groups,known}=understand(ingredients);
  const builders={'ai-image':aiImage,'still-life':stillLife,'set-design':setDesign};
  return {known,prompts:(builders[mode]||aiImage)(groups)};
}
