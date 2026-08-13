// Deliberately small: taxonomy belongs in base data; overrides only add physical nuance.
export const SEMANTIC_OVERRIDES={
  '鱼缸':{roles:['subject','container'],domain:'domestic',physicalTraits:['transparent','hollow'],compatibleRelations:['inside_relation','fill_relation']},
  '板装药片':{roles:['subject','anomaly'],domain:'medical',physicalTraits:['rigid','modular']},
  '旧收据':{roles:['subject','anomaly'],domain:'paper'},'塑料雨衣':{roles:['subject','anomaly'],domain:'clothing'},'橡胶手套':{roles:['subject','anomaly'],domain:'medical'},'石膏像':{roles:['subject'],domain:'sculpture'},'苔藓':{roles:['subject','anomaly','organic'],domain:'organic'},'蘑菇':{roles:['subject','anomaly','organic'],domain:'organic'},'拉链':{roles:['subject','anomaly'],domain:'hardware'},
  '冷凝水':{roles:['material','surface_source','phenomenon','anomaly'],domain:'water'},'残胶':{roles:['material','surface_source','anomaly'],domain:'residue'},'石膏':{roles:['material','anomaly'],domain:'mineral'},'玻璃':{roles:['material','anomaly'],domain:'glass'},'水':{roles:['material','anomaly'],domain:'water'},'纱布':{roles:['material','anomaly'],domain:'medical'},
  '浴室':{roles:['space'],domain:'domestic'},'便利店':{roles:['space'],domain:'retail'},'办公室':{roles:['space'],domain:'work'},'阳台':{roles:['space'],domain:'domestic'},'巨型化':{roles:['scale'],domain:'scale'},'无限重复':{roles:['scale'],domain:'scale'},'冷白顶光':{roles:['visual'],domain:'light'},'冷白漫射光':{roles:['visual'],domain:'light'},'银色高光':{roles:['visual'],domain:'light'}
};
