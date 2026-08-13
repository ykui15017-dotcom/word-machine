/**
 * A deliberately small homepage pool.  The full word bank remains available
 * for browsing; only concrete, photographable ingredients belong here.
 */
export const RANDOM_POOL = [
  {id:'pool_cart',text:'生锈购物车',category:'object',role:'subject',randomEligible:true},
  {id:'pool_box',text:'被雨打湿的纸箱',category:'object',role:'subject',randomEligible:true},
  {id:'pool_raincoat',text:'透明塑料雨衣',category:'object',role:'subject',randomEligible:true},
  {id:'pool_lisianthus',text:'紫色洋桔梗',category:'life',role:'subject',randomEligible:true},
  {id:'pool_goldfish',text:'玻璃缸里的金鱼',category:'life',role:'subject',randomEligible:true},
  {id:'pool_supermarket',text:'超市花卉区',category:'space',role:'space',randomEligible:true},
  {id:'pool_underpass',text:'积水的地下通道',category:'space',role:'space',randomEligible:true},
  {id:'pool_greenhouse',text:'狭窄的温室走道',category:'space',role:'space',randomEligible:true},
  {id:'pool_window',text:'雨后的商店橱窗',category:'space',role:'space',randomEligible:true},
  {id:'pool_fogged',text:'表面起雾',category:'state',role:'condition',randomEligible:true},
  {id:'pool_submerged',text:'半浸在水里',category:'state',role:'condition',randomEligible:true},
  {id:'pool_rust',text:'布满橙红锈迹',category:'state',role:'condition',randomEligible:true},
  {id:'pool_film',text:'覆盖透明塑料膜',category:'material',role:'condition',randomEligible:true},
  {id:'pool_through',text:'穿过',category:'relation',role:'relation',randomEligible:true},
  {id:'pool_wrap',text:'缠绕',category:'relation',role:'relation',randomEligible:true},
  {id:'pool_suspend',text:'悬挂在上方',category:'relation',role:'relation',randomEligible:true},
  {id:'pool_spill',text:'从缝隙向外流淌',category:'action',role:'relation',randomEligible:true},
  {id:'pool_eye_level',text:'与主体平齐',category:'visual',role:'view',randomEligible:true,viewKind:'view'},
  {id:'pool_flower_level',text:'与花平齐',category:'visual',role:'view',randomEligible:true,viewKind:'view'},
  {id:'pool_toplight',text:'冷白顶光',category:'visual',role:'view',randomEligible:true,viewKind:'light'},
  {id:'pool_diffuse',text:'自然散射光',category:'visual',role:'view',randomEligible:true,viewKind:'light'},

  // Kept as an explicit quarantine list so abstract phrases cannot silently
  // drift back into homepage random selection during future corpus updates.
  {id:'nonrandom_wrong_delivery',text:'错误投递',category:'state',role:'condition',randomEligible:false},
  {id:'nonrandom_trace',text:'无法解释的痕迹',category:'state',role:'condition',randomEligible:false},
  {id:'nonrandom_order',text:'临时秩序',category:'state',role:'condition',randomEligible:false},
  {id:'nonrandom_mutation',text:'日常病变',category:'state',role:'condition',randomEligible:false}
];

export const ELIGIBLE_RANDOM_WORDS = RANDOM_POOL.filter(word=>word.randomEligible);
export const NON_RANDOM_WORDS = RANDOM_POOL.filter(word=>!word.randomEligible);
