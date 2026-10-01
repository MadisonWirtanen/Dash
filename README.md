# Dash

一个简洁、现代的个人服务导航站，专为 **Cloudflare Pages** 部署设计。

本项目把真实服务网址放在 Cloudflare Pages 的构建环境变量中，而不是提交到 GitHub。每次部署时，`scripts/build.mjs` 会读取环境变量并生成 `dist/config.js`，最终仍然是纯静态前端。

## 功能

- 纯 HTML + CSS + JavaScript，无前端框架、无数据库
- 卡片式服务入口，桌面/平板/手机响应式
- 分类自动生成、分类筛选、即时搜索
- 深色/浅色主题，自动跟随系统并记住选择
- 真实服务地址通过 Cloudflare Pages 环境变量维护
- 构建阶段自动校验 JSON、必填字段和 URL
- GitHub 仓库不保存真实链接

## Cloudflare Pages 部署

在 Cloudflare Dashboard 中：

```text
Workers & Pages
→ Create application
→ Pages
→ Import an existing Git repository
→ MadisonWirtanen/Dash
```

构建参数：

| 项目 | 值 |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `node scripts/build.mjs` |
| Build output directory | `dist` |
| Root directory | 留空 |

项目没有 npm 依赖，不需要运行 `npm install`。

## 环境变量

进入 Pages 项目的：

```text
Settings
→ Environment variables
```

支持以下变量：

| 变量 | 必需 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `DASH_LINKS` | 是（不填则为空导航） | `[]` | 服务卡片列表 |
| `DASH_SITE_TITLE` | 否 | `Dash` | 页面标题 |
| `DASH_DESCRIPTION` | 否 | `把常用服务放在一个安静、好找的地方。` | 首页说明 |
| `DASH_FOOTER` | 否 | `Dash · Personal Navigation` | 页脚文字 |

通常你只需要维护 `DASH_LINKS`。

## DASH_LINKS 格式

`DASH_LINKS` 必须是合法的 **JSON 数组**。

推荐格式：

```json
[
  {
    "title": "1Panel",
    "url": "https://panel.example.com",
    "description": "主服务器管理面板",
    "category": "服务器",
    "icon": "1P",
    "accent": "#2563eb",
    "badge": "常用"
  },
  {
    "title": "Uptime Kuma",
    "url": "https://status.example.com",
    "description": "服务状态监控",
    "category": "监控",
    "icon": "UK",
    "accent": "#059669"
  }
]
```

单行写法与上面完全等价：

```text
[{"title":"1Panel","url":"https://panel.example.com","description":"主服务器管理面板","category":"服务器","icon":"1P","accent":"#2563eb","badge":"常用"},{"title":"Uptime Kuma","url":"https://status.example.com","description":"服务状态监控","category":"监控","icon":"UK","accent":"#059669"}]
```

### 字段说明

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `title` | 是 | 卡片名称 |
| `url` | 是 | 完整 `http://` 或 `https://` 地址 |
| `description` | 否 | 卡片说明 |
| `category` | 否 | 分类；页面自动生成分类按钮 |
| `icon` | 否 | 1~3 个字符、中文或 Emoji |
| `accent` | 否 | CSS 颜色，如 `#2563eb` |
| `badge` | 否 | 标题旁的小标签，如“常用” |

最简配置：

```json
[
  {"title":"Server","url":"https://server.example.com"},
  {"title":"API","url":"https://api.example.com"}
]
```

## 修改或新增链接

以后不需要改 GitHub 代码：

1. 进入 Cloudflare Pages 项目。
2. 打开 `Settings → Environment variables`。
3. 编辑 `DASH_LINKS`。
4. 保存。
5. **重新触发一次部署**。

环境变量是在构建时读取的，因此只修改变量、不重新部署，线上页面不会变化。可以重新部署最近一次 Deployment，也可以推送一个新 commit 来触发构建。

### Production 与 Preview

建议把真实 `DASH_LINKS` 只配置在 **Production** 环境。Preview 环境可以留空或使用测试链接，避免预览部署自动拿到生产服务列表。

## 常见 JSON 错误

构建脚本会主动检查 `DASH_LINKS`。常见错误包括：

- 使用中文引号 `“ ”`，JSON 必须使用英文双引号 `"`
- 最后一项后面多了逗号
- 最外层不是 `[` 和 `]`
- 某项缺少 `title` 或 `url`
- URL 没有完整的 `http://` 或 `https://`

错误：

```text
{'title':'Panel','url':'panel.example.com'}
```

正确：

```json
[{"title":"Panel","url":"https://panel.example.com"}]
```

## 本地构建

不需要安装依赖，只需要 Node.js。

PowerShell：

```powershell
$env:DASH_LINKS = '[{"title":"Example","url":"https://example.com","category":"测试","icon":"EX"}]'
node .\scripts\build.mjs
python -m http.server 8080 -d dist
```

Bash / zsh：

```bash
export DASH_LINKS='[{"title":"Example","url":"https://example.com","category":"测试","icon":"EX"}]'
node scripts/build.mjs
python3 -m http.server 8080 -d dist
```

然后访问 `http://localhost:8080`。

## 文件结构

```text
Dash/
├─ index.html
├─ README.md
├─ .env.example
├─ .gitignore
├─ assets/
│  ├─ app.js
│  ├─ styles.css
│  └─ favicon.svg
└─ scripts/
   └─ build.mjs
```

构建时生成：

```text
dist/
├─ index.html
├─ config.js
└─ assets/
```

`dist/` 已加入 `.gitignore`，不会提交到 GitHub。

## 安全说明

`DASH_LINKS` 能避免真实链接出现在 GitHub 仓库和 commit 历史中，但**不能把部署后的 URL 变成秘密**。浏览器必须知道跳转地址，因此能访问 Dash 页面的人仍可通过开发者工具查看最终 URL。

可以放：服务器面板、自建服务、管理后台、文档、监控、API 控制台的入口 URL。

不要放：密码、API Token、Access Token、Cookie、SSH 私钥、数据库密码、Cloudflare API Key 或其他真正的机密。

如果 Dash 本身也不希望公开访问，应该在 Cloudflare 侧增加访问控制，而不是在前端 JavaScript 中做“密码页”。

## GitHub Pages

本项目不包含 GitHub Pages 部署工作流，也不提供 GitHub Pages 部署方案。正式部署目标为 **Cloudflare Pages**。

## License

MIT License，详见 [LICENSE](./LICENSE)。
