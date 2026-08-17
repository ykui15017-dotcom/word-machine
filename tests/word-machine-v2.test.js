import test from 'node:test';
import assert from 'node:assert/strict';
import {BASE_WORDS,CATEGORIES} from '../data/words/index.js';
import {DROP_SIZE,DROP_GROUPS,uniquePool,freshDrop,replaceSlot,removeSlot,toggleLock,formatDrop} from '../js/element-drop.js';
import {createDoodle,doodleSvg,DOODLE_TEMPLATE_COUNT} from '../js/doodle-card.js';

test('V2 corpus contains thousands of unique atomic elements',()=>{
  assert.ok(BASE_WORDS.length>=2000,`expected at least 2000 words, got ${BASE_WORDS.length}`);
  assert.equal(new Set(BASE_WORDS.map(word=>word.text)).size,BASE_WORDS.length);
  assert.ok(BASE_WORDS.every(word=>CATEGORIES.includes(word.category)&&word.text.trim()));
  assert.ok(BASE_WORDS.every(word=>word.category!=='observation'&&word.category!=='concept'));
});
test('fresh drop returns seven unique words spanning every balanced group',()=>{
  const drop=freshDrop([],uniquePool(BASE_WORDS),()=>0.37);
  assert.equal(drop.length,DROP_SIZE);
  assert.equal(new Set(drop.map(word=>word.text)).size,DROP_SIZE);
  const represented=new Set(drop.map(word=>DROP_GROUPS.findIndex(group=>group.includes(word.category))));
  assert.equal(represented.size,DROP_GROUPS.length);
  assert.ok(drop.every(word=>word.source==='random'&&!word.locked));
});
test('locked words survive another drop',()=>{
  const pool=uniquePool(BASE_WORDS);let drop=freshDrop([],pool,()=>0.11);drop=toggleLock(drop,2);const locked=drop[2];const another=freshDrop(drop,pool,()=>0.81);assert.equal(another[2].text,locked.text);assert.equal(another[2].locked,true);
});
test('manual replacement locks the chosen word and copy uses Chinese delimiter',()=>{
  const pool=uniquePool(BASE_WORDS),drop=freshDrop([],pool,()=>0.21),replacement=pool.find(word=>!drop.some(item=>item.text===word.text)),next=replaceSlot(drop,1,replacement);assert.equal(next[1].text,replacement.text);assert.equal(next[1].source,'manual');assert.equal(next[1].locked,true);assert.equal(formatDrop(next).split('、').length,DROP_SIZE);
});
test('selecting a word already in the drop moves it without creating a duplicate',()=>{
  const drop=freshDrop([],uniquePool(BASE_WORDS),()=>0.45),next=replaceSlot(drop,0,drop[3]);assert.equal(next[0].text,drop[3].text);assert.equal(next[0].locked,true);assert.equal(new Set(next.map(word=>word.text)).size,DROP_SIZE);
});
test('a disliked word can be removed from the current drop without deleting it from the pool',()=>{
  const pool=uniquePool(BASE_WORDS),drop=freshDrop([],pool,()=>0.27),removed=drop[2],next=removeSlot(drop,2);
  assert.equal(next.length,DROP_SIZE-1);
  assert.ok(!next.some(word=>word.text===removed.text));
  assert.ok(pool.some(word=>word.text===removed.text));
  assert.equal(formatDrop(next).split('、').length,DROP_SIZE-1);
});
test('a new drop refills a shortened selection back to seven while preserving locked survivors',()=>{
  const pool=uniquePool(BASE_WORDS);let drop=freshDrop([],pool,()=>0.19);drop=toggleLock(drop,0);const locked=drop[0];drop=removeSlot(drop,3);const next=freshDrop(drop,pool,()=>0.73);
  assert.equal(next.length,DROP_SIZE);
  assert.equal(next[0].text,locked.text);
  assert.equal(next[0].locked,true);
});
test('doodle cards use eight templates, retain a signature, and render local SVG',()=>{
  const words=freshDrop([],uniquePool(BASE_WORDS),()=>0.32),first=createDoodle(words,[],()=>0.32),second=createDoodle(words,[first.signature],()=>0.61);
  assert.equal(DOODLE_TEMPLATE_COUNT,8);
  assert.notEqual(first.signature,second.signature);
  assert.match(doodleSvg(first,words),/^<svg[\s\S]*<\/svg>$/);
  assert.deepEqual(first.words,words.map(word=>word.text));
});
