import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDevelopGuide} from '../js/develop-guide.js';

const item=(text,finalRole,category='object')=>({id:`${finalRole}_${text}`,text,category,syntaxRole:finalRole});
const labels=guide=>guide.prompts.map(prompt=>prompt.label);
const caseA=[item('药片','subject'),item('旧厨房','setting','space'),item('从缝隙中','path','relation'),item('滑出','secondary_action','action'),item('冷白顶光','light','visual')];
const caseB=[item('水母','subject','life'),item('玻璃罐','container','container'),item('下沉','secondary_action','action'),item('半透明','modifier_state','state')];

test('AI image does not re-ask known subject, scene or light',()=>{
  const guide=buildDevelopGuide(caseA,'ai-image');
  assert.deepEqual(labels(guide),['CAMERA','COMPOSITION','FOCUS']);
  assert.doesNotMatch(guide.prompts.map(x=>x.text).join(' '),/主体是谁|发生在哪里|光从哪里/);
});
test('different ingredient structures produce different AI image guidance',()=>{
  const a=buildDevelopGuide(caseA,'ai-image'),b=buildDevelopGuide(caseB,'ai-image');
  assert.notDeepEqual(a.prompts,b.prompts);
  assert.deepEqual(labels(b),['SPACE','CAMERA','LIGHT']);
});
test('sparse ingredients receive basic structural guidance',()=>{
  const guide=buildDevelopGuide([item('鱼','subject'),item('水','secondary')],'ai-image');
  assert.deepEqual(labels(guide),['SPACE','CAMERA','LIGHT']);
});
test('known perspective suppresses the basic camera question',()=>{
  const guide=buildDevelopGuide([...caseB,item('低机位','perspective','visual')],'ai-image');
  assert.ok(!labels(guide).includes('CAMERA'));
});
test('known light suppresses basic light questions',()=>{
  const guide=buildDevelopGuide(caseA,'ai-image');
  assert.ok(!labels(guide).includes('LIGHT'));
  assert.doesNotMatch(guide.prompts.map(x=>x.text).join(' '),/光从哪里|柔光|硬光/);
});
test('still life prioritizes physical realization when an action exists',()=>{
  const guide=buildDevelopGuide(caseA,'still-life');
  assert.deepEqual(labels(guide).slice(0,2),['PHYSICAL PATH','FREEZE THE ACTION']);
});
test('set design uses a known setting instead of asking where it happens',()=>{
  const guide=buildDevelopGuide(caseA,'set-design');
  assert.equal(labels(guide)[0],'OCCUPY THE SPACE');
  assert.doesNotMatch(guide.prompts.map(x=>x.text).join(' '),/发生在哪里|房间、棚内/);
});
