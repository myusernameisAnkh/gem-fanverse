# GEMVERSE 棋遇宇宙

一个以 G.E.M. 邓紫棋的音乐为主题的非官方应援网站，适合课程设计展示与 GitHub Pages 部署。奶油白、葡萄紫与荧光黄构成视觉主色，真实舞台摄影与三款 AI 同人角色贯穿页面。

**无需 npm、Node.js 或构建步骤。网站入口是根目录的 `index.html`。**

## 已实现的功能

| 模块 | 功能 |
| --- | --- |
| 作品星球 | 12 首精选作品；按心情筛选；关键词搜索；本机收藏；作品详情；官方聆听入口；点击后加载官方 MV |
| 歌词共鸣 | 4 首作品的极短歌词摘句、手动轮换、出处链接；感想单独标注 |
| 时光轨迹 | 2008—2026 年的 14 个选编节点；按生涯阶段筛选；逐条附出处 |
| 舞台瞬间 | 6 帧真实现场照片；点击放大；前后切换；键盘左右键；作者与许可说明 |
| 应援实验室 | 可点亮的荧光棒；本机应援计数；按北京时间每日打卡 |
| 专属应援卡 | 3 种演出造型的 AI 同人角色；输入昵称；生成 1080 × 1350 PNG 图片 |
| 棋妙挑战 | 5 道选择题；即时解释与来源；最高分记录；下载电子徽章 |
| 留言星河 | 本机留言、颜色选择、删除、JSON 导出；区分示例与个人留言 |
| 共享留言 | 已集成可选的 giscus / GitHub Discussions 接口；填写自己仓库的公开配置后启用 |
| 基础体验 | 手机适配、折叠导航、浅色 / 深色主题、阅读进度、键盘操作、减少动态效果支持 |

## 最快部署到 GitHub Pages

1. 解压项目。在 GitHub 新建一个公开仓库，例如 `gem-fanverse`。
2. 把解压后 **`gem-fanverse` 文件夹里面的文件和目录** 上传到仓库根目录。仓库打开后应当直接看到 `index.html`、`styles.css`、`app.js` 和 `assets`，不要把 ZIP 或外层文件夹直接当作网页上传。
3. 在仓库的 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch**。
4. 分支选 **main**（或你实际使用的分支），目录选 **/(root)**，点击 **Save**。
5. 等待仓库的 Pages 部署完成，在该设置页点击 **Visit site**。通常地址是 `https://你的用户名.github.io/仓库名/`。

项目所有资源都使用相对路径，可以部署在仓库子路径下。更新文件并提交到选中的分支后，Pages 会重新发布。`.nojekyll` 是用于跳过 Jekyll 的空文件；若网页上传工具未显示它，仍请保留其余文件完整，或在仓库根目录新建该空文件。

官方说明：[选择发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [创建 GitHub Pages 网站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。核验于 2026-10-29。

## 留言的重要区别

**默认留言是本机演示模式**：存储在当前浏览器，其他同学看不到你的本机留言。它没有伪装成云端留言墙。

若想让同学和老师看见彼此的留言，请按 [共享留言设置指南](docs/shared-comments.md) 启用 giscus。它利用 GitHub Discussions 存储真实公共评论，发表需要 GitHub 登录，无需你运行服务器或填写私密密钥。本机留言与公共留言各自独立，**不会自动迁移或上传**。

## 本地预览

- 直接双击 `index.html`：可以浏览全部资料和图片，使用搜索、收藏、留言和小测验。
- **PNG 应援卡下载、共享留言和官方视频建议在 GitHub Pages 的 HTTPS 页面中使用。** 某些浏览器会限制 `file://` 页面读取图片到 Canvas，页面会给出提示。
- 如果电脑已安装 Python 3，也可在项目目录运行 `python scripts/preview.py`，然后打开 `http://localhost:8000/`。Windows 用户可以双击 `preview-windows.bat`。不需要安装任何 Python 第三方包。

## 文件结构

| 文件 / 目录 | 用途 |
| --- | --- |
| `index.html` | 页面结构、导航、表单、原生弹窗 |
| `styles.css` | 视觉样式、响应式布局、深色主题与减少动态效果 |
| `data.js` | 精选作品、歌词短摘、时间轴、照片与测验内容 |
| `app.js` | 搜索、收藏、留言、Canvas 导出、灯牌、测验等交互 |
| `config.js` | 可选的 GitHub 共享留言配置 |
| `assets/photos` | 下载到本地的原始舞台照片，避免依赖外链图床 |
| `assets/covers` | 公开作品封面，版权归原权利人 |
| `assets/art` | 3 款透明背景 AI 同人插画 |
| `assets/photo-credits.json` | 照片作者、原图、拍摄时间与许可元数据 |
| `assets/cover-credits.json` | 封面来源与权利说明 |
| `docs` | 共享留言指南、资料清单、插画提示词、课堂演示路线与验证报告 |
| `scripts` | 无依赖的本地预览与静态文件检查脚本 |

修改文字或作品时优先编辑 `data.js`，修改主题色优先编辑 `styles.css` 开头的 CSS 变量。添加歌曲时请使用唯一 `id`，添加真实来源，并检查对应封面文件存在。

## 数据、网络与素材

- 收藏、个人留言、应援次数、打卡、测验最佳成绩与主题保存在当前浏览器的 `localStorage`。清理浏览器数据会删除这些记录，隐私模式可能无法持久化。
- 默认不加载外部字体、统计脚本或共享评论。点击 MV 按钮才加载 YouTube 播放器；配置并启用 giscus 后才加载共享评论。
- 本地图片、主要样式与主要功能均包含在项目中。官方聆听、视频和共享评论需要网络，并受第三方平台、地区与账号条件影响。
- “12首”“6帧”是本站选编内容数量；应援次数是本机记录，均不是艺人完整作品总数或全网粉丝数据。
- 本站不提供完整歌曲文件、完整 MV 或完整歌词。资料节点与短摘附有出处，感想和推荐文案不冒充艺人原话。
- 照片按各自 Creative Commons 许可保留署名；封面不适用项目代码的 MIT 许可。三款同人插画的参考照片、提示词和单独许可见 [插画说明](docs/artwork-prompts.md)。素材权利不因课堂用途自动改变，具体署名与许可见 [素材与资料清单](docs/sources.md)。

## 课堂展示

建议先部署，再按 [5分钟展示路线](docs/classroom-demo.md) 操作。演示前在同一浏览器测试下载一次应援卡；如果不开共享留言，明确说明“这是浏览器本机数据持久化演示”。

代码：MIT。照片、封面、歌词与 AI 同人图像采用各自说明，见 `LICENSE` 与 `docs/sources.md`。
