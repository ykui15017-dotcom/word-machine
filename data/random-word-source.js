import {BASE_WORDS} from './words/index.js';

/**
 * Random drops use the same public corpus as the Word Bank page.  Role pools
 * are derived from metadata instead of maintaining a second demonstration
 * vocabulary that can drift out of sync with the bank.
 */
export const FULL_RANDOM_WORDS=BASE_WORDS.map(word=>({...word,randomEligible:true}));

export const SUBJECT_CATEGORIES=new Set(['object','life','organic_matter','container']);

const declaredRole=word=>word.syntaxRole||word.sentenceRole||word.role;

export function candidatesForRole(role){
  if(role==='subject'){
    return FULL_RANDOM_WORDS
      .filter(word=>SUBJECT_CATEGORIES.has(word.category))
      .map(word=>({...word,sentenceRole:'subject',syntaxRole:'subject'}));
  }
  return FULL_RANDOM_WORDS.filter(word=>declaredRole(word)===role);
}

export function candidatesForRoles(roles=[]){
  const byId=new Map();
  for(const role of roles)for(const word of candidatesForRole(role))if(!byId.has(word.id))byId.set(word.id,word);
  return [...byId.values()];
}
