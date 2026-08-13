const operation=(id,label,subjects,sources,optional=[],near=true)=>({id,label,subjects,sources,optional,near});
const PHYSICAL=['object','container','life','organic_matter'];

export const VISUAL_OPERATIONS=[
  operation('WRONG_CONTENTS','错误内容物',['container'],['object','organic_matter','material'],['space','visual','scale']),
  operation('SURFACE_TRANSFER','表面转移',PHYSICAL,['material','organic_matter'],['space','visual'],true),
  operation('STRUCTURE_REPLACEMENT','结构替换',PHYSICAL,['object','container','organic_matter'],['space','visual'],true),
  operation('MATERIAL_DISGUISE','材质置换',PHYSICAL,['material','organic_matter'],['space','visual'],true),
  operation('SCALE_SHIFT','尺度错置',PHYSICAL,['organic_matter','object'],['space','visual','scale'],false),
  operation('QUANTITY_OVERFLOW','数量失控',['container'],['object','container','organic_matter'],['scale','visual'],false),
  operation('SPATIAL_CLOSURE','空间围合',['object','container'],['relation'],['space','scale','visual'],false),
  operation('PARASITIC_GROWTH','寄生生长',PHYSICAL,['organic_matter','life'],['space','visual'],true),
  operation('FUNCTION_REVERSAL','功能反转',PHYSICAL,['object','container','state'],['space','visual'],false),
  operation('OBSERVATION_MAGNIFY','观察碎片放大',['space'],['organic_matter','material'],['scale','visual'],false),
  operation('ATTACHMENT_ERROR','错误附着',PHYSICAL,['material','organic_matter'],['space','visual'],true),
  operation('STILL_LIFE_COLLISION','静物碰撞',PHYSICAL,['object','container','life','organic_matter'],['visual','space'],true)
];

export const getOperation=id=>VISUAL_OPERATIONS.find(item=>item.id===id)||VISUAL_OPERATIONS[0];
export const OPERATION_LABELS=Object.fromEntries(VISUAL_OPERATIONS.map(item=>[item.id,item.label]));
