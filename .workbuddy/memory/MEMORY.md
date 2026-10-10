# yythlss.github.io 项目记忆

## 项目定位
- 个人 GitHub Pages 主页：`https://yythlss.github.io`
- 当前风格：星露谷（Stardew Valley）像素农场主题。
- 用途：集中展示嵌入式系统、智能硬件、电路设计与 AI 项目。

## 关键文件（当前三栏 HTML/CSS 方案）
- `index.html`：三栏主页结构；顶部栏（头像/搜索/时钟/star）、横幅、左导航、中项目、右贡献图+动态、底部村民行。
- `github-stardew.css`：主样式；游戏真实配色、`MenuTiles` 九宫格贴图边框、Zpix 像素字体、响应式布局。
- `github-gba.js`：GitHub API 拉取、分类、动态、贡献图、村民台词等逻辑（保留旧名但内容已重写）。
- `sprites.js`：作物与村民素材坐标映射（`crop()` 支持自定义宽高）。
- `config.local.js`：本地 GitHub token 配置（被 `.gitignore` 忽略，绝不提交）。
- `stardew/assets/`：真实游戏素材（立绘、作物、MenuTiles、textBox、panel-frame、横幅、Zpix 子集字体等）。
- 旧文件（保留但不再引用）：`github-gba.css`、`github-firered.css`、`github-real.css`、`sprites-stardew.js`。

## 仓库分类
- 嵌入式（cauliflower / 花椰菜）
- 电路（pumpkin / 南瓜）
- AI（starfruit / 星之果实）
- 前端（sunflower / 向日葵）
- 工具（hotpepper / 辣椒）
- 其他（parsnip / 防风草）

## 注意事项
- GitHub API 未认证限额 60 次/小时；在 `config.local.js` 中配置 `window.GITHUB_TOKEN` 可提升到 5000 次/小时。
- `config.local.js` 已加入 `.gitignore`，绝不会被提交；公开部署前不要泄露 token。
- 真实游戏素材（贴图/字体）来自用户本地购买的游戏/开源字体，公开部署到 GitHub Pages 可能存在版权风险，建议仅本地或私有使用。
- 部署前通常需要用户确认再执行 git commit/push。
