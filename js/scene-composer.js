import {getOperation} from '../data/visual-operations.js';
import {normalizeWord,isPhysicalSubject} from './semantic-layer.js';
import {validateScenePlan} from './scene-validator.js';

const text=x=>x?.text||'';
const byRole=(words,role)=>words.find(word=>word.sceneRole===role);
const targetSurface=subject=>`${text(subject)}表面`;
const builders={
  WRONG_CONTENTS:(s,a)=>({target:`${text(s)}内部`,transformation:`让${text(a)}替代正常内容物`,relation:`${text(a)}被放入${text(s)}内部，并在其中漂浮、堆积或占据原本内容物的位置`} ),
  SURFACE_TRANSFER:(s,a)=>({target:targetSurface(s),transformation:`将${text(a)}的表面现象转移到${text(s)}`,relation:`${text(a)}从原来的载体转移到${text(s)}表面，并沿其轮廓连续附着`} ),
  STRUCTURE_REPLACEMENT:(s,a)=>({target:`${text(s)}的外部结构`,transformation:`用${text(a)}的结构替换${text(s)}原有结构`,relation:`${text(s)}保持原有身份，但原本的外部结构被替换成${text(a)}式的硬质构造`} ),
  MATERIAL_DISGUISE:(s,a)=>({target:`${text(s)}的原有材质`,transformation:`将${text(s)}的材质变为${text(a)}`,relation:`${text(s)}保留原有轮廓，原本材质却逐渐变为${text(a)}`} ),
  SCALE_SHIFT:(s,a,p)=>({target:text(p.space)||`${text(s)}周围的空间`,transformation:`将${text(a)}按${text(p.scale)||'放大尺度'}处理`,relation:`${text(a)}被${text(p.scale)||'明显放大'}，并转化为${text(p.space)||text(s)}中的主体结构`} ),
  QUANTITY_OVERFLOW:(s,a,p)=>({target:`${text(s)}内部`,transformation:`大量重复${text(a)}`,relation:`${text(p.quantity)||text(p.scale)||'大量'}${text(a)}连续堆积并塞满${text(s)}内部`} ),
  SPATIAL_CLOSURE:(s,a,p)=>({target:text(p.space)||`${text(s)}周围`,transformation:`让${text(s)}执行“${text(a)}”的空间规则`,relation:`${text(p.scale)?`${text(p.scale)}的`:''}${text(s)}按照“${text(a)}”沿${text(p.space)||'空间'}四周连续排列，构成改变出入口关系的实体边界`} ),
  PARASITIC_GROWTH:(s,a,p)=>({target:`${text(s)}的${text(p.detail)||'缝隙和边缘'}`,transformation:`让${text(a)}从${text(s)}内部向外生长`,relation:`${text(a)}从${text(s)}的${text(p.detail)||'缝隙和边缘'}持续长出，而不是被摆放在旁边`} ),
  FUNCTION_REVERSAL:(s,a)=>({target:`${text(s)}的使用功能`,transformation:`让${text(s)}承担${text(a)}的功能`,relation:`${text(s)}保留原有外观，却被当作${text(a)}使用并承担其功能`} ),
  OBSERVATION_MAGNIFY:(s,a,p)=>({target:text(p.space)||text(s),transformation:`放大${text(a)}的细部结构`,relation:`${text(a)}被放大并延展到${text(p.space)||text(s)}上，成为可见的空间尺度结构`} ),
  ATTACHMENT_ERROR:(s,a)=>({target:targetSurface(s),transformation:`让${text(a)}异常附着到${text(s)}`,relation:`${text(a)}离开原本所属表面，转而凝结并附着在${text(s)}表面`} ),
  STILL_LIFE_COLLISION:(s,a,p)=>({target:text(s),transformation:`以具体接触关系连接${text(s)}与${text(a)}`,relation:`${text(a)}被夹在、压在或穿入${text(s)}的可见部位，构成稳定而可搭建的静物结构${p.detail?`，${text(p.detail)}保留在接触处`:''}`} )
};
const potentials=(operation,words)=>{const joined=words.map(text).join('');const still=/杯|盘|瓶|盒|包|食品|收据|表面|药片|相框/.test(joined)||['WRONG_CONTENTS','SURFACE_TRANSFER','STILL_LIFE_COLLISION'].includes(operation);const set=/房|室|走廊|阳台|墙|门|窗帘|边界|家具/.test(joined)||['SCALE_SHIFT','SPATIAL_CLOSURE','OBSERVATION_MAGNIFY'].includes(operation);const install=/重复|边界|巨大|巨型|出口|空间/.test(joined)||['QUANTITY_OVERFLOW','SPATIAL_CLOSURE'].includes(operation);return {stillLifePotential:still?'high':set?'medium':'low',setPotential:set?'high':still?'medium':'low',installationPotential:install?'high':set?'medium':'low'}};
export function composeScenePlan({operation,words,mode='odd',secondaryOperation=null,retryCount=0}){
  const normalized=words.map(normalizeWord),source=byRole(normalized,'source'),subject=byRole(normalized,'subject')||(operation==='OBSERVATION_MAGNIFY'?source:null);
  const optionals=Object.fromEntries(['space','visual','detail','scale','quantity','rule'].map(role=>[role,byRole(normalized,role)]));
  const directed=(builders[operation]||builders.WRONG_CONTENTS)(subject,source,optionals);
  let secondary=null;
  if(mode==='wild'&&secondaryOperation&&optionals.detail){secondary={operation:secondaryOperation,source:optionals.detail,target:targetSurface(subject),transformation:`将${text(optionals.detail)}转移到${text(subject)}表面`,relation:`${text(optionals.detail)}同时覆盖${text(subject)}的连续表面结构`};}
  const plan={operation,operationLabel:getOperation(operation).label,subject,secondaryElement:source,anomalySource:source,target:directed.target,action:directed.transformation,transformation:directed.transformation,relation:directed.relation,space:optionals.space||null,visual:optionals.visual||null,detail:optionals.detail||null,scale:optionals.scale||null,quantity:optionals.quantity||null,spatialRule:optionals.rule||null,secondaryOperation:secondary,mode,ingredients:normalized,usedWordIds:normalized.map(w=>w.id),reasoningTags:['directed-source-target','operation-first'],physicalCompatibility:'rule-based',pictureability:'high',retryCount,...potentials(operation,normalized)};
  plan.validation=validateScenePlan(plan);return plan;
}
