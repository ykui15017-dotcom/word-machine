import test from 'node:test';
import assert from 'node:assert/strict';
import {composeIngredients} from '../js/ingredient-composer.js';

const ingredient=(text,category='object',userRoleOverride=null)=>({
  id:`fixture_${text}`,
  text,
  category,
  ...(userRoleOverride?{userRoleOverride}:{}),
});

test('relation-target composition supports an object anchor with a partial follow-up action',()=>{
  const result=composeIngredients([
    ingredient('丝带'),
    ingredient('时钟','object','setting'),
    ingredient('缠绕','relation'),
    ingredient('飘落','action'),
    ingredient('零散分布','action'),
  ]);

  assert.equal(result.status,'ok');
  assert.match(result.draftText,/丝带缠绕在时钟上/);
  assert.match(result.draftText,/部分丝带飘落/);
  assert.match(result.draftText,/零散分布/);
  assert.ok(!result.warnings.some(item=>/场域|初始位置|路径\/出口/.test(item)));
});
