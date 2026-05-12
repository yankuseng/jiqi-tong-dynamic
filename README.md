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

### 用户端

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 济南企业列表，支持搜索和行业筛选 |
| 企业详情 | `/companies/[id]` | 企业评分、点评、基础信息 |
| 投稿 | `/submit` | 用户提交对企业的点评 |

### 管理后台

| 页面 | 路径 | 说明 |
|------|------|------|
| 数据概览 | `/admin` | 企业数、点评数、待审核数量统计 |
| 企业管理 | `/admin/companies` | 企业列表、搜索、认证状态管理 |
| 申诉处理 | `/admin/appeals` | 企业申诉审核，通过/驳回操作 |
| 点评管理 | `/admin/reviews` | 所有点评列表，单删/批量删除 |
| 审核队列 | `/admin/review` | AI预审高风险内容人工复核 |

### 投稿审核流程

```
用户提交点评
    ↓
AI预审（检测XSS/手机号/微信号/脏话）
    ↓
├── 风险 < 70% → 直接发布
└── 风险 >= 70% → 飞书通知 → 人工审核 → 通过/驳回
```

申诉流程：

```
用户发布点评
    ↓
企业发起申诉 → 进入 appeals 表
    ↓
管理员审核 → 通过(点评上链) / 驳回(维持原状)
```

## 目录结构

```
src/
├── app/
│   ├── page.tsx                      # 首页
│   ├── companies/
│   │   ├── page.tsx                  # 企业列表
│   │   └── [id]/page.tsx             # 企业详情
│   ├── submit/page.tsx               # 投稿表单
│   ├── admin/
│   │   ├── page.tsx                  # 数据概览仪表盘
│   │   ├── companies/page.tsx        # 企业管理
│   │   ├── appeals/page.tsx          # 申诉处理
│   │   ├── reviews/page.tsx          # 点评管理
│   │   └── review/page.tsx           # 审核队列
│   └── api/
│       ├── reviews/
│       │   ├── submit/route.ts       # 提交点评 + AI预审
│       │   └── approve/route.ts      # 审核操作（通过/拒绝）
│       ├── admin/
│       │   ├── stats/route.ts        # 仪表盘统计
│       │   ├── companies/route.ts    # 企业管理 CRUD
│       │   ├── appeals/route.ts     # 申诉列表 + 处理
│       │   ├── reviews/route.ts      # 点评列表查询 + 删除
│       │   └── queue/route.ts        # 审核队列查询
│       ├── companies/route.ts        # 企业列表公开 API
│       └── seed/route.ts             # 测试数据填充
├── lib/
│   └── supabase.ts                   # Supabase 客户端
└── app/globals.css                   # 全局样式
```

## 数据库表

| 表名 | 说明 |
|------|------|
| `companies` | 企业信息（名称、行业、员工规模、评分、认证状态）|
| `reviews` | 已发布的点评（关联企业，含内容、加班、薪资情况）|
| `review_queue` | AI预审高风险待复核队列 |
| `appeals` | 企业申诉记录（关联 review，状态：pending/approved/rejected）|

**appeals 建表 SQL：**

```sql
CREATE TABLE appeals (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending / approved / rejected
  created_at TIMESTAMP DEFAULT NOW()
);
```

完整表结构见 `supabase/migrations/001_initial_schema.sql`

## 环境变量清单

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目地址 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | 公开 API Key（浏览器端用）|
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | 服务端 Key（API 路由用）|
| `FEISHU_WEBHOOK_URL` | ✅ | 飞书机器人 Webhook |
| `NEXT_PUBLIC_SITE_URL` | ❌ | 站点地址（默认 Vercel 域名）|

## 部署说明

Vercel 部署后会自动拉取 GitHub 仓库，每次 push 到 `main` 分支即触发自动部署。

若 `.env.local` 变更，需在 Vercel Dashboard → Settings → Environment Variables 中更新，**重新部署**后生效。

---

<!-- env update: 2026-05-12 08:42:50 -->
