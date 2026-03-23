# LoveStory ❤️

![React](https://img.shields.io/badge/React-19.0-blue?logo=react&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=fff)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwindcss&logoColor=fff)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=fff)

**LoveStory** 是一个专为情侣设计的私密爱情时光机与数字纪念册。
它采用极其轻量的前后端分离架构，但通过巧妙的工程设计，最终能合并为单一服务端进程部署。所有的珍贵回忆、照片视频、纪念日与专属标签，均被安全、结构化地永久保存在你自己的服务器上。

---

## 🌟 核心特性

- **🔒 私密双重锁**
  - **访问锁**：进入系统必须校验主密码（`MAIN_PASSCODE`）。
  - **写入锁**：添加、编辑或删除记忆时需要额外的安全层（`ADD_PASSCODE`）。
  - 超时保护：密码状态自动维持，超时需重新验证。
- **📖 时光轴与相册瀑布流**
  - 精美的双语化（中/英）响应式界面，适配桌面端与移动设备。
  - 支持多图轮播、全屏媒体预览（支持网络链接或本地无损上传）。
  - 基于录入日期的自动倒计时/已过天数结算。
- **🏷️ 全动态的精细操控**
  - 支持建立无上限的自定义专属标签（如：旅行、日常、纪念日、争吵、和解...）。
  - 动态个人资料板（双方昵称、专属主页头像及共同纪念日维护）。
- **🛠️ 极简的数据模型**
  - **零数据库依赖**：所有数据实时无感落盘至本地 `data.json` 以及 `uploads/` 文件夹。
  - 数据迁移、备份或在服务器之间迁移仅仅只需要复制这两个文件。

---

## 🧰 技术栈概览

- **前端核心**：采用 **React 19** 构建原生级别的响应式组件树，并使用 **Vite 6** 执行极致性能的热重载以及编译。
- **视觉及动效**：基于原子化 CSS 引擎 **TailwindCSS 4** 实现精准的响应式布局，配合 **Framer Motion** 实现高级微交互及全屏画廊弹窗，以及 **Lucide React** 提供全站的无极矢量图标集。
- **后端服务**：依靠纯粹的 **Node.js (Express)** 接管所有本地 API 与静态分发路由，使用 **Multer** 处理物理文件无损保存。

---

## 🚀 启动与部署

### 1. 本地开发 (Development)
**系统环境要求**：Node.js 18.0 或更高版本。

LoveStory 使用 Vite (React) 提供极致的前端体验，后台依托 Node.js (Express)：

```bash
# 安装所有的前端和后端依赖
npm install

# 复制环境变量模板并根据需要修改
cp .env.example .env

# 拉起双端热重载服务（前端监听 3000，后端监听 3001）
npm run dev
```

### 2. 构建与生产部署 (Production)
本程序的极简之道在于——**一套代码可以在同一个端口原生兼顾静态页面和 API 接口**，极其适合放入服务器（VPS、云服务器或轻量应用服务器）。

```bash
# 1. 在本地或 CI 平台执行编译，这会将 React 组件打包成静态文件进入 /dist 目录
npm run build

# 2. 将整个项目目录（只需包含 dist, server.js, package.json 以及 .env，不带 node_modules）上传至服务器

# 3. 在服务器端安装生产依赖
npm install --production

# 4. 运行服务（支持所有的 SPA 路由回退，由后端接管）
node server.js
# 建议使用 pm2 守护进程： pm2 start server.js --name "LoveStory"
```

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
如果你的服务器上使用 Nginx 作为 Web 服务器，并且你希望通过子路径（例如 `https://yourdomain.com/lovestory/`）或者主域名直接访问它，可以通过以下规则将外部流量桥接到本地的 `3001` 端口：

**作为主域名根目录直接访问 (`/`)：**
```nginx
server {
    listen 80;
    server_name yourdomain.com; # 替换为你的域名

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

> **🔒 隐私警告**：强烈推荐使用 **Cloudflare R2** 等 S3 兼容服务，因为它是私有的，且每月有免费 10GB 额度和无限下载流量。**坚决不推荐使用 Imgur** 保存情侣隐私相片，因为 Imgur 上传均是公网可见且受其审查。

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
*重启 Node.js 服务后生效。所有的新媒体将直接由服务端中转流片到 R2 桶内并返回 CF CDN 链接。*

---

## 📂 目录与架构

```text
LoveStory/
├── data.json              # 核心数据库文件（自动生成，持久化所有内容及用户设置）
├── uploads/               # 所上传的媒体图片/视频附件
├── server.js              # Node.js 后端主服务（API 响应、文件处理、静态托管）
├── src/                   # React 源码域
│   ├── App.tsx            # 全局路由级协调器
│   ├── components/        # UI 基础积木 (TopNav, Passcode, Keypad, etc.)
│   ├── screens/           # 全尺寸的业务页面 (Timeline, Album, Profile, Settings)
│   ├── utils/             # 高级工具集 (i18n 多语言映射, Constants)
│   ├── types.ts           # TypeScript 全局数据模型
│   └── index.css          # Tailwind 基础注入点及全局原生覆盖
```

## 💾 数据备份与灾难恢复

因为本系统秉持着“零数据库依赖”的开发原则，它不需要任何诸如 MySQL 或 MongoDB 等外部庞杂数据库服务。

1. **备份**：只需要定期把项目里的 `data.json` 和你上传过媒体的 `uploads/` 这两个归档件压缩进本地或者推到异地（云端等），你的爱情数字资产就实现了完整隔离和 100% 安全备份。
2. **极速恢复**：要在全新的机器或系统上恢复应用，在新拉取的框架代码下只要执行一下 `npm install --production`，再把你备份好的那两个核心资产覆盖进去，立刻就能 0 差异无缝启动（别忘了放 `.env`）。
3. **出厂重置**：如果想彻底推翻重来清空所有的历史记忆，删掉 `data.json` 然后重新执行一下 `node server.js` 启动命令即可，系统会自动帮你重构基础模型。

## 💖 寄语

> *"每一个爱情故事都很美，但我们的故事是我最喜欢的。"*

用现代技术留住点滴。无需第三方的订阅费，不用担心隐私审核或数据丢失。只要这台服务器还在，你们的故事就永远存在于赛博空间中。
