import { BASE_WORDS } from '../data/words/index.js';
import { RECIPES } from '../data/recipes.js';
import { getMyWords } from './storage.js';

const allWords = () => [...BASE_WORDS, ...getMyWords()];
const shuffle = values => [...values].sort(() => Math.random() - 0.5);

const weightedPick = list => {
  const total = list.reduce((sum, word) => sum + (word.weight || 1), 0);
  let cursor = Math.random() * total;
  return list.find(word => (cursor -= word.weight || 1) <= 0) || list[0];
};

const pickWord = (category, excluded = []) => weightedPick(
  allWords().filter(word => word.category === category && !excluded.includes(word.id))
);

function chooseRecipe(avoidRecipeId) {
  const choices = RECIPES.filter(recipe => recipe.id !== avoidRecipeId);
  return choices[Math.floor(Math.random() * choices.length)] || RECIPES[0];
}

/** Selects at least one core slot, then mixes remaining core and optional slots. */
export function selectSlots(recipe, count) {
  const coreCount = Math.min(recipe.core.length, count === 3 ? 1 : 2);
  const selected = shuffle(recipe.core).slice(0, coreCount);
  const candidates = shuffle([
    ...recipe.core.filter(slot => !selected.includes(slot)),
    ...recipe.optional
  ]);
  while (selected.length < count && candidates.length) selected.push(candidates.shift());
  return selected;
}

/** A main drop always picks a fresh recipe; locked words remain as extra fixed ingredients. */
export function newDrop(count = 4, locked = [], previousRecipeId = null) {
  const recipe = chooseRecipe(previousRecipeId);
  const kept = locked.slice(0, 5);
  const targetCount = Math.max(count, kept.length);
  const slots = selectSlots(recipe, targetCount - kept.length);
  const words = [...kept];

  for (const category of slots) {
    const word = pickWord(category, words.map(item => item.id));
    if (word) words.push({ ...word, locked: false });
  }
  return { recipe, words };
}

/** AGAIN deliberately keeps both the recipe and the current category mix. */
export function replaceUnlocked(current, recipe) {
  const words = current.map(word => {
    if (word.locked) return word;
    const replacement = pickWord(word.category, current.map(item => item.id));
    return replacement ? { ...replacement, locked: false } : word;
  });
  return { recipe, words };
}

export function addWord(current, recipe) {
  if (current.length >= 5) return { recipe, words: current };
  const unused = recipe.slots.filter(category => !current.some(word => word.category === category));
  const category = shuffle(unused.length ? unused : recipe.optional)[0];
  const word = pickWord(category, current.map(item => item.id));
  return word ? { recipe, words: [...current, { ...word, locked: false }] } : { recipe, words: current };
}
