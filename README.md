# WORD MACHINE — Visual Inspiration Gashapon V1

WORD MACHINE 是一个可直接部署到 GitHub Pages 的**视觉灵感扭蛋机**。它不生成图片，也不调用 AI：机器先选择一条受控配方，再从不同的视觉词类中抽取“食材”，帮助你得到“看得见，但没想到”的画面。所有个人观察、机器状态和收藏只保存在浏览器 `localStorage` 中。

## 功能

- 按住机器右下方摇杆，短按掉落 3 个、正常按住掉落 4 个、长按掉落 5 个词；支持鼠标、触摸、Enter 和 Space。
- 12 条 recipe 控制组合；锁定词后 `AGAIN` 只替换未锁定内容，并支持 `ADD ONE` / `LESS`。
- `MIX IT` 使用 120 个短句模板整理画面，并可在 SHORT MIX / EXPANDED MIX 间切换，不发送任何网络请求。
- 3,530 个基础视觉单位，按 14 个分类文件维护；可搜索、筛选并把任意词锁定带回机器。
- 生活观察和收藏会持久保存；收藏可再次放回机器。
- 响应式移动布局、键盘焦点样式和 `prefers-reduced-motion` 支持。

## 文件结构

```text
index.html                 # MACHINE
word-bank.html             # WORD BANK
observations.html          # 生活观察
saved.html                 # 收藏
assets/machine.svg         # 原创二维扭蛋机插画
css/styles.css             # 全站视觉、响应式和动画
js/machine.js              # 首页交互层
js/wordbank.js             # 词仓交互层
js/observations.js         # 个人观察交互层
js/saved.js                # 收藏交互层
js/storage.js              # localStorage/sessionStorage 边界
js/random-engine.js        # recipe 抽取、权重和锁定逻辑
js/sentence-builder.js     # 中文模板句子生成器
js/common.js               # 导航和安全文本工具
data/recipes.js            # 配方定义
data/words/index.js        # 统一汇总与分类清单
data/words/*.js            # 14 个模块化基础词库
```

## 本地预览

ES modules 需要通过 HTTP 打开。在项目根目录运行：

```bash
python3 -m http.server 8000
```

然后访问 <http://localhost:8000/>。请不要直接双击 HTML 文件；`file://` 对 ES modules 的限制因浏览器而异。

## 发布到 GitHub Pages

1. 将本仓库推送到 GitHub（默认分支建议为 `main`）。
2. 打开仓库 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**。
4. 选择 `main` 和 `/ (root)`，保存。
5. 等待 Pages 显示发布地址。项目全部使用 `./` 相对路径，可部署在用户站点或项目子路径，无需构建步骤。

## 新增词语

找到对应的 `data/words/<category>.js`，添加遵循以下结构的对象，然后确认 `id` 在全词库中唯一：

```js
{
  id: "obj_medical_201",
  text: "板装药片",
  category: "object",
  subcategory: "medical",
  tags: ["银色", "铝箔", "重复", "日常"],
  source: "base",
  weight: 1
}
```

新增一种分类时，才需要同时更新 `data/words/index.js`；扩充已有分类无需触碰页面或随机引擎。`weight` 越大，被同类槽位抽中的概率越高。个人词不要写入基础数据，Observations 页面会独立保存它们。

## 新增 recipe

只修改 `data/recipes.js`，增加唯一 `id`、显示名称、`core` 核心槽、`optional` 可选槽和句型键。若使用现有句型键，不需要修改其他文件；若需要新的句子结构，再在 `js/sentence-builder.js` 中增加对应模板。recipe 槽位必须使用 `data/words/index.js` 已注册的 category。

## 自定义视觉

- **配色：** 修改 `css/styles.css` 顶部 `:root` 的 `--paper`、`--ink`、`--blue`、`--yellow`、`--red`、`--sage`。
- **网站名称：** 修改四个 HTML 文件中的 `.brand` 文本和各自 `<title>`；README 名称按需同步。
- **机器插画：** 只编辑 `assets/machine.svg`。保持 `viewBox="0 0 420 520"`，首页响应式与点击区域便可继续工作；若改变出球口或机身比例，再调整 `styles.css` 的 `.drop-control` 定位。
- **动效：** 机器状态和掉球动效位于 `styles.css`；按压时序及 3/4/5 数量阈值位于 `js/machine.js`。

## HOW TO UPDATE WITHOUT BREAKING V1

1. **增加词库是内容更新，不需要重构网站。** 只改目标 `data/words/*.js`，不要为了更多词去修改 UI 或随机核心。
2. 修改数据时尽量不修改 `js/machine.js`、页面 HTML 或 CSS。数据结构、随机逻辑、句子构建和界面各有明确边界。
3. 每个新功能都从**已经合并后的最新 `main`** 创建新分支；不要从旧功能分支继续叠加。
4. 一次只处理一个功能升级，先合并、验证，再开始下一个升级。
5. 避免多人同时修改核心汇总文件 `data/words/index.js`、`data/recipes.js` 和全站 `css/styles.css`。扩词任务按分类分配到不同文件。
6. 保持 localStorage key 的 `v1` 后缀与现有数据结构。需要迁移时新增显式迁移逻辑，不要静默覆盖用户观察或收藏。
7. 不要把词数据移回 HTML，也不要让 sentence builder 或 random engine 直接操作 DOM。

## 数据与隐私

没有账户、后端、分析脚本或 AI API。`wm-my-words-v1`、`wm-saved-v1` 和 `wm-machine-v1` 存在当前浏览器本地；清理站点数据会删除它们。
