# WORD MACHINE — Five Visual Elements

WORD MACHINE 是一个可直接部署到 GitHub Pages 的元素词仓。它不生成图片、不调用 AI，也不自动完成联想：每次只掉落五个独立视觉元素词，交给使用者继续组合。

## 当前功能

- 每次固定掉落 5 个不重复词语，并尽量覆盖物件、生命/自然物、材质、动作/状态、空间/视觉五类。
- 单独锁定任意词；再次掉落时只替换未锁定词。
- 在主页搜索并手动替换任意位置，也可以从完整词仓指定位置放入词语。
- 复制格式固定为 `鱼缸、药片、红线、涟漪、潮湿`。
- 收藏只保存原始词组，不保存句子、recipe 或提示词。
- WORD BANK 支持搜索、分类、隐藏基础词，以及用 `、`、逗号或换行批量添加 MY WORDS。
- 旧 OBSERVATIONS 地址会转到 WORD BANK 的 MY WORDS；原有 `wm-my-words-v1` 数据继续读取。
- 当前基础词仓包含 2,000+ 个去重后的元素词，观察句与场景规则不会进入随机池。

## 核心文件

```text
index.html                    # 五词机器
word-bank.html                # 完整词仓与 MY WORDS
saved.html                    # 纯词组收藏
observations.html             # 旧地址兼容跳转
css/styles.css                # 原有全站视觉
css/word-machine-v2.css       # 五词模式页面样式
js/element-drop.js            # 五词平衡抽取、锁定、替换与格式化
js/machine.js                 # 主页交互
js/wordbank.js                # 词仓与自定义词交互
js/saved.js                   # 收藏交互
js/storage.js                 # localStorage 与旧数据兼容
data/element-expansion.js     # 新增独立元素词
data/words/index.js           # 清理、合并、去重后的公共词仓
```

## 本地预览与测试

ES modules 需要通过 HTTP 打开：

```bash
python3 -m http.server 8000
```

访问 <http://localhost:8000/>。运行自动测试：

```bash
node --test tests/*.test.js
```

## GitHub Pages

1. 将改动合并到 `main`。
2. 在仓库 **Settings → Pages** 选择 **Deploy from a branch**。
3. 选择 `main` 和 `/ (root)`。

项目只使用相对路径，不需要构建步骤。

## 数据与隐私

网站没有账户、后端、分析脚本或 AI API。自定义词、当前五词与收藏只存在当前浏览器的 `localStorage` 中；清理站点数据会删除它们。
