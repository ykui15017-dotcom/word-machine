import test from 'node:test';
import assert from 'node:assert/strict';
import {composeIngredients,composeIngredientText} from '../js/ingredient-composer.js';
import {formatResultState,missingResultRoles} from '../js/result-state.js';

const word=(text,category='object')=>({id:`fixture_${text}`,text,category});

test('relation-target grammar expresses wrap plus partial motion without a fake scene slot',()=>{
  const result=composeIngredients([
    word('丝带'),word('时钟'),word('缠绕','relation'),word('飘落','action'),word('零散分布','action')
  ]);
  assert.equal(result.grammarType,'relation-target');
  assert.equal(result.status,'ok');
  assert.equal(result.draftText,'丝带缠绕在时钟上，部分丝带从时钟边缘飘落，并在四周零散分布。');
  assert.deepEqual(missingResultRoles(result),[]);
});

test('relation-target grammar generalizes to growth and a second relation',()=>{
  const result=composeIngredients([
    word('藤蔓','life'),word('椅子'),word('缠绕','relation'),word('生长','action'),word('覆盖','relation')
  ]);
  assert.equal(result.status,'ok');
  assert.equal(result.draftText,'藤蔓缠绕在椅子上，部分藤蔓继续生长，并逐渐覆盖在椅子表面。');
});

test('a contained action does not require an invented exit path',()=>{
  const result=composeIngredients([
    word('水母','life'),word('玻璃罐','container'),word('下沉','action'),word('半透明','state')
  ]);
  assert.equal(result.grammarType,'contained-action');
  assert.equal(result.status,'ok');
  assert.equal(result.draftText,'半透明的水母位于玻璃罐中，并下沉。');
});

test('two physical objects prompt for a relation instead of container/path/action filler',()=>{
  const result=composeIngredients([word('丝带'),word('时钟')]);
  assert.equal(result.grammarType,'relation-open');
  assert.equal(result.status,'incomplete');
  assert.deepEqual(result.missingRoles,['relation']);
  assert.equal(formatResultState(result),'还可以补充：核心关系');
});

test('the established complete container action chain remains unchanged',()=>{
  const ingredients=[
    word('花瓣','organic_matter'),word('纸箱','container'),word('被雨打湿的','state'),word('放置在','relation'),word('从缝隙中','relation'),word('流出','action'),word('散开','action')
  ];
  assert.equal(composeIngredientText(ingredients,0),'花瓣被放置在被雨打湿的纸箱中，随后从缝隙中流出，并在外部散开。');
  const another=composeIngredientText(ingredients,1);
  assert.notEqual(another,composeIngredientText(ingredients,0));
  for(const item of ingredients)assert.match(another,new RegExp(item.text));
});
