const PALETTES={
  object:[12,34,46],container:[92,18,43],space:[205,22,50],life:[78,26,37],
  organic_matter:[145,18,40],material:[31,20,45],action:[25,42,48],state:[48,28,57],
  relation:[211,18,43],path:[211,18,43],visual:[326,18,57],light:[39,35,63],scale:[25,10,42]
};
const ANCHORS=[[70,62],[178,40],[302,62],[420,42],[122,140],[260,135],[390,132]];
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function stableHash(value){
  let hash=2166136261;
  for(const char of String(value)){hash^=char.codePointAt(0);hash=Math.imul(hash,16777619)}
  return hash>>>0;
}
const randomFrom=seed=>()=>((seed=Math.imul(seed^seed>>>15,1|seed),seed^=seed+Math.imul(seed^seed>>>7,61|seed),(seed^seed>>>14)>>>0)/4294967296);
const round=value=>Math.round(value*10)/10;
const categoryFor=word=>word.category==='relation'&&word.sentenceRole==='path'?'path':word.category==='visual'&&word.sentenceRole==='light'?'light':word.category;

export function colorForWord(word){
  const [baseHue,baseSaturation,baseLightness]=PALETTES[categoryFor(word)]||PALETTES.scale;
  const hash=stableHash(`${word.category}:${word.text}`);
  const hue=baseHue+(hash%13)-6;
  const saturation=baseSaturation+((hash>>>5)%7)-3;
  const lightness=baseLightness+((hash>>>9)%7)-3;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

const path=(d,extra='')=>`<path d="${d}" ${extra}/>`;
function marksFor(word,index){
  const rng=randomFrom(stableHash(`${word.category}|${word.text}`));
  const [ax,ay]=ANCHORS[index%ANCHORS.length],x=round(ax+(rng()-.5)*22),y=round(ay+(rng()-.5)*17);
  const size=round(16+rng()*16),tilt=round((rng()-.5)*12),color=colorForWord(word),kind=categoryFor(word);
  const common=`class="trace-mark trace-${kind}" style="--trace-color:${color}"`;
  let shape='';
  if(kind==='object')shape=`<rect x="${x-size}" y="${y-size*.55}" width="${size*1.7}" height="${size}" rx="${round(2+rng()*5)}" transform="rotate(${tilt} ${x} ${y})"/>${path(`M${x-size*.65} ${y+size*.7}l${size*1.15} ${-size*.12}`)}`;
  else if(kind==='container')shape=path(`M${x-size} ${y-size*.5} Q${x} ${y-size*.2} ${x+size} ${y-size*.5} L${x+size*.75} ${y+size*.65} Q${x} ${y+size} ${x-size*.75} ${y+size*.65} Z M${x-size} ${y-size*.5} Q${x} ${y-size*.85} ${x+size} ${y-size*.5}`);
  else if(kind==='space')shape=`<rect x="${x-size*1.25}" y="${y-size*.7}" width="${size*2.5}" height="${size*1.4}" rx="2"/>${path(`M${x-size*.8} ${y-size}V${y+size} M${x+size*.75} ${y-size*.9}V${y+size*.85}`,'class="trace-faint"')}`;
  else if(kind==='life'||kind==='organic_matter')shape=path(`M${x-size} ${y+size*.55} Q${x-size*.3} ${y-size*.9} ${x+size*.9} ${y-size*.4} Q${x+size*.25} ${y+size*.2} ${x-size} ${y+size*.55} M${x-size*.75} ${y+size*.4} Q${x} ${y} ${x+size*.65} ${y-size*.3}`);
  else if(kind==='material')shape=Array.from({length:5},(_,line)=>{const dx=(line-2)*size*.35;return path(`M${x+dx} ${y-size*.6+rng()*5}l${round((rng()-.5)*9)} ${size*(.75+rng()*.4)}`)}).join('');
  else if(kind==='action')shape=path(`M${x-size*1.3} ${y+size*.55} Q${x-size*.2} ${y-size} ${x+size} ${y-size*.15} l${-size*.4} ${-size*.3} M${x+size} ${y-size*.15}l${-size*.35} ${size*.42}`);
  else if(kind==='state')shape=`<ellipse cx="${x}" cy="${y}" rx="${size*1.05}" ry="${size*.72}" class="trace-dashed"/>${path(`M${x-size*1.25} ${y+size*.25}q${size*.6} ${size*.45} ${size*1.2} 0t${size*1.2} 0`,'class="trace-faint"')}`;
  else if(kind==='relation'||kind==='path')shape=path(`M${x-size*1.4} ${y-size*.25} C${x-size*.5} ${y-size} ${x+size*.1} ${y+size} ${x+size*1.35} ${y-size*.2} M${x+size*1.35} ${y-size*.2}l${-size*.38} ${-size*.2} M${x+size*1.35} ${y-size*.2}l${-size*.25} ${size*.36}`);
  else if(kind==='visual')shape=path(`M${x} ${y-size}v${size*2} M${x-size} ${y}h${size*2} M${x-size*.55} ${y-size*.55}l${size*1.1} ${size*1.1} M${x+size*.55} ${y-size*.55}l${-size*1.1} ${size*1.1}`);
  else if(kind==='light')shape=`<circle cx="${x}" cy="${y}" r="${size*.22}"/>${Array.from({length:6},(_,ray)=>{const a=ray*Math.PI/3,r1=size*.48,r2=size*(.82+rng()*.16);return path(`M${round(x+Math.cos(a)*r1)} ${round(y+Math.sin(a)*r1)}L${round(x+Math.cos(a)*r2)} ${round(y+Math.sin(a)*r2)}`)}).join('')}`;
  else shape=`<circle cx="${x-size*.6}" cy="${y}" r="${size*.28}"/><circle cx="${x+size*.45}" cy="${y}" r="${size*.62}"/>`;
  const accent=rng()>.48?`<circle class="trace-dot" cx="${round(x+size*(rng()-.5)*2.8)}" cy="${round(y+size*(rng()-.5)*2.1)}" r="${round(1.6+rng()*1.5)}"/>`:'';
  return `<g ${common} data-word="${escape(word.text)}">${shape}${accent}</g>`;
}

export function createVisualTrace(words){
  const normalized=words.slice(0,7).map(word=>({text:word.text,category:word.category,sentenceRole:word.sentenceRole}));
  const signature=normalized.map(word=>`${word.category}:${word.text}`).join('|');
  return {signature,seed:stableHash(signature),words:normalized.map(word=>word.text)};
}

export function visualTraceSvg(state,words){
  const seed=state?.seed??stableHash(words.map(word=>word.text).join('|')),rng=randomFrom(seed);
  const y=round(95+(rng()-.5)*28);
  const background=path(`M28 ${y} C130 ${round(y-18+rng()*22)} 335 ${round(y+18-rng()*22)} 452 ${round(y-5+rng()*12)}`,'class="trace-thread"');
  return `<svg viewBox="0 0 480 190" role="img" aria-label="由当前 ${words.length} 个词生成的抽象视觉痕迹"><g class="trace-field">${background}${words.slice(0,7).map(marksFor).join('')}</g></svg>`;
}

// Kept as aliases so older saved drops remain readable.
export const createDoodle=createVisualTrace;
export const doodleSvg=visualTraceSvg;
export const DOODLE_TEMPLATE_COUNT=12;
