# 聚浪 ClubMatch

> AI 驱动的高校社团匹配与招新平台。学生输入技能、MBTI 性格和专业方向，系统智能推荐最适合的社团；社团管理员拥有完整的招新后台，覆盖简历筛选、面试安排到录取通知全流程。

**🔗 线上体验：[clubmatch.vercel.app](https://clubmatch.vercel.app)**（目前面向中国传媒大学 Beta 测试）

---

## 功能特性

### 学生端
| 功能 | 说明 |
|------|------|
| 🤖 AI 智能匹配 | 综合分析技能标签、MBTI 性格、个人简介关键词与专业方向，生成 0–100 匹配分，推荐最适合的社团 |
| 🃏 滑动浏览 | 类 Tinder 卡片式界面，向右滑动申请、向左滑动跳过，支持搜索与分类筛选 |
| 📋 一表多投 | 填写一份个人档案，即可同时向多个社团投递申请 |
| 📊 进度追踪 | 实时查看各社团申请状态（待审核 / 面试 / 录取 / 未通过） |
| 💬 直接沟通 | 与社长直接消息互动，接收面试通知 |
| 👤 个人主页 | 管理 MBTI、技能标签、专业、个人简介 |

### 管理员端（社长）
| 功能 | 说明 |
|------|------|
| 📥 申请管理 | 统一查看所有申请人信息，按状态筛选 |
| 🗓️ 面试安排 | 设定面试时间与地点，自动同步至学生端 |
| 📈 数据看板 | 申请总数、通过率等关键指标一览 |
| ✅ 一键决策 | 直接在表格中更新录取状态 |

---

## 技术栈

**前端**
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3** · **Radix UI**（无障碍组件库）· **Lucide React**
- 移动端优先响应式设计，兼顾桌面端

**后端 / 数据库**
- **Supabase**（PostgreSQL）— Schema 完整设计，含 RLS 行级权限策略
- 支持 JSONB 灵活字段、GIN 索引加速技能标签匹配、pg_trgm 模糊搜索
- 枚举类型规范化申请状态（`pending / interview / accepted / rejected`）

**AI 匹配算法**（客户端）
- Bio 关键词分组评分（16+ 兴趣类别）
- MBTI 16 型性格匹配
- 技能标签集合重叠计算
- 专业方向相关性加权

---

## 本地运行

```bash
# 1. 克隆项目
git clone https://github.com/xinyan0809/ClubMatch.git
cd ClubMatch

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

> 目前使用 Mock 数据与 localStorage 模拟认证，无需配置环境变量即可运行。

**内置测试账号：**
- 学生端：用户名 `student1`，密码 `password123`
- 管理员端：用户名 `admin1`，密码 `password123`

---

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 落地页（公开）
│   ├── login/                # 登录 / 注册
│   ├── (main)/               # 学生端受保护路由
│   │   ├── home/             # 首页：面试日程 + 推荐
│   │   ├── discover/         # 社团发现（卡片滑动）
│   │   ├── messages/         # 消息中心
│   │   └── profile/          # 个人资料
│   └── admin/                # 管理员招新后台
├── components/
│   ├── AIRecommendationModal.tsx   # AI 匹配核心逻辑
│   ├── AuthGuard.tsx               # 路由鉴权
│   ├── discover/                   # 社团卡片、筛选、搜索
│   └── admin/                      # 申请表格、指标卡片
├── data/
│   ├── clubs.ts              # 18 个真实社团数据（中国传媒大学）
│   └── applicants.ts         # Mock 申请人数据
└── database/
    ├── schema.sql             # 完整 PostgreSQL 表结构
    └── queries.sql            # 常用查询示例
```

---

## 数据库设计

```
users ──< applications >── clubs   （多对多，含状态枚举与面试时间）
clubs ── club_categories           （分类：文化体育 / 学术科技 / 创新创业…）
users.skills[]  ←─ GIN 索引       （数组字段，加速技能匹配查询）
```

RLS 策略保证多租户隔离：学生只能查看自己的申请，社长只能管理本社团数据。

---

## 当前状态

- ✅ 完整前端 UI（落地页、登录、学生端、管理员端）
- ✅ AI 匹配算法（客户端实现）
- ✅ PostgreSQL 数据库 Schema 与 RLS 权限策略
- 🔄 Supabase 后端接入中
- 🔄 实时消息功能开发中
