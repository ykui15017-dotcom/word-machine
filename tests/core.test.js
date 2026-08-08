import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const memory = new Map();
global.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
const { BASE_WORDS, CATEGORIES } = await import('../data/words/index.js');
const { RECIPES } = await import('../data/recipes.js');
const { newDrop, replaceUnlocked, addWord, selectSlots } = await import('../js/random-engine.js');
const { buildSentence, templateCount } = await import('../js/sentence-builder.js');
const storage = await import('../js/storage.js');

test('modular bank has 3000–4000 unique, valid visual units', () => {
  assert.ok(BASE_WORDS.length >= 3000 && BASE_WORDS.length <= 4000);
  assert.equal(new Set(BASE_WORDS.map(word => word.id)).size, BASE_WORDS.length);
  for (const word of BASE_WORDS) {
    assert.ok(word.id && word.text && CATEGORIES.includes(word.category));
    assert.ok(word.subcategory && Array.isArray(word.tags) && word.source && word.weight > 0);
  }
});

test('every category has substantial data and every recipe slot is backed', () => {
  for (const category of CATEGORIES) assert.ok(BASE_WORDS.filter(word => word.category === category).length >= 200, category);
  for (const recipe of RECIPES) {
    assert.ok(recipe.core.length >= 1 && recipe.optional.length >= 4);
    for (const slot of recipe.slots) assert.ok(BASE_WORDS.some(word => word.category === slot), `${recipe.id}: ${slot}`);
  }
});

test('three and four word drops sample flexible slots, not left-prefix truncation', () => {
  for (const recipe of RECIPES) {
    const mixes = new Set(Array.from({ length: 40 }, () => selectSlots(recipe, 3).join('|')));
    assert.ok(mixes.size > 2, recipe.id);
    assert.ok([...mixes].some(mix => recipe.optional.some(slot => mix.includes(slot))), recipe.id);
  }
});

test('main drops always switch recipe and expose all requested categories', () => {
  let previous = null;
  const seen = new Set();
  for (let index = 0; index < 180; index += 1) {
    const drop = newDrop(index % 3 + 3, [], previous);
    if (previous) assert.notEqual(drop.recipe.id, previous);
    previous = drop.recipe.id;
    drop.words.forEach(word => seen.add(word.category));
  }
  for (const category of ['space', 'visual', 'scale', 'concept', 'detail', 'observation']) assert.ok(seen.has(category), category);
});

test('AGAIN keeps recipe/category mix and locked words while replacing unlocked', () => {
  const drop = newDrop(4);
  drop.words[0].locked = true;
  const next = replaceUnlocked(drop.words, drop.recipe);
  assert.equal(next.recipe.id, drop.recipe.id);
  assert.deepEqual(next.words.map(word => word.category), drop.words.map(word => word.category));
  assert.equal(next.words[0].id, drop.words[0].id);
  assert.ok(next.words.slice(1).some((word, index) => word.id !== drop.words[index + 1].id));
});

test('a shorter fresh drop never discards locked ingredients', () => {
  const drop = newDrop(5);
  const locked = drop.words.slice(0, 4).map(word => ({ ...word, locked: true }));
  const next = newDrop(3, locked, drop.recipe.id);
  assert.notEqual(next.recipe.id, drop.recipe.id);
  assert.deepEqual(next.words.slice(0, 4).map(word => word.id), locked.map(word => word.id));
});

test('ADD ONE caps at five and LESS-compatible unlocked selection remains available', () => {
  let drop = newDrop(3);
  drop = addWord(drop.words, drop.recipe);
  assert.equal(drop.words.length, 4);
  drop = addWord(drop.words, drop.recipe);
  drop = addWord(drop.words, drop.recipe);
  assert.equal(drop.words.length, 5);
  assert.ok(drop.words.some(word => !word.locked));
});

test('MIX IT offers 10 forms per recipe plus expanded output', () => {
  assert.equal(templateCount, RECIPES.length * 10);
  for (const recipe of RECIPES) {
    const words = recipe.slots.map(category => BASE_WORDS.find(word => word.category === category));
    const forms = new Set(Array.from({ length: 100 }, () => buildSentence(words, recipe, 'short')));
    assert.ok(forms.size >= 8, `${recipe.id}: ${forms.size}`);
    const expanded = buildSentence(words, recipe, 'expanded');
    assert.ok(expanded.length > buildSentence(words, recipe, 'short').length);
    assert.ok(!expanded.includes('熟悉的轮廓因此变得难以解释'));
  }
});

test('long observations have wrapping styles and category labels', async () => {
  const css = await readFile(new URL('../css/styles.css', import.meta.url), 'utf8');
  const machine = await readFile(new URL('../js/machine.js', import.meta.url), 'utf8');
  assert.match(css, /overflow-wrap:anywhere/);
  assert.match(css, /data-category="observation"/);
  assert.match(machine, /chip-category/);
});

test('user words and saved drops persist through storage module', () => {
  storage.addMyWord({ id: 'user_1', text: '雨痕', category: 'detail', tags: [], source: 'user', weight: 1 });
  assert.equal(storage.getMyWords()[0].text, '雨痕');
  const drop = newDrop(3);
  storage.saveDrop({ ...drop, recipe: '一句话' });
  assert.equal(storage.getSaved().at(0).recipe, '一句话');
});
