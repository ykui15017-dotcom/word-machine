/** A small, concrete pool for the homepage's syntax-aware random drop. */
const word=(id,text,category,sentenceRole,extra={})=>({id,text,category,sentenceRole,syntaxRole:sentenceRole,role:sentenceRole,randomEligible:true,...extra});
export const RANDOM_POOL=[
  word('pool_petals','花瓣','organic_matter','subject'),word('pool_cart','购物车','object','subject'),word('pool_bones','鱼骨','organic_matter','subject'),word('pool_pills','药片','object','subject'),
  word('pool_box','纸箱','container','container'),word('pool_bowl','玻璃碗','container','container'),word('pool_tray','托盘','container','container'),word('pool_bag','塑料袋','container','container'),word('pool_enamel','搪瓷盆','container','container'),
  word('pool_warehouse','仓库','space','setting'),word('pool_balcony','阳台','space','setting'),word('pool_kitchen','旧厨房','space','setting'),word('pool_corner','浴室角落','space','setting'),word('pool_window','窗边','space','setting'),
  word('pool_wet','被雨水打湿的','state','modifier_state'),word('pool_damp','潮湿的','state','modifier_state'),word('pool_collapsed','塌陷的','state','modifier_state'),word('pool_wrinkled','发皱的','state','modifier_state'),
  word('pool_placed','放置在','relation','placement'),word('pool_piled','堆积在','relation','placement'),word('pool_stuck','卡在','relation','placement'),word('pool_attached','贴附在','relation','placement'),
  word('pool_gap','从缝隙中','relation','path'),word('pool_edge','沿边缘','relation','path'),word('pool_opening','从箱口','relation','path'),word('pool_crack','顺着裂口','relation','path'),word('pool_bottom','从底部','relation','path'),
  word('pool_flow','流出','action','secondary_action'),word('pool_slide','滑出','action','secondary_action'),word('pool_seep','渗出','action','secondary_action'),word('pool_drop','垂落','action','secondary_action'),word('pool_scatter_action','散落','action','secondary_action'),
  word('pool_spread','散开','action','result'),word('pool_cover_floor','铺开','action','result'),word('pool_distributed','零散分布','scale','result'),word('pool_outward','向四周扩开','action','result'),word('pool_trail','形成拖尾','action','result'),
  word('pool_slowly','缓慢地','visual','visual_detail'),word('pool_uneven','疏密不均地','visual','visual_detail'),word('pool_broken','断续地','visual','visual_detail'),word('pool_messy','凌乱地','visual','visual_detail'),
  word('pool_flower_level','与花平齐','visual','perspective'),word('pool_low','低机位','visual','perspective'),word('pool_toplight','冷白顶光','visual','light'),word('pool_diffuse','自然散射光','visual','light'),
  {id:'nonrandom_wrong_delivery',text:'错误投递',category:'state',sentenceRole:'modifier_state',syntaxRole:'modifier_state',role:'modifier_state',randomEligible:false},
  {id:'nonrandom_trace',text:'无法解释的痕迹',category:'state',sentenceRole:'visual_detail',syntaxRole:'visual_detail',role:'visual_detail',randomEligible:false},
  {id:'nonrandom_order',text:'临时秩序',category:'state',sentenceRole:'visual_detail',syntaxRole:'visual_detail',role:'visual_detail',randomEligible:false},
  {id:'nonrandom_mutation',text:'日常病变',category:'state',sentenceRole:'modifier_state',syntaxRole:'modifier_state',role:'modifier_state',randomEligible:false}
];
export const ELIGIBLE_RANDOM_WORDS=RANDOM_POOL.filter(word=>word.randomEligible);
export const NON_RANDOM_WORDS=RANDOM_POOL.filter(word=>!word.randomEligible);
