/**
 * `core` establishes a recipe's identity. `optional` supplies flexible context.
 * The random engine samples both groups instead of truncating `slots` from the left.
 */
export const RECIPES = [
  { id: 'wrong_contents', label: '错误内容物', core: ['container', 'object'], optional: ['state', 'scale', 'detail', 'visual', 'concept'], sentence: 'contents' },
  { id: 'physical_anomaly', label: '物理异常', core: ['object', 'state'], optional: ['material', 'detail', 'visual', 'concept', 'scale'], sentence: 'physical' },
  { id: 'wrong_space', label: '错误空间', core: ['object', 'space'], optional: ['action', 'state', 'visual', 'scale', 'concept'], sentence: 'space' },
  { id: 'two_worlds', label: '两种世界结合', core: ['object', 'organic'], optional: ['living', 'relation', 'material', 'detail', 'visual'], sentence: 'relation' },
  { id: 'too_many', label: '数量失控', core: ['scale', 'object'], optional: ['space', 'relation', 'state', 'visual', 'concept'], sentence: 'quantity' },
  { id: 'full_scene', label: '完整场景', core: ['space', 'visual'], optional: ['container', 'object', 'state', 'action', 'detail', 'concept'], sentence: 'scene' },
  { id: 'living_material', label: '生命换肤', core: ['living', 'material'], optional: ['action', 'state', 'relation', 'detail', 'visual'], sentence: 'living' },
  { id: 'observation_echo', label: '观察回声', core: ['observation'], optional: ['object', 'relation', 'visual', 'detail', 'concept', 'space'], sentence: 'observation' },
  { id: 'surface_evidence', label: '表面证据', core: ['detail', 'material'], optional: ['object', 'container', 'visual', 'state', 'concept'], sentence: 'surface' },
  { id: 'quiet_concept', label: '日常偏移', core: ['concept', 'object'], optional: ['space', 'visual', 'state', 'scale', 'relation'], sentence: 'concept' },
  { id: 'organic_space', label: '室内生长', core: ['organic', 'space'], optional: ['action', 'scale', 'visual', 'relation', 'detail'], sentence: 'organic' },
  { id: 'found_fragment', label: '观察切片', core: ['observation'], optional: ['detail', 'material', 'space', 'visual', 'state', 'scale'], sentence: 'fragment' }
].map(recipe => ({ ...recipe, slots: [...recipe.core, ...recipe.optional] }));
