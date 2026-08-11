const operation=(id,label,subjects,sources,optional=[],near=true)=>({id,label,subjects,sources,optional,near});
const PHYSICAL=['object','container','living','organic'];

export const VISUAL_OPERATIONS=[
  operation('WRONG_CONTENTS','错误内容物',['container'],['object','organic','material'],['space','visual','detail','quantity']),
  operation('SURFACE_TRANSFER','表面转移',PHYSICAL,['observation','detail'],['space','visual'],true),
  operation('STRUCTURE_REPLACEMENT','结构替换',PHYSICAL,['object','container','observation','detail'],['space','visual'],true),
  operation('MATERIAL_DISGUISE','材质置换',PHYSICAL,['material','organic'],['space','visual','detail'],true),
  operation('SCALE_SHIFT','尺度错置',PHYSICAL,['observation','detail','object'],['space','visual','scale'],false),
  operation('QUANTITY_OVERFLOW','数量失控',['container'],['object','container','organic'],['quantity','scale','visual'],false),
  operation('SPATIAL_CLOSURE','空间围合',['object','container'],['concept','relation'],['space','scale','visual','detail'],false),
  operation('PARASITIC_GROWTH','寄生生长',PHYSICAL,['organic','living'],['detail','space','visual'],true),
  operation('FUNCTION_REVERSAL','功能反转',PHYSICAL,['object','container','concept'],['space','visual'],false),
  operation('OBSERVATION_MAGNIFY','观察碎片放大',['space'],['observation'],['scale','visual'],false),
  operation('ATTACHMENT_ERROR','错误附着',PHYSICAL,['observation','detail','organic'],['space','visual'],true),
  operation('STILL_LIFE_COLLISION','静物碰撞',PHYSICAL,['object','container','living','organic'],['detail','visual','space'],true)
];

export const getOperation=id=>VISUAL_OPERATIONS.find(item=>item.id===id)||VISUAL_OPERATIONS[0];
export const OPERATION_LABELS=Object.fromEntries(VISUAL_OPERATIONS.map(item=>[item.id,item.label]));
