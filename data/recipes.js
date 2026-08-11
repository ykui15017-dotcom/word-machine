const skeleton=(id,label,required,optional,sentence,weight=1)=>({
  id,label,required,optional,sentence,weight,
  // Kept for old consumers and saved data; generation no longer uses category slots.
  coreSlots:required.map(slot=>slot.role),optionalSlots:optional.map(slot=>slot.role),
  slots:[...new Set([...required,...optional].flatMap(slot=>slot.categories||[]))]
});
const slot=(role,accepts,categories=[])=>({role,accepts,categories});
const subject=slot('subject',['subject'],['object','container','living','organic']);
const relation=(kind='relation')=>slot('relation',['relation',kind],['action','relation','state']);

export const RECIPES=[
  skeleton('wrong_contents','错误内容物',[slot('subject',['container','subject'],['container']),slot('anomaly',['anomaly'],['object','organic','material']),relation('inside_relation')],[slot('space',['space'],['space']),slot('visual',['visual'],['visual']),slot('detail',['detail','surface_source'],['detail','observation']),slot('scale',['scale'],['scale'])],'wrong_contents'),
  skeleton('structure_replacement','结构替换',[subject,slot('detail',['detail','structure_source'],['detail','observation']),slot('anomaly',['anomaly','subject'],['object','organic','material']),relation('replacement_relation')],[slot('visual',['visual'],['visual']),slot('space',['space'],['space'])],'structure_replacement'),
  skeleton('organic_invasion','有机侵入',[subject,slot('anomaly',['organic','anomaly'],['organic','living']),relation('invasion_relation')],[slot('space',['space'],['space']),slot('visual',['visual'],['visual']),slot('detail',['detail'],['detail'])],'organic_invasion'),
  skeleton('surface_transfer','表面转移',[subject,slot('anomaly',['surface_source','observation_source','detail','anomaly_source'],['observation','detail']),relation('transfer_relation')],[slot('space',['space'],['space']),slot('visual',['visual'],['visual']),slot('detail',['detail'],['detail'])],'surface_transfer'),
  skeleton('scale_anomaly','尺度失控',[subject,slot('scale',['scale'],['scale']),relation('scale_relation')],[slot('space',['space'],['space']),slot('visual',['visual'],['visual']),slot('detail',['detail','observation_source'],['detail','observation'])],'scale_anomaly'),
  skeleton('function_misplacement','功能错置',[subject,slot('anomaly',['concept','anomaly_rule','anomaly'],['concept','state']),relation('mechanism')],[slot('visual',['visual'],['visual']),slot('space',['space'],['space'])],'function_misplacement'),
  skeleton('space_closure','空间封闭',[slot('space',['space'],['space']),subject,slot('concept',['concept','anomaly_rule'],['concept']),relation('spatial_relation')],[slot('visual',['visual'],['visual']),slot('detail',['detail'],['detail']),slot('scale',['scale'],['scale'])],'space_closure'),
  skeleton('wrong_attachment','错误附着',[subject,slot('anomaly',['surface_source','phenomenon','detail','anomaly'],['detail','observation','organic']),relation('attachment_relation')],[slot('space',['space'],['space']),slot('visual',['visual'],['visual'])],'wrong_attachment'),
  skeleton('quantity_anomaly','数量异常',[subject,slot('anomaly',['subject','anomaly'],['object','container','living','organic']),slot('scale',['scale'],['scale']),relation('fill_relation')],[slot('space',['space'],['space']),slot('visual',['visual'],['visual'])],'quantity_anomaly'),
  skeleton('material_illusion','材料错觉',[subject,slot('anomaly',['material','anomaly'],['material','organic']),relation('transformation_relation')],[slot('visual',['visual'],['visual']),slot('detail',['detail'],['detail']),slot('space',['space'],['space'])],'material_illusion'),
  skeleton('observation_magnify','观察碎片放大',[slot('anomaly',['observation_source','structure_source','surface_source'],['observation']),subject,relation('transfer_relation')],[slot('scale',['scale'],['scale']),slot('space',['space'],['space']),slot('visual',['visual'],['visual'])],'observation_magnify'),
  skeleton('still_life_collision','静物错位拼接',[subject,slot('anomaly',['subject','anomaly'],['object','container','living','organic']),relation('physical_relation')],[slot('detail',['detail','observation_source'],['detail','observation']),slot('visual',['visual'],['visual']),slot('space',['space'],['space'])],'still_life_collision')
];

export const LEGACY_RECIPE_MAP={physical_anomaly:'structure_replacement',wrong_space:'space_closure',two_worlds:'still_life_collision',too_many:'quantity_anomaly',full_scene:'still_life_collision',living_material:'material_illusion',observation_echo:'observation_magnify',concept_stage:'space_closure',surface_study:'surface_transfer',contained_life:'organic_invasion',light_measure:'still_life_collision'};
export function resolveRecipe(id){const resolved=LEGACY_RECIPE_MAP[id]||id;return RECIPES.find(recipe=>recipe.id===resolved)||RECIPES[0]}
