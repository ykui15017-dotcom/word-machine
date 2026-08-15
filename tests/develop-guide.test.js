import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDevelopGuide} from '../js/develop-guide.js';

const item=(text,finalRole,category='object')=>({id:`${finalRole}_${text}`,text,category,syntaxRole:finalRole});
const labels=guide=>guide.prompts.map(prompt=>prompt.label);
const text=guide=>guide.prompts.map(prompt=>prompt.text).join(' ');
const rich=[item('花瓣','subject'),item('仓库','setting','space'),item('从缝隙中','path','relation'),item('溢出','secondary_action','action'),item('疏密不均地','visual_detail','visual'),item('冷白顶光','light','visual')];
const alternate=[item('水母','subject','life'),item('玻璃罐','container','container'),item('下沉','secondary_action','action'),item('半透明','modifier_state','state')];

test('rich combinations produce five to seven distinct decisions in every mode',()=>{
  for(const mode of ['ai-image','still-life','set-design']){
    const guide=buildDevelopGuide(rich,mode);
    assert.ok(guide.prompts.length>=5&&guide.prompts.length<=7,`${mode}: ${guide.prompts.length}`);
    assert.equal(new Set(labels(guide)).size,guide.prompts.length);
  }
});

test('known light becomes treatment rather than a basic source question',()=>{
  const guide=buildDevelopGuide(rich,'ai-image');
  assert.ok(labels(guide).includes('LIGHT TREATMENT'));
  assert.match(text(guide),/冷白顶光/);
  assert.doesNotMatch(text(guide),/光从哪里|什么样的光线/);
});

test('known scene becomes a spatial relationship rather than asking where',()=>{
  const image=buildDevelopGuide(rich,'ai-image');
  const set=buildDevelopGuide(rich,'set-design');
  assert.ok(labels(image).includes('DEPTH'));
  assert.ok(labels(set).includes('OCCUPY THE SPACE'));
  assert.match(text(image)+text(set),/仓库/);
  assert.doesNotMatch(text(image)+text(set),/发生在哪里|怎样的空间尺度/);
});

test('visual, state, path and action trigger deeper decisions',()=>{
  const image=buildDevelopGuide(rich,'ai-image');
  assert.ok(labels(image).includes('DENSITY'));
  assert.match(text(image),/疏密不均地/);
  const physical=buildDevelopGuide([...alternate,item('沿台面','path','relation')],'still-life');
  assert.ok(labels(physical).includes('MATERIAL TEST'));
  assert.ok(labels(physical).includes('PHYSICAL PATH'));
  assert.ok(labels(physical).includes('FREEZE THE ACTION'));
  assert.match(text(physical),/半透明/);
});

test('different ingredient combinations produce substantially different guidance',()=>{
  const a=buildDevelopGuide(rich,'ai-image');
  const b=buildDevelopGuide(alternate,'ai-image');
  assert.notDeepEqual(a.prompts,b.prompts);
  const shared=a.prompts.filter(prompt=>b.prompts.some(other=>other.label===prompt.label&&other.text===prompt.text));
  assert.ok(shared.length<=1);
  assert.match(text(a),/花瓣|仓库|溢出/);
  assert.match(text(b),/水母|玻璃罐|下沉/);
});

test('sparse input remains useful without repeating synonymous labels',()=>{
  const guide=buildDevelopGuide([item('鱼','subject')],'ai-image');
  assert.ok(guide.prompts.length<=7);
  assert.equal(new Set(labels(guide)).size,guide.prompts.length);
});
