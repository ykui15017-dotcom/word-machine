# GLASS / 01 — Procedural Three.js Still Life

一个可实时浏览的程序化 Three.js 医疗静物场景：有厚壁玻璃鱼缸、不规则堆叠的银色药品泡罩、粉质药片、旧白木桌、纱帘与冷灰蓝墙面。场景中的主体均为几何体和物理材质，不使用参考照片作为背景贴图。

## 本地预览

```bash
python3 -m http.server 8000
```

打开 <http://localhost:8000/>。首次加载需要连接 CDN 获取 Three.js ES modules。拖动旋转，滚轮缩放；界面可恢复参考机位、启用缓慢旋转，并切换三维、构图分析与并排模式。

## img2threejs 工作流记录

本次按 img2threejs 的分阶段方法处理核心物体：

1. **Structure** — 从参考图提取旋转对称轮廓，使用 LatheGeometry 重建开口球形缸体；单图不可见的背面依据旋转对称性推断。
2. **Proportion** — 先锁定 3:4 摄影构图、鱼缸与桌面的尺度关系，再加入桌、墙、帘。
3. **Material** — 分离缸体、双层卷口和厚底；玻璃使用 transmission、IOR、thickness 与 attenuation。泡罩包装由金属薄板和独立凸起几何组成。
4. **Light** — 左侧大尺寸冷白面积光配合低强度补光，控制阴影对比与玻璃边缘高光。
5. **Match** — 默认使用 26° 视场（约 70mm 全画幅等效）的参考机位，并提供构图分析对照。

> 安装说明：目标仓库 `https://github.com/img2threejs/img2threejs.git` 在当前执行环境被网络代理以 HTTP 403 拒绝，因此无法把其包文件写入项目。实现仍严格依照用户指定的 img2threejs 阶段质量流程，并在网络恢复后可用 `git clone` 复核工具说明。Three.js 同样以浏览器 CDN ES module 方式使用，避免提交第三方构建产物。

## GitHub Pages

1. 将仓库推送到 GitHub。
2. 在 **Settings → Pages → Build and deployment** 选择 **Deploy from a branch**。
3. 选择目标分支和 `/ (root)` 后保存。
4. 所有项目资源使用相对路径；Pages 能直接托管，不需要构建命令。

## 推断范围

- 鱼缸背面、桌子画面外结构和泡罩背面在单张参考图中不可见，分别依照旋转对称、常规抽屉桌结构和薄片厚度进行推断。
- 窗帘以多层细分平面概括褶皱；这是轻量实时表达，不是布料仿真。
