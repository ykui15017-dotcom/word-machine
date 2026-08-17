const TEMPLATES=['beside','relation','wrap','container','float','scatter','stack','cover'];
const NOTES=['wrap','spill','float','hang','stack','drift','hold','through'];
const RELATIONS=new Set(['action','relation','state']);
const CONTAINERS=new Set(['container']);
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const pick=(items,rng)=>items[Math.floor(rng()*items.length)];
const jitter=(rng,size)=>Math.round(rng()*size);

function chooseWords(words){
  const relation=words.find(word=>RELATIONS.has(word.category));
  const container=words.find(word=>CONTAINERS.has(word.category));
  const subjects=words.filter(word=>word!==relation&&word!==container);
  return {main:subjects[0]||words[0],secondary:container||subjects[1]||words[1],relation};
}

function templateFor(chosen,rng){
  if(chosen.secondary?.category==='container')return 'container';
  if(chosen.relation)return pick(['relation','wrap','float','scatter','cover'],rng);
  return pick(['beside','float','scatter','stack'],rng);
}

function marks(type,x,y,scale,variant){
  const common=`fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  if(type==='container'||type==='spill')return `<path ${common} d="M${x-35*scale} ${y-22*scale} Q${x} ${y-32*scale} ${x+35*scale} ${y-22*scale} L${x+28*scale} ${y+28*scale} Q${x} ${y+39*scale} ${x-28*scale} ${y+28*scale}Z"/><path ${common} d="M${x-34*scale} ${y-22*scale} Q${x} ${y-10*scale} ${x+34*scale} ${y-22*scale}"/>`;
  if(type==='stack')return [0,1,2].map(i=>`<path ${common} d="M${x-35+i*7} ${y+24-i*21} q35 -13 68 0 q-34 14 -68 0Z"/>`).join('');
  if(type==='cover')return `<path ${common} d="M${x-40} ${y-22} Q${x-4} ${y-42} ${x+43} ${y-15} L${x+31} ${y+30} Q${x-4} ${y+42} ${x-42} ${y+13}Z"/><path ${common} stroke-dasharray="4 6" d="M${x-30} ${y-4} Q${x} ${y+10} ${x+34} ${y-2}"/>`;
  const points=variant%2?`${x-35},${y+20} ${x},${y-31} ${x+37},${y+18}`:`${x-35},${y} Q${x},${y-38} ${x+35},${y} Q${x},${y+38} ${x-35},${y}`;
  return `<path ${common} d="M${points}"/>`;
}

export function createDoodle(words,history=[],rng=Math.random){
  const chosen=chooseWords(words);
  let state;
  for(let attempt=0;attempt<30;attempt++){
    const type=templateFor(chosen,rng),variant=jitter(rng,9999),align=pick([-34,0,34],rng);
    const note=chosen.relation?.text||pick(NOTES,rng);
    const arrow=pick(['straight','curve','wave'],rng);
    const signature=[type,variant,align,arrow,note,chosen.main?.text,chosen.secondary?.text].join('|');
    state={type,variant,align,arrow,note,signature,words:words.map(word=>word.text)};
    if(!history.includes(signature))break;
  }
  return state;
}

export function doodleSvg(state,words){
  const chosen=chooseWords(words),v=state.variant||0,x1=155+(state.align||0),x2=315+(state.align||0)/2;
  const arrow=state.arrow==='straight'?`M205 92 L270 92 l-9 -7 m9 7 l-9 8`:state.arrow==='wave'?`M205 92 q16 -18 32 0 t32 0 l-8 -8 m8 8 l-9 7`:`M205 108 Q235 55 272 88 l-10 -2 m10 2 l-5 9`;
  const decoration=v%3===0?'M72 42 q12 -9 24 0 t24 0':v%3===1?'M392 53 l7 -9 l7 9 l9 2 l-8 6 l2 10 l-10 -5 l-9 5':'M65 168 q18 12 36 0 t36 0';
  return `<svg viewBox="0 0 480 210" role="img" aria-label="${escape(chosen.main?.text)} 与 ${escape(chosen.secondary?.text||state.note)} 的规则式视觉便签"><g class="doodle-ink">
    <path class="doodle-faint" d="${decoration}"/>
    ${marks(state.type,x1,104,1+(v%3)*.08,v)}
    ${marks(state.type==='container'?'beside':state.type,x2,112,.72,v+1)}
    <path class="doodle-arrow" d="${arrow}"/>
    <text x="${x1-44}" y="172" transform="rotate(${v%2?-3:2} ${x1} 172)">${escape(chosen.main?.text||'element')}</text>
    <text x="${x2-34}" y="177" transform="rotate(${v%3-1} ${x2} 177)">${escape(chosen.secondary?.text||'note')}</text>
    <text class="doodle-note" x="${255+(v%20)}" y="46">${escape(state.note)}</text>
    <circle class="doodle-circle" cx="${278+(v%12)}" cy="41" r="31"/>
  </g></svg>`;
}

export const DOODLE_TEMPLATE_COUNT=TEMPLATES.length;
