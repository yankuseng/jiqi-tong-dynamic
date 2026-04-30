# 济企通动态版 - 济南求职避坑指南

> 济企通动态网站，支持用户投稿、AI预审 + 人工复核机制。

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel (免费)
- **通知**: 飞书 Webhook

## 快速开始

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 创建新项目
2. 获取 Project URL 和 `service_role` API Key
3. 在 SQL Editor 中运行 `supabase/migrations/001_initial_schema.sql`

### 2. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

### 3. 配置飞书 Webhook

1. 在飞书群中添加"自定义机器人"
2. 复制 Webhook URL 到环境变量
3. 机器人会自动发送审核通知卡片

### 4. 部署

```bash
# 本地开发
npm install
npm run dev

# 部署到 Vercel
# 连接 GitHub 仓库，Vercel 会自动部署
```

## 功能说明

### 用户投稿流程

```
用户提交点评
    ↓
AI预审（检测XSS/手机号/微信号/脏话）
    ↓
├── 风险 < 70% → 直接发布
└── 风险 >= 70% → 飞书通知颜丙全 → 人工审核
```

### 审核管理

访问 `/admin/review` 管理待审核队列。

飞书通知卡片包含"通过"和"拒绝"按钮，可直接操作。

## 目录结构

```
src/
├── app/
│   ├── page.tsx                    # 首页
│   ├── companies/
│   │   ├── page.tsx               # 企业列表
│   │   └── [id]/page.tsx          # 企业详情
│   ├── submit/page.tsx             # 投稿表单
│   ├── admin/review/page.tsx       # 审核队列
│   └── api/
│       ├── reviews/
│       │   ├── submit/route.ts     # 提交点评API
│       │   └── approve/route.ts    # 审核操作API
│       └── admin/queue/route.ts    # 队列查询API
├── lib/
│   └── supabase.ts                 # Supabase客户端
└── app/globals.css                 # 全局样式
```

## 数据库表

| 表名 | 说明 |
|------|------|
| companies | 企业信息 |
| reviews | 已发布的点评 |
| review_queue | 待审核队列 |

详见 `supabase/migrations/001_initial_schema.sql`

## 下一步

- [ ] 添加历史数据迁移脚本
- [ ] 添加搜索功能
- [ ] 添加用户系统（可选）
