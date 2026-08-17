import test from 'node:test';
import assert from 'node:assert/strict';
import {BASE_WORDS,CATEGORIES} from '../data/words/index.js';
import {DROP_SIZE,DROP_GROUPS,uniquePool,freshDrop,replaceSlot,toggleLock,formatDrop} from '../js/element-drop.js';

test('V2 corpus contains thousands of unique atomic elements',()=>{
  assert.ok(BASE_WORDS.length>=2000,`expected at least 2000 words, got ${BASE_WORDS.length}`);
  assert.equal(new Set(BASE_WORDS.map(word=>word.text)).size,BASE_WORDS.length);
  assert.ok(BASE_WORDS.every(word=>CATEGORIES.includes(word.category)&&word.text.trim()));
  assert.ok(BASE_WORDS.every(word=>word.category!=='observation'&&word.category!=='concept'));
});
test('fresh drop returns five unique words from balanced groups',()=>{
  const drop=freshDrop([],uniquePool(BASE_WORDS),()=>0.37);
  assert.equal(drop.length,DROP_SIZE);
  assert.equal(new Set(drop.map(word=>word.text)).size,DROP_SIZE);
  const represented=new Set(drop.map(word=>DROP_GROUPS.findIndex(group=>group.includes(word.category))));
  assert.equal(represented.size,DROP_SIZE);
  assert.ok(drop.every(word=>word.source==='random'&&!word.locked));
});
test('locked words survive another drop',()=>{
  const pool=uniquePool(BASE_WORDS);let drop=freshDrop([],pool,()=>0.11);drop=toggleLock(drop,2);const locked=drop[2];const another=freshDrop(drop,pool,()=>0.81);assert.equal(another[2].text,locked.text);assert.equal(another[2].locked,true);
});
test('manual replacement locks the chosen word and copy uses Chinese delimiter',()=>{
  const pool=uniquePool(BASE_WORDS),drop=freshDrop([],pool,()=>0.21),replacement=pool.find(word=>!drop.some(item=>item.text===word.text)),next=replaceSlot(drop,1,replacement);assert.equal(next[1].text,replacement.text);assert.equal(next[1].source,'manual');assert.equal(next[1].locked,true);assert.equal(formatDrop(next).split('、').length,5);
});
test('selecting a word already in the drop moves it without creating a duplicate',()=>{
  const drop=freshDrop([],uniquePool(BASE_WORDS),()=>0.45),next=replaceSlot(drop,0,drop[3]);assert.equal(next[0].text,drop[3].text);assert.equal(next[0].locked,true);assert.equal(new Set(next.map(word=>word.text)).size,5);
});
