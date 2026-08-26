# 羽球双打轮转 · 共享版

网页 + 零依赖 Node 后端，多人**实时填写同一份**赛事数据（选手 / 对阵 / 比分 / 排名）。
权限模型：**全员可改**——任何拿到网址的人都能填，数据存在后端 `data.json`，所有人看到同一份。

前端逻辑（调度算法、计分、蝴蝶图排名、S/A/B 等级、每人明细）与原单机版完全一致；
差别只在存储：本版优先连后端，连不上会自动退回「本机模式」（localStorage）。

## 运行（本机 / 局域网）

```bash
cd shared
node server.js          # 需 Node 16+，无需 npm install
```

打开 http://localhost:3000 。若要手机一起用，手机连同一 Wi-Fi，浏览器开
`http://<电脑IP>:3000`（启动日志会打印局域网地址）。**同一网址 = 同一份数据**。

## 让朋友在微信里也能用（不在同一 Wi-Fi）

后端必须有一个「公网可达」的地址。任选其一（都需要你自己的账号，纯前端无法绕过）：

1. **内网穿透（最快，零部署）**：装 `cloudflared`，在 shared 目录执行
   `cloudflared tunnel --url http://localhost:3000`，拿到一个 `https://xxx.trycloudflare.com`
   链接，直接发微信给球友即可。关掉命令链接失效。
2. **Render 一键部署（固定网址）**：
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/kabonka/badminton-shared)
   - 点按钮 → 用 GitHub 登录 Render（免费）→ 选 `badminton-shared` → 部署。
   - 约 1–2 分钟后获得固定网址，例如 `https://badminton-shared.onrender.com`。
   - ⚠️ Render 免费实例 15 分钟无访问会休眠，首次打开需等 30–50 秒冷启动；服务重启后 `data.json` 会重置（可用左下角「导出/导入 JSON」备份）。
3. **其它免费云平台**：Railway / Fly.io / PythonAnywhere 等，上传本目录并设启动命令
   `node server.js`、监听环境变量 `PORT`。平台会给一个固定公网网址。注册用邮箱即可，无台胞证限制。
3. **自有服务器 / VPS**：把 shared 目录丢上去跑 `node server.js`，或用 pm2 守护。

> 注意：本版 `CORS` 设为 `*`（允许任意来源），适合小圈子共用；若公网长期开放，
> 建议把 `server.js` 里的 `Access-Control-Allow-Origin` 改成你的固定域名，并加一道路由口令。

## 权限说明（全员可改）

- 任何人开网址都能改名单、生成对阵、填比分、删对阵——符合「多人同时填写」。
- 没有登录 / 防误删：任何拿到链接的人都能清空全部（左下角「清空全部」）。
- 若以后想要「只有组织者能改、其他人只读」，可加一个简单口令，告诉我即可加。

## 数据文件

- `data.json`：共享数据落盘处。备份就复制它；清掉它等于重置。
- 前端每 5 秒轮询后端，自动拾取他人刚做的改动（你正在打字时不重绘，防吞字）。

## 切回本机模式

不启动 `server.js`、直接双击 `index.html` 打开——前端连不上后端，会自动用浏览器本机存储，
行为与原来的 GitHub Pages 单机版相同。同一份 `index.html` 两种模式通吃。

## 与原单机版的关系

- `badminton_doubles.html`（GitHub Pages 上的）仍是单机版，互不干扰。
- 本目录 `index.html` 是「共享版前端」，多了后端同步；可单独部署，也可本地双击当单机用。
