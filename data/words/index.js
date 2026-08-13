import { CORE_WORDS } from '../word-bank-v2.js';

/** Public, ordinary-word corpus. Observations and scene rules intentionally live
 * in their own modules and never enter this array. */
export const BASE_WORDS = CORE_WORDS;
export const CATEGORIES = ['object','container','space','life','organic_matter','material','action','state','relation','visual','scale'];
export const CATEGORY_LABELS = {organic_matter:'ORGANIC MATTER'};
