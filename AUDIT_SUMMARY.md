# Word Bank 2.0 — Audit Summary

## Totals

The migration ledger in `data/audit-v2.js` assigns **all 3,002 legacy records** exactly one disposition. Repeated legacy records are counted separately because they were separate source records.

| Result | Count |
|---|---:|
| Legacy records reviewed | 3,002 |
| Final CORE words | 733 |
| OBSERVATIONS | 79 |
| SCENE RULES | 30 |
| KEEP | 638 |
| REWRITE | 12 |
| RECLASSIFY | 145 |
| MERGE | 158 |
| ARCHIVE | 2,039 |
| DELETE | 10 |

The requested numerical ranges were deliberately not filled with automatically generated material: the review stopped at 733 core words, 79 observations, and 30 scene rules rather than weakening the visual standard.

## Core category totals

| Category | Count |
|---|---:|
| OBJECT | 92 |
| CONTAINER | 65 |
| SPACE | 60 |
| LIFE | 64 |
| ORGANIC_MATTER | 52 |
| MATERIAL | 78 |
| ACTION | 83 |
| STATE | 69 |
| RELATION | 65 |
| VISUAL | 62 |
| SCALE | 43 |

## Disposition examples

- **KEEP:** 板装药片、旧收据、塑料雨衣、橡胶手套、折叠雨伞、浴帽、打火机、标签纸、旧遥控器、安全别针、衣架、胶带卷。
- **REWRITE:** 褪色 → 逐渐褪色；被雨水泡软的纸箱 → 纸箱底部吸水后向外翻卷的纸层；雨后的蚂蚁群 → 雨后沿墙缝重新排列成细线的蚁群；漂浮 → 缓慢漂浮；溢出 → 向外溢出；破裂 → 逐渐破裂；看起来很冷 → 冷白漫射光；半透明的 → 半透明；人造革 → 皮革；旧式钨丝灯 → 老式钨丝灯。
- **RECLASSIFY:** 气泡膜 OBJECT → MATERIAL；金鱼 LIVING → LIFE；蜗牛 LIVING → LIFE；飞蛾 LIVING → LIFE；苔藓 ORGANIC → LIFE；蘑菇 ORGANIC → LIFE；羽毛 ORGANIC → ORGANIC_MATTER；鱼鳞 ORGANIC → ORGANIC_MATTER；贝壳 ORGANIC → ORGANIC_MATTER；海绵 OBJECT → MATERIAL；残胶 DETAIL → MATERIAL；包装取代内容 CONCEPT → SCENE_RULE。
- **MERGE:** 火柴盒的 OBJECT/CONTAINER 记录合并；肥皂的 OBJECT/MATERIAL 记录合并；海绵的 OBJECT/MATERIAL 记录合并；气泡膜的 OBJECT/MATERIAL 记录合并；药棉的 OBJECT/MATERIAL 记录合并；融化的 ACTION/STATE 记录归并到过程或结果的明确写法；冻结同理；膨胀同理；散落同理；缠绕的 ACTION/RELATION 记录合并；包裹的 ACTION/RELATION 记录合并；穿过的 ACTION/RELATION 记录合并。
- **ARCHIVE:** 冰格、纸杯、冰块、塑料叉子、白色袜子、纸巾盒、旧信封、锡纸餐盒、小票卷、饼干模具、数据线、胶水瓶；这些条目不是全部“坏词”，但在本轮代表性、独特视觉行为或组合价值不足。
- **DELETE:** 即将发生、相同但不一样、无法归类、比预期更轻、剩余的一点、药板背面上凝固的油滴、药板背面边缘半圈茶渍、便利店冰柜门边缘铅笔屑和纸团、被雨泡软的纸箱边缘干涸的菜叶碎片、厨房排风罩上铅笔屑和纸团。后五项是模板拼接造成的偶然组合或语病，前五项过于空泛。

## ACTION / STATE / RELATION boundary decisions

The deciding question is respectively “what unfolds over time?”, “what condition holds now?”, and “does this require A and B?”. Thirty commonly confused examples:

| Word | Final category | Reason |
|---|---|---|
| 逐渐褪色 | ACTION | “逐渐” makes the color loss temporal. |
| 滴落 | ACTION | A drop changes position over time. |
| 燃烧 | ACTION | Continuous transformation. |
| 融化 | ACTION | Phase-change process; the result would be “已经融化”. |
| 折叠 | ACTION | Manipulation/process, not a static fold. |
| 撕裂 | ACTION | The tearing event unfolds in time. |
| 扩张 | ACTION | One entity can expand without a second entity. |
| 坠落 | ACTION | Temporal movement. |
| 渗出 | ACTION | Material moves outward over time. |
| 挤压 | ACTION | The core meaning is force/process, not spatial structure. |
| 已经褪色 | STATE | “已经” fixes the result at the present moment. |
| 半透明 | STATE | Current optical property, not camera/viewing method. |
| 冻结 | STATE | Here retained as the current frozen condition; process uses “逐渐冻结”. |
| 潮湿 | STATE | Present moisture condition. |
| 腐烂 | STATE | Current material condition; “逐渐腐烂” would be action. |
| 松弛 | STATE | Current tension condition. |
| 发白 | STATE | Visible present result. |
| 破损 | STATE | Resulting condition rather than breakage event. |
| 浑浊 | STATE | Current optical/material condition. |
| 局部透明 | STATE | Property of the entity, not a viewing setup. |
| 穿过 | RELATION | Requires A passing through B and defines their structure. |
| 包裹 | RELATION | Requires wrapper A and wrapped B. |
| 覆盖 | RELATION | Requires cover and covered entities/surface. |
| 嵌入 | RELATION | Requires inserted A and host B. |
| 贴合 | RELATION | Requires at least two contacting entities. |
| 缠绕 | RELATION | Retained as the resulting A-around-B spatial structure. |
| 悬挂于 | RELATION | Requires a hanging entity and support. |
| 围绕 | RELATION | Requires center B and surrounding A. |
| 夹在两层之间 | RELATION | Explicitly requires A, B, and C/layers. |
| 被薄膜隔开 | RELATION | Defines separation between entities by another entity. |

## Reviewability

Legacy source modules remain untouched as review evidence. `data/audit-v2.js` deterministically overlays the decision ledger on every legacy record; ordinary core words, observations, scene rules, and the representative archive manifest are separate exports. This makes later human review possible without reintroducing retired primary categories into the runtime Word Bank.
