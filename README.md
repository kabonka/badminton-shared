# 羽球双打轮转 · 共享版

网页 + 零依赖 Node 后端，多人**实时填写同一份**赛事数据（选手 / 对阵 / 比分 / 排名）。
权限模型：**全员可改**——任何拿到网址的人都能填，数据存在后端 `data.json`，所有人看到同一份。

前端逻辑（调度算法、计分、蝴蝶图排名、S/A/B 等级、每人明细）与原单机版完全一致；
差别只在存储：本版优先连后端，连不上会自动退回「本机模式」（localStorage）。

## 一键部署到 Railway（推荐：固定网址，免费试用无需信用卡）

1. 浏览器开 https://railway.com → **Login** → 选 **GitHub**（用 `kabonka` 登录，跳过邮箱验证）
2. 进 Dashboard → **New Project** → **Deploy from GitHub repo**
3. 选 **`kabonka/badminton-shared`**（列表为空就贴 `https://github.com/kabonka/badminton-shared`；或 Configure GitHub App 授权）
4. 点 **Deploy Repo**，等 1–2 分钟显示为 **Online**
5. 点服务卡片 → **Settings** → **Public Networking** → **Generate Domain**
6. 拿到 `https://<name>.up.railway.app` 即为**固定网址**，发给球友即可

打开后点「**载入默认名单**」即生成 13 人赛事。任何人开同一网址看到同一份数据，约 5 秒自动同步。

> 免费试用 30 天 / $5 额度，之后约 $1/月；试用阶段**无需信用卡**（Railway 官方）。
> 实例重启会清空 `data.json`，重要赛事用页面「导出 JSON」备份、「导入」恢复。

## 运行（本机 / 局域网）

```bash
cd shared
node server.js          # 需 Node 16+，无需 npm install
```

打开 http://localhost:3000 。手机连同一 Wi-Fi 开 `http://<电脑IP>:3000` 即可共用同一份数据。

## 让朋友在微信里也能用（不在同一 Wi-Fi）

1. **Railway（固定网址）**：见上，最省事。
2. **内网穿透（零部署）**：装 `cloudflared`，执行 `cloudflared tunnel --url http://localhost:3000`，
   拿到 `https://xxx.trycloudflare.com` 发微信即可（需本机常开，网址每次重连会变）。
3. **Render 一键部署**：[Deploy to Render](https://render.com/deploy?repo=https://github.com/kabonka/badminton-shared)
   （注意：Render 免费档需绑卡，台胞证/邮箱验证可能受阻）。
4. **自有服务器 / VPS**：把 shared 目录丢上去跑 `node server.js`，或用 pm2 守护。

> ⚠️ 微信内建浏览器会拦截 `*.up.railway.app` 与 `*.trycloudflare.com`：
> 让球友**长按网址 → 复制 → 用外部浏览器（Chrome / Safari）打开**即可正常使用。
> 若要微信内直接点开，需自购域名绑定 Railway（Settings → Custom Domain）或改用中国主机。

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
