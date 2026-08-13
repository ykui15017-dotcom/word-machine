import {SEMANTIC_OVERRIDES} from '../data/semantic-overrides.js';
const DEFAULTS={
  object:['subject','anomaly'],container:['subject','container','anomaly'],space:['space'],life:['subject','anomaly','organic'],organic_matter:['anomaly','subject','organic','surface_source'],material:['material','anomaly','surface_source'],action:['mechanism'],state:['anomaly','state'],relation:['relation'],scale:['scale'],visual:['visual']
};
export function normalizeWord(word={}){const override=SEMANTIC_OVERRIDES[word.text]||{};return {...word,roles:[...new Set([...(override.roles||DEFAULTS[word.category]||[])])],domain:override.domain||'unknown',physicalTraits:override.physicalTraits||[],surfaceTraits:override.surfaceTraits||[],compatibleRelations:override.compatibleRelations||[],incompatibleRelations:override.incompatibleRelations||[],abstraction:override.abstraction??0,visualStrength:override.visualStrength??(['object','container','life','organic_matter','material'].includes(word.category)?.75:.45),realizability:override.realizability||'unknown'} }
export const canFill=(word,slot)=>{const normalized=normalizeWord(word);return slot.accepts.some(role=>normalized.roles.includes(role))};
export const isPhysicalSubject=word=>normalizeWord(word).roles.includes('subject')&&!['visual','scale','action','relation','state'].includes(word.category);
