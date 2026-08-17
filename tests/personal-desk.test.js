import test from 'node:test';
import assert from 'node:assert/strict';

const memory=new Map();
global.localStorage={
  getItem:key=>memory.get(key)??null,
  setItem:(key,value)=>memory.set(key,value)
};
global.sessionStorage={
  getItem:key=>memory.get(`s:${key}`)??null,
  setItem:(key,value)=>memory.set(`s:${key}`,value),
  removeItem:key=>memory.delete(`s:${key}`)
};

const {rememberElementDrop,getRecentElementDrops}=await import('../js/storage.js');
const makeDrop=seed=>Array.from({length:5},(_,index)=>({
  id:`${seed}_${index}`,
  text:`词${seed}-${index}`,
  category:'object',
  source:'random',
  locked:false
}));

test('recent element drops keep the newest five distinct combinations',()=>{
  memory.clear();
  for(let seed=1;seed<=7;seed++)rememberElementDrop(makeDrop(seed));
  const history=getRecentElementDrops();
  assert.equal(history.length,5);
  assert.equal(history[0].words[0].text,'词7-0');
  assert.equal(history[4].words[0].text,'词3-0');
});

test('reusing the same word combination moves it to the front without duplicating it',()=>{
  memory.clear();
  rememberElementDrop(makeDrop(1));
  rememberElementDrop(makeDrop(2));
  rememberElementDrop(makeDrop(1));
  const history=getRecentElementDrops();
  assert.equal(history.length,2);
  assert.equal(history[0].words[0].text,'词1-0');
  assert.equal(history[1].words[0].text,'词2-0');
});
