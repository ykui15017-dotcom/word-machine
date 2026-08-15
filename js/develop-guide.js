import {normalizeIngredient} from './ingredient-composer.js';

const ROLE_LABELS={
  subject:'SUBJECT',setting:'SCENE',container:'CONTAINER',placement:'PLACEMENT',
  path:'PATH',secondary_action:'ACTION',result:'RESULT',modifier_state:'STATE',
  light:'LIGHT',perspective:'VIEWPOINT',visual_detail:'VISUAL'
};

const quote=value=>value?`「${value}」`:'';
const first=(groups,...roles)=>roles.map(role=>groups[role]?.[0]?.text).find(Boolean);

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
  const light=first(groups,'light');
  const visual=first(groups,'visual_detail');
  const hasMotion=Boolean(action||path||relation);

  if(!subject)prompts.push({label:'SUBJECT',text:'先决定画面真正需要被看见的核心元素。'});
  if(!scene&&!container)prompts.push({label:'SPACE',text:subject?`${quote(subject)}处于什么样的空间或背景中？`:'这个核心元素处于什么样的空间或背景中？'});
  else if(container&&!scene)prompts.push({label:'SPACE',text:`${quote(subject||container)}与${quote(container)}的关系需要放在怎样的空间或背景中？`});
  if(container&&subject&&!scene&&!prompts.length)prompts.push({label:'FRAMING',text:`镜头更需要强调${quote(subject)}本身，还是它与${quote(container)}之间的关系？`});
  if(hasMotion&&(scene||groups.perspective?.length)&&!(scene&&light&&!groups.perspective?.length))prompts.push({label:'MOMENT',text:`怎样让${quote(action||path||relation)}在一个静止画面里被清楚看懂？`});
  if(!groups.perspective?.length)prompts.push({label:'CAMERA',text:subject?`镜头应该从什么高度和距离观察${quote(subject)}？`:'镜头应该从什么高度和距离观察这一关系？'});
  if(!light&&!visual)prompts.push({label:'LIGHT',text:'什么样的光线最能让主体、材质和接触关系被看清？'});

  const structurallyRich=Boolean(subject&&(scene||container)&&hasMotion&&(light||visual));
  if(structurallyRich){
    if(!groups.perspective?.length){
      const camera=prompts.find(prompt=>prompt.label==='CAMERA');
      prompts.length=0;
      prompts.push(camera);
    }
    prompts.push({label:'COMPOSITION',text:'动作最关键的瞬间应该位于画面中央，还是让它向画面外继续发展？'});
    prompts.push({label:'FOCUS',text:(light||visual)?`在${quote(light||visual)}下，哪个接触位置或动作节点必须最清楚？`:'这一组元素里，哪个接触位置或动作节点必须最清楚？'});
  }else if(groups.perspective?.length&&prompts.length<2){
    prompts.push({label:'COMPOSITION',text:'最重要的关系应该位于画面中央，还是偏离中心？'});
  }
  return prompts.slice(0,4);
}

function stillLife(groups){
  const prompts=[];
  const subject=first(groups,'subject')||'主体';
  const action=first(groups,'secondary_action');
  const path=first(groups,'path');
  const result=first(groups,'result');
  const state=first(groups,'modifier_state');
  const material=first(groups,'material');
  const light=first(groups,'light','visual_detail');
  if(path)prompts.push({label:'PHYSICAL PATH',text:`现实搭建时，怎样让${quote(subject)}沿${quote(path)}发生，同时隐藏辅助结构？`});
  if(action)prompts.push({label:'FREEZE THE ACTION',text:`怎样让${quote(action)}停留在一个可拍摄、容易被镜头理解的瞬间？`});
  if(result)prompts.push({label:'FINAL STATE',text:`需要真实制作什么状态，才能让${quote(result)}被镜头看见？`});
  if(state||material)prompts.push({label:'MATERIAL TEST',text:`怎样通过真实材料表现${quote(state||material)}，而不是只依赖后期？`});
  else prompts.push({label:'MATERIAL',text:'哪些元素可以直接成为真实道具，哪些需要替代材料？'});
  if((path||action)&&prompts.length<3)prompts.push({label:'SUPPORT',text:'需要哪些隐藏支撑或固定方式，才能保持画面自然？'});
  if(light)prompts.push({label:'SHOOT',text:`拍摄时怎样保留${quote(light)}，同时让主体关系保持清楚？`});
  else prompts.push({label:'LIGHT',text:'什么样的光线最能证明材料、接触位置和真实痕迹？'});
  return prompts.slice(0,4);
}

function setDesign(groups){
  const prompts=[];
  const subject=first(groups,'subject')||'主体';
  const scene=first(groups,'setting');
  const container=first(groups,'container');
  const movement=first(groups,'path','secondary_action');
  const state=first(groups,'modifier_state','material');
  const light=first(groups,'light');
  if(scene)prompts.push({label:'OCCUPY THE SPACE',text:`${quote(subject)}在${quote(scene)}里占据多大范围？`});
  else prompts.push({label:'SPACE',text:'这个关系应该发生在怎样的空间尺度中？'});
  if(movement)prompts.push({label:'EXTEND THE ACTION',text:`${quote(movement)}放大到空间尺度后，应该延伸多远？`});
  if(container)prompts.push({label:'SCALE',text:`${quote(container)}仍然保持物体尺度，还是成为能够包围人的空间结构？`});
  else prompts.push({label:'SCALE',text:'哪个元素最值得被放大、重复或占据整个空间？'});
  if(state)prompts.push({label:'BUILD',text:`用什么真实材料才能在大尺度下保持${quote(state)}？`});
  if(light)prompts.push({label:'LIGHT AS SPACE',text:`怎样让${quote(light)}成为空间结构的一部分，而不只是照明？`});
  return prompts.slice(0,4);
}

export function buildDevelopGuide(ingredients=[],mode='ai-image'){
  const {groups,known}=understand(ingredients);
  const builders={'ai-image':aiImage,'still-life':stillLife,'set-design':setDesign};
  return {known,prompts:(builders[mode]||aiImage)(groups)};
}
