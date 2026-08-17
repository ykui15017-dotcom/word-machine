const KEYS={words:'wm-my-words-v1',saved:'wm-saved-v1',machine:'wm-machine-v1',ingredients:'wm-ingredients-v3',hiddenWords:'wm-hidden-words-v1',drop:'wm-drop-v2',dropHistory:'wm-drop-history-v1'};
const read=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const LEGACY_CATEGORY={living:'life',organic:'organic_matter',detail:'material',observation:'material',concept:'state'};
const migrateWord=word=>word&&LEGACY_CATEGORY[word.category]?{...word,category:LEGACY_CATEGORY[word.category],legacyCategory:word.category}:word;
export const getMyWords=()=>read(KEYS.words).map(migrateWord);
export const addMyWord=word=>{const words=getMyWords();words.unshift(word);write(KEYS.words,words);return words};
export const removeMyWord=id=>write(KEYS.words,getMyWords().filter(w=>w.id!==id));
export const getHiddenWordIds=()=>read(KEYS.hiddenWords).filter(id=>typeof id==='string');
export const hideBaseWord=id=>{const ids=getHiddenWordIds();if(!ids.includes(id))ids.push(id);write(KEYS.hiddenWords,ids);return ids};
export const restoreHiddenWords=()=>write(KEYS.hiddenWords,[]);
export const getSaved=()=>read(KEYS.saved);
export const saveDrop=drop=>{const saved=getSaved();saved.unshift({...drop,id:`saved_${Date.now()}`,savedAt:new Date().toISOString()});write(KEYS.saved,saved);return saved};
export const removeSaved=id=>write(KEYS.saved,getSaved().filter(x=>x.id!==id));
export const getMachineState=()=>read(KEYS.machine,null);
export const setMachineState=state=>write(KEYS.machine,state);
const normalizeIngredientSource=word=>({...word,source:word.source==='random'?'random':'manual',locked:word.locked??word.source!=='random'});
export const MANUAL_INGREDIENT_LIMIT=8;
export const getIngredients=()=>read(KEYS.ingredients).map(migrateWord).map(normalizeIngredientSource);
export const setIngredients=ingredients=>write(KEYS.ingredients,ingredients.map(normalizeIngredientSource));
export const addIngredient=word=>{const ingredients=getIngredients();if(ingredients.length<MANUAL_INGREDIENT_LIMIT&&!ingredients.some(item=>item.id===word.id))ingredients.push(normalizeIngredientSource({...word,source:'manual',locked:true}));setIngredients(ingredients);return ingredients};
export const removeIngredient=id=>{const ingredients=getIngredients().filter(item=>item.id!==id);setIngredients(ingredients);return ingredients};
export const clearIngredients=()=>setIngredients([]);
export const setIngredientRole=(id,userRoleOverride)=>{const ingredients=getIngredients().map(item=>item.id===id?{...item,userRoleOverride:userRoleOverride||null}:item);setIngredients(ingredients);return ingredients};
export const toggleIngredientLock=id=>{const ingredients=getIngredients().map(item=>item.id===id?{...item,locked:!item.locked}:item);setIngredients(ingredients);return ingredients};
export const clearRandomIngredients=()=>{const ingredients=getIngredients().filter(item=>item.source!=='random');setIngredients(ingredients);return ingredients};
export const putOnMachine=word=>{sessionStorage.setItem('wm-incoming',JSON.stringify(word));location.href='./index.html'};
export const takeIncoming=()=>{try{const x=JSON.parse(sessionStorage.getItem('wm-incoming'));sessionStorage.removeItem('wm-incoming');return x}catch{return null}};

const normalizeDropWord=word=>word?{...migrateWord(word),source:word.source==='manual'?'manual':'random',locked:Boolean(word.locked||word.source==='manual')}:word;
export const getElementDrop=()=>{
  const current=read(KEYS.drop,null);
  if(Array.isArray(current)&&current.length)return current.slice(0,5).map(normalizeDropWord);
  const ingredients=getIngredients();
  if(ingredients.length)return ingredients.slice(0,5).map(normalizeDropWord);
  const legacy=getMachineState();
  return Array.isArray(legacy?.words)?legacy.words.slice(0,5).map(normalizeDropWord):[];
};
export const setElementDrop=words=>write(KEYS.drop,words.slice(0,5).map(normalizeDropWord));

const DROP_HISTORY_LIMIT=5;
const dropKey=words=>words.slice(0,5).map(word=>word?.text||'').join('\u241f');
export const getRecentElementDrops=()=>read(KEYS.dropHistory)
  .filter(entry=>Array.isArray(entry?.words)&&entry.words.length)
  .slice(0,DROP_HISTORY_LIMIT)
  .map(entry=>({...entry,words:entry.words.slice(0,5).map(normalizeDropWord)}));
export const rememberElementDrop=words=>{
  const normalized=words.slice(0,5).filter(Boolean).map(normalizeDropWord);
  if(!normalized.length)return getRecentElementDrops();
  const key=dropKey(normalized);
  const history=getRecentElementDrops().filter(entry=>dropKey(entry.words)!==key);
  history.unshift({
    id:`drop_${Date.now()}`,
    createdAt:new Date().toISOString(),
    words:normalized.map(word=>({...word,locked:false}))
  });
  const next=history.slice(0,DROP_HISTORY_LIMIT);
  write(KEYS.dropHistory,next);
  return next;
};
