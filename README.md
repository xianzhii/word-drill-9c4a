# 考研英语单词背诵 · 背诵刷题（PWA）

把单文件版《考研英语单词背诵版 v3》包装成可安装的 PWA：用 iPhone Safari 打开网址后「添加到主屏幕」，即可获得独立图标、全屏无地址栏、离线可用的 App 形态体验。纯静态站点，无后端、无依赖，可直接托管在 GitHub Pages。

- 词库：李明朗《如鱼得水版》考研英语深度记忆核心词，共 **2001 词**
- 功能：分页背诵 · 拼写训练 · 四选一测试 · 记忆管理（已掌握 / 需复习 / 未掌握）
- 进度保存在浏览器本地（localStorage），关掉页面不丢；与服务器无关，不上传任何数据

## 目录结构

```
word-pwa/
├── index.html                 # 应用主体（单文件，含全部数据与交互逻辑）
├── manifest.webmanifest       # PWA 应用清单（名称、图标、standalone 显示模式）
├── sw.js                      # Service Worker，负责离线缓存
├── icons/
│   ├── apple-touch-icon-180.png   # iOS 主屏幕图标（180×180）
│   ├── icon-192.png               # Android/Chrome 图标（192×192，any）
│   ├── icon-512.png               # 高清图标（512×512，any）
│   ├── icon-192-maskable.png      # maskable 版（192×192，内容留安全边距）
│   └── icon-512-maskable.png      # maskable 版（512×512，内容留安全边距）
├── README.md
└── 部署说明.md                 # 一步步的托管 + 添加到主屏幕教程
```

## 本地预览

Service Worker 只在 `http(s)://` 下生效（`file://` 直接打开不会注册，属正常现象），因此本地调试建议起一个静态服务：

```bash
cd word-pwa
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080/
```

## 部署到 GitHub Pages

1. 在 GitHub 新建公开仓库（如 `kaoyan-words`），把本目录内**全部文件**（含 `icons/` 子目录）上传到仓库根目录
2. 仓库 → Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`，目录 `/(root)`，保存
3. 1～2 分钟后访问 `https://<用户名>.github.io/<仓库名>/`
4. iPhone 用 Safari 打开该网址 → 分享 → 添加到主屏幕

详细图文步骤见 [部署说明.md](部署说明.md)。

> 所有资源引用都是相对路径（`./index.html`、`sw.js`、`icons/...`），因此部署在 `https://xxx.github.io/仓库名/` 这样的子路径下也能正常工作，不需要改任何代码。

## 离线机制

- `sw.js` 安装时预缓存 `index.html`、`manifest.webmanifest` 与 5 个图标，安装完成即接管页面
- 后续请求走「缓存优先」：命中缓存直接返回，未命中才走网络并回填缓存
- 导航请求（直接打开或刷新页面）一律回退到缓存的 `index.html`，因此飞行模式下也能正常打开使用
- 激活时自动清理本应用的旧版本缓存

## 更新内容后如何让用户拿到新版

1. 修改 `index.html` 内容
2. 把 `sw.js` 里的 `CACHE_NAME` 版本号 +1，例如 `kaoyan-words-pwa-v1.0-r1` → `kaoyan-words-pwa-v1.0-r2`
3. 重新上传覆盖仓库文件
4. 手机上打开应用，**下拉刷新一到两次**（或彻底关闭再从主屏幕打开）即更新

只改 `index.html` 而不升 `CACHE_NAME` 会导致仍加载旧缓存内容。

## 兼容性

- iPhone / iPad：Safari 14+（`添加到主屏幕` 需用 Safari，微信、QQ、Chrome 内置浏览器看不到该选项）
- Android：Chrome 支持安装提示
- 桌面：Chrome / Edge / Safari 正常使用，小屏样式仅作用于 ≤640px 宽度，桌面布局不变
