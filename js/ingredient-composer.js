const joinWords=words=>words.length<2?words[0]||'':words.length===2?`${words[0]}与${words[1]}`:`${words.slice(0,-1).join('、')}，以及${words.at(-1)}`;

/** Compose with exactly the ingredients supplied by the visitor. */
export function composeIngredientText(ingredients,variation=0){
  const words=ingredients.map(item=>item.text.trim()).filter(Boolean);
  if(!words.length)return '';
  if(words.length===1){
    const templates=[
      word=>`让「${word}」成为画面的中心：先观察它最安静的轮廓，再让一个细节偏离日常。`,
      word=>`把「${word}」留在空白中央，改变观看它的距离，让熟悉之物显露出另一种尺度。`,
      word=>`从「${word}」出发，不添加新的物件；只调整光线与位置，让它自己讲完这个画面。`
    ];
    return templates[variation%templates.length](words[0]);
  }
  const subject=words[0],rest=joinWords(words.slice(1));
  const templates=[
    ()=>`让「${subject}」成为画面的起点，使${rest}沿着它的边缘逐渐出现，像一条刚被发现的视觉线索。`,
    ()=>`把「${subject}」放在安静的近景里；${rest}从不同方向靠近，共同改变它原本的尺度与意义。`,
    ()=>`先保留「${subject}」的日常形态，再让${rest}依次介入：不解释相遇，只记录它们留下的空间关系。`,
    ()=>`以「${subject}」建立构图，把${rest}处理成同一场景里的回声，让彼此的材质、距离和节奏发生联系。`
  ];
  return templates[variation%templates.length]();
}
