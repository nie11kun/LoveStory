# LoveStory ❤️

![React](https://img.shields.io/badge/React-19.0-blue?logo=react&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=fff)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwindcss&logoColor=fff)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=fff)

**LoveStory** 是一个专为情侣设计的私密爱情时光机与数字纪念册。
它采用极其轻量的前后端分离架构，但通过巧妙的工程设计，最终能合并为单一服务端进程部署。所有的珍贵回忆、照片视频、纪念日与专属标签，均被安全、结构化地永久保存在你自己的服务器（或你自己的云存储桶）上。

---

## 🌟 核心特性

- **💞 温馨的首页**
  - 「我们已经在一起 N 天」大数字计数，配合跳动的爱心，以及最近照片叠成的拍立得。
  - 回忆数、照片数与距下个纪念日的天数一目了然。
  - **纪念日彩蛋**：周年当天和每满 100 天，会出现庆祝横幅与飘起的爱心。
- **🔒 私密双重锁**
  - **访问锁**：进入系统必须校验主密码（`MAIN_PASSCODE`）。
  - **写入锁**：添加、编辑或删除记忆时需要额外的安全层（`ADD_PASSCODE`）。
  - 超时保护：密码状态自动维持，超时需重新验证。电脑上可直接用键盘输入密码。
- **📖 时光轴与相册瀑布流**
  - 移动端优先的响应式界面（中/英双语），手机上是贯穿全篇的「红线」时间轴，桌面端是按时间从新到旧、逐行排列的瀑布流。
  - 支持多图轮播、全屏媒体预览（支持网络链接或本地无损上传），可用键盘浏览。
  - 底部悬浮导航栏，背景音乐开关位于顶栏。
- **⚡ 国内访问友好**
  - 上传照片时自动生成 WebP 缩略图，列表只加载缩略图，点开才加载原图。
  - 媒体文件与前端资源都带有长期缓存，再次打开基本秒开。
  - 字体随项目打包、由自己的服务器提供，不依赖 Google Fonts。
- **🏷️ 全动态的精细操控**
  - 支持建立无上限的自定义专属标签（如：旅行、日常、纪念日、争吵、和解...）。
  - 动态个人资料板（双方昵称、专属主页头像及共同纪念日维护）。
  - 上传、保存或删除失败时会有清晰的提示，照片不会悄悄丢失。
- **🛠️ 极简的数据模型**
  - **零数据库依赖**：所有数据实时落盘至本地 `data.json`，媒体文件存于 `uploads/` 或 S3/R2 云存储。
  - 数据迁移或备份只需要复制少量文件。

---

## 🧰 技术栈概览

- **前端核心**：**React 19** + **Vite 6**。
- **视觉及动效**：**TailwindCSS 4** 负责响应式布局，**Motion** 负责微交互与全屏画廊，**Lucide React** 提供图标。
- **字体**：Noto Serif SC（思源宋体）、Playfair Display、Plus Jakarta Sans，通过 **Fontsource** 打包进前端，中文字体按字符分片按需加载。
- **后端服务**：纯粹的 **Node.js (Express)** 接管 API 与静态分发；**Multer** 处理上传；**sharp** 生成缩略图；**AWS SDK** 对接 S3 / Cloudflare R2。

---

## 🚀 启动与部署

### 1. 本地开发 (Development)
**系统环境要求**：Node.js 18.0 或更高版本。

```bash
# 安装所有依赖（含构建工具）
npm install

# 复制环境变量模板并根据需要修改
cp .env.example .env

# 拉起双端热重载服务（前端监听 3000，后端监听 3001）
npm run dev
```

### 2. 生产部署 (Production)：本地构建，服务器只负责运行
前端在本地编译好，服务器上只运行 `server.js`，**不需要在服务器上构建**，非常适合低配置的 VPS / 轻量应用服务器。

依赖已经区分好：`dependencies` 里只有服务器运行需要的 5 个包（express、multer、dotenv、@aws-sdk/client-s3、sharp），React、Vite、字体等构建工具都在 `devDependencies` 里，服务器不会安装它们。

**① 本地构建**
```bash
npm run build
```

**② 拷贝到服务器项目目录的文件**

| 文件 / 目录 | 说明 |
|---|---|
| `dist/` | 构建好的前端（含字体文件） |
| `server.js` | 后端主服务 |
| `lib/` | 后端用到的缩略图工具（`server.js` 依赖它，缺少会无法启动） |
| `package.json`、`package-lock.json` | 服务器依赖清单 |
| `scripts/` | 可选，一次性维护脚本（见下文「为已有照片补生成缩略图」） |
| `.env` | 仅首次部署时需要 |

> ⚠️ **不要覆盖服务器上的 `data.json` 和 `uploads/`**，它们是你们的数据。
> ⚠️ **不要拷贝本地的 `node_modules/`**：sharp 带有按操作系统区分的二进制文件，Windows 上安装的版本无法在 Linux 上运行。

**③ 在服务器上安装运行依赖**（首次部署，或 `package.json` 有变化时）
```bash
npm ci --omit=dev
```
只会安装约 90 个包（约 43 MB）。sharp 会下载预编译好的二进制文件，不需要在服务器上编译。

**④ 启动 / 重启服务**
```bash
node server.js
# 或使用 systemd（见下一节）：sudo systemctl restart lovestory
```

**以后的日常更新**通常只需要：本地 `npm run build` → 拷贝 `dist/`、`server.js`、`lib/` → 重启服务。

### 3. Systemd 守护进程守护 (推荐)
如果你使用的是主流的 Linux 服务器（Ubuntu/CentOS/Debian），推荐使用原生 `systemd` 将 LoveStory 注册为开机自启的后台服务。
项目根目录已附带 `lovestory.service` 模板，请按需修改其中的**路径**后放入系统目录：

```bash
# 首先，查询当前环境下 Node.js 的绝对路径
which node
# 输出结果形如：/usr/bin/node 或者 /home/user/.nvm/versions/node/.../bin/node
# 此时你需要把 lovestory.service 文件里的 ExecStart 替换为这行真实的输出路径。

# 1. 复制服务模版到 systemd 目录
sudo cp lovestory.service /etc/systemd/system/

# 2. 编辑绝对路径 (WorkingDirectory 和 ExecStart 必须为你服务器的实际路径)
sudo nano /etc/systemd/system/lovestory.service

# 3. 重载 systemd 服务配置
sudo systemctl daemon-reload

# 4. 启动并设置开机自启
sudo systemctl start lovestory
sudo systemctl enable lovestory

# 5. 查看运行状态或日志
sudo systemctl status lovestory
journalctl -u lovestory -f
```

### 4. Nginx 反向代理配置 (可选)
如果你的服务器上使用 Nginx 作为 Web 服务器，可以通过以下规则将外部流量桥接到本地的 `3001` 端口：

**作为主域名根目录直接访问 (`/`)：**
```nginx
server {
    listen 80;
    server_name yourdomain.com; # 替换为你的域名

    # 允许上传较大的照片和视频（Nginx 默认只允许 1MB）
    client_max_body_size 200m;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 传递真实的用户 IP 和协议信息
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**作为子路径访问（例如 `/lovestory`）：**
```nginx
location ^~ /lovestory {
    client_max_body_size 200m;
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    
    # 将前端的静态资源及 API 请求统一转交
    proxy_set_header X-Real-IP $remote_addr;
}
```
*(注意：如果你使用子路径部署，Vite 在打包时需要在 `vite.config.ts` 指定 `base: '/lovestory/'` 才能正确加载静态资产。)*

> 💡 `server.js` 已经为 `/assets/` 下带哈希的文件（JS、CSS、字体）设置了一年的浏览器缓存，Nginx 无需额外配置。

---

## ⚙️ 环境配置 (.env)

项目目录下包含 `.env` 环境配置文件，核心功能均可直接在此掌控，修改后需重启 Node 服务。

```env
# Node 后端 API 及生产环境的前端监听端口
PORT=3001

# 本地开发时，Vite 的前端监听端口
VITE_PORT=3000

# 主访问密码（默认：1111）
VITE_MAIN_PASSCODE=1111

# 编辑/添加数据的写权限密码（默认：2222）
VITE_ADD_PASSCODE=2222

# 密码过期免登时间，默认 86400000 毫秒（24小时）
VITE_UNLOCK_EXPIRY_MS=86400000
```

---

## ☁️ 云对象存储扩展 (避免占用本地磁盘)

系统的 `/api/upload` 接口原生支持**无缝推流至兼容 S3 协议的云存储**（例如免费的 **Cloudflare R2**、AWS S3、腾讯云 COS 等），或者上传至 **Imgur** 免费图床。
只要在 `.env` 文件中配置了对应的参数，系统会自动剥离对本地 `uploads/` 文件夹的依赖，实现零本地占用！

> **🔒 隐私警告**：推荐使用 **Cloudflare R2** 等 S3 兼容服务，每月有免费 10GB 存储额度且下载流量不收费。**坚决不推荐使用 Imgur** 保存情侣隐私相片，因为 Imgur 上传均是公网可见且受其审查。

### 配置 Cloudflare R2 (推荐方案)的 `.env` 示例：
```env
# 你的 R2 Endpoint
S3_ENDPOINT=https://xxxxxx.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=你的_R2_AccessKey
S3_SECRET_ACCESS_KEY=你的_R2_SecretKey
S3_BUCKET_NAME=lovestory-media

# 提供对外的可访问域名 (支持绑定自己的域名在 CF 控制台)
S3_PUBLIC_DOMAIN=https://pub-xxxxxx.r2.dev
```

### ✨ 云端核心特性
1. **自动热迁移 (Auto-Migration)**：如果在已经有很多本地 `uploads/` 图包的老服务器上首次配置了 S3 参数，重启 Node 后，系统会在后台默默将所有本地图包自动上传到远端桶，并重写数据库，完成后自动删除本地冗余原件。
2. **内容去重**：文件以内容哈希命名（`media/<md5>.<扩展名>`），同一张照片重复上传只会存一份。
3. **智能云垃圾回收 (Cloud Garbage Collection)**：当你删除一条回忆，或在编辑时删掉某几张照片，系统会同时删除云桶里对应的原图与缩略图；仍被其他回忆引用的文件会被保留。
4. **Apple 全生态格式支持**：支持来自 iOS 设备的 `.MOV` / `.m4v` 及 HEVC 视频。

### ⚡ 缩略图与缓存（国内访问加速）
Cloudflare R2 在国内访问较慢，而手机原图动辄几 MB。为此：

- **自动缩略图**：上传 JPG / PNG / WebP 照片时，服务器会生成一张最宽 1200px 的 WebP 缩略图，存到 `media/thumbs/<md5>.webp`（通常只有原图的几十分之一大小）。时间轴、相册、头像都只加载缩略图，点开大图时先显示缩略图，原图下载完成后再替换。GIF 和视频不生成缩略图；缩略图缺失时会自动回退到原图。
- **长期缓存**：上传到 R2 的文件都会带上 `Cache-Control: public, max-age=31536000, immutable`。由于文件名就是内容哈希，内容不同文件名必然不同，所以可以放心长期缓存。
- **低配服务器友好**：sharp 被限制为单线程且不缓存图片，处理一张 1200 万像素照片约几十毫秒、内存约 60 MB。

#### 为已有照片补生成缩略图
在加入缩略图功能之前上传的照片，需要运行一次补生成脚本。它会读取 `data.json`，为其中引用的 R2 文件补上缓存头，并为照片生成缩略图。**脚本从不删除任何文件**，并且不加 `--apply` 时只预览、不做任何改动。

```bash
# 预览将要做的操作
npm run backfill-media

# 确认无误后执行
npm run backfill-media -- --apply
```

脚本只需要访问 R2，**不一定要在服务器上运行**。服务器配置较低时，可以把服务器上的 `data.json` 下载到本地，在本地项目目录中运行（本地 `.env` 里需要有 R2 配置）：

```bash
node scripts/backfill-media.js --apply --data /path/to/downloaded/data.json
```

脚本可以重复运行，已经处理过的文件会自动跳过。

#### Cloudflare 缓存规则（可选）
默认情况下 Cloudflare 不会缓存 R2 自定义域名上的文件（响应头显示 `cf-cache-status: DYNAMIC`）。可以在 Cloudflare 后台为它开启缓存：

1. 选择你的域名 → **Caching → Cache Rules → Create rule**。
2. 匹配条件：**Hostname equals `你的 R2 自定义域名`**。
3. **Cache eligibility** 选择「Eligible for cache」。
4. **Edge TTL** 选择「Use cache-control header if present」；**Browser TTL** 选择「Respect origin」。
5. 保存后再次访问某张图片，响应头中的 `cf-cache-status` 应变为 `HIT`。

> 注意：Cloudflare 免费版在中国大陆没有节点，此规则对国内访问的提升有限，主要的加速来自缩略图与浏览器缓存。

---

## 📂 目录与架构

```text
LoveStory/
├── data.json              # 核心数据库文件（自动生成，持久化所有内容及用户设置）
├── uploads/               # 未配置云存储时，上传的媒体文件保存在这里
├── server.js              # Node.js 后端主服务（API 响应、文件处理、静态托管）
├── lib/
│   └── thumbnails.js      # 缩略图生成与缓存设置（server.js 与维护脚本共用）
├── scripts/
│   └── backfill-media.js  # 一次性脚本：为已有 R2 文件补缩略图与缓存头
├── dist/                  # npm run build 的产物（前端页面、JS、CSS、字体）
├── src/                   # React 源码
│   ├── App.tsx            # 全局路由级协调器
│   ├── components/        # UI 组件（顶栏、底部导航、密码键盘、记忆卡片、图片、提示等）
│   ├── screens/           # 业务页面（Timeline, Album, Profile, Settings, 表单与详情）
│   ├── utils/             # 工具集（i18n 多语言、日期、媒体地址、常量、瀑布流分列）
│   ├── types.ts           # TypeScript 全局数据模型
│   ├── main.tsx           # 入口（同时引入本地字体）
│   └── index.css          # Tailwind 主题、配色与全局样式
└── lovestory.service      # systemd 服务模板
```

## 💾 数据备份与灾难恢复

因为本系统秉持着“零数据库依赖”的开发原则，它不需要任何诸如 MySQL 或 MongoDB 等外部数据库服务。

1. **备份**：
   - 定期备份服务器上的 `data.json`，再加上你的 `.env`。
   - 使用本地存储时，同时备份 `uploads/` 文件夹。
   - 使用 R2 / S3 时，照片和视频都在云存储桶里（`media/` 为原图，`media/thumbs/` 为缩略图）。如需离线备份，可以用 rclone 等工具同步整个存储桶。
2. **极速恢复**：在新机器上按「生产部署」的步骤放好文件并执行 `npm ci --omit=dev`，再把备份的 `data.json`（以及 `uploads/`）和 `.env` 放回项目目录，启动即可。缩略图丢失也没关系，可以用补生成脚本重新生成。
3. **出厂重置**：如果想彻底推翻重来清空所有的历史记忆，删掉 `data.json` 然后重新执行一下 `node server.js` 启动命令即可，系统会自动帮你重构基础模型（云存储桶中的文件不会被自动删除）。

## 💖 寄语

> *"每一个爱情故事都很美，但我们的故事是我最喜欢的。"*

用现代技术留住点滴。无需第三方的订阅费，不用担心隐私审核或数据丢失。只要这台服务器还在，你们的故事就永远存在于赛博空间中。
