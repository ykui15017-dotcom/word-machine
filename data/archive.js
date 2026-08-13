/** Review queue. The full legacy modules remain in git for line-by-line review;
 * this manifest explains why representative non-core entries were downgraded. */
export const ARCHIVE=[
  ['牙医','standalone occupation has weak visual specificity'],['药剂师','standalone occupation has weak visual specificity'],['体育老师','catalogue-like occupation'],['面包师','catalogue-like occupation'],['收银员','catalogue-like occupation'],
  ['诊室','room-name catalogue'],['候诊室','room-name catalogue'],['输液室','room-name catalogue'],['药房','room-name catalogue'],['康复室','room-name catalogue'],
  ['汤锅','merged into representative 锅/汤锅 set'],['奶锅','near-duplicate cookware'],['炒锅','near-duplicate cookware'],['资料袋','near-duplicate document bag'],['试卷袋','near-duplicate document bag'],
  ['等待被取走','insufficient as a scene-wide rule'],['重复的一天','abstract and weakly visual'],['剩余的一点','ambiguous fragment'],['无法解释的痕迹','requires a concrete carrier'],['临时编号','better used as a detail tag']
].map(([text,reason],index)=>({id:`archive_v2_${index+1}`,text,disposition:'ARCHIVE',reason}));
