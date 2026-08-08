// coreSlots establish the idea; optionalSlots are shuffled for every drop.
// `slots` remains the public compatibility list used by the bank and tests.
const recipe=(id,label,coreSlots,optionalSlots,sentence,weight=1)=>({id,label,coreSlots,optionalSlots,slots:[...new Set([...coreSlots,...optionalSlots])],sentence,weight});
export const RECIPES = [
  recipe('wrong_contents','错误内容物',['container'],['object','state','material','detail','concept'],'contents'),
  recipe('physical_anomaly','物理异常',['object'],['state','material','action','scale','visual','detail'],'physical'),
  recipe('wrong_space','错误空间',['space'],['object','action','visual','scale','concept'],'space'),
  recipe('two_worlds','两种世界结合',['object','organic'],['relation','material','state','visual','detail'],'relation'),
  recipe('too_many','数量失控',['scale'],['object','space','action','relation','visual','detail'],'quantity'),
  recipe('full_scene','完整场景',['space','object'],['container','state','visual','relation','scale','detail'],'scene'),
  recipe('living_material','生命换肤',['living'],['material','action','detail','state','visual','scale'],'living'),
  recipe('observation_echo','观察回声',['observation'],['object','relation','visual','material','scale','action'],'observation',.72),
  recipe('concept_stage','概念布景',['concept'],['object','space','visual','relation','state','detail'],'concept'),
  recipe('surface_study','表面研究',['detail'],['object','material','visual','scale','state','observation'],'detail',.9),
  recipe('contained_life','容器生态',['container','organic'],['living','state','relation','visual','scale'],'ecosystem'),
  recipe('light_measure','光线尺度',['visual'],['scale','space','object','material','concept','detail'],'light')
];
