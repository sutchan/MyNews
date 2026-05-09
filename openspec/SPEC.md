# 今日时事 - 项目规范 v2.0.0

## 1. 项目概述

### 1.1 项目信息

| 字段 | 内容 |
|------|------|
| 项目名称 | 今日时事 (MyNews) |
| 当前版本 | v2.0.0 |
| 描述 | 现代化简约的新闻聚合平台 |
| 技术栈 | Nuxt 4.0 + Vue 3.5 + TypeScript 5.6 + TailwindCSS 4.1 |
| 许可证 | MIT |

### 1.2 项目目标

实时聚合多源资讯，掌握天下动态。整合来自社交媒体、科技资讯、金融市场和娱乐等多个热门源的信息。

## 2. 代码规范

### 2.1 文件头注释（强制要求）

**所有代码文件第一行必须是单行注释**，格式如下：

```typescript
// <root_relative_path> <version>
// 示例：app/api/news.ts v2.0.0
```

```vue
<!-- app/pages/index.vue v2.0.0 -->
<!-- 示例：app/components/AISummary.vue v2.0.0 -->
```

**路径计算规则**：
- 从 `/workspace` 开始的相对路径
- Vue 文件：`<root_relative_path>.vue v2.0.0`
- TypeScript 文件：`<root_relative_path>.ts v2.0.0`

**示例**：
- `/workspace/app/pages/index.vue` → `<!-- app/pages/index.vue v2.0.0 -->`
- `/workspace/app/api/news.ts` → `// app/api/news.ts v2.0.0`

**重要**：
- ✅ 正确：`<!-- app/components/AISummary.vue v2.0.0 -->`
- ❌ 错误：`// app/components/AISummary.vue v2.0.0` (Vue 文件不能用双斜线)

### 2.2 版本控制 (SemVer 2.0.0)

#### 版本号格式
遵循语义化版本规范：`主版本.次版本.修订号`

- **主版本 (MAJOR)**：不兼容的 API 修改
- **次版本 (MINOR)**：向后兼容的功能新增
- **修订号 (PATCH)**：向后兼容的问题修复

#### 版本更新规则
每当修改代码并更新版本时，**必须原子化执行以下所有操作**：

1. **文件头注释**：更新当前文件的头部版本号
2. **HTML title**：更新 `<title>` 标签尾部的版本号
3. **metadata.json**：更新 `AppName vX.Y.Z`
4. **CHANGELOG.md**：新增变更条目（递增 Patch，不记录日期）
5. **依赖管理**：检查 `index.html` 中的 `importmap`，确保库版本一致

### 2.3 目录结构规范

```
/workspace/
├── app/                      # 主应用目录
│   ├── api/                 # API 接口层
│   ├── components/          # 组件库
│   │   ├── ui/            # 基础 UI 组件
│   │   ├── NewsItems/     # 新闻项组件
│   │   └── icon/          # 平台图标组件
│   ├── composables/        # Vue 组合式函数
│   ├── config/             # 配置文件
│   ├── lib/                # 工具函数
│   ├── pages/              # 应用页面
│   ├── plugins/            # Nuxt 插件
│   └── assets/             # 静态资源
├── docker/                  # Docker 配置
├── openspec/                # 项目规范文档
├── public/                  # 公共静态资源
├── metadata.json            # 项目元数据
└── package.json            # 依赖配置
```

### 2.4 README 文档互联

确保 README 文件始终存在且通过头部链接互联：

- [README.md](file:///workspace/README.md) - 英文文档
- [README-zh_CN.md](file:///workspace/README-zh_CN.md) - 中文文档

链接格式示例：
```markdown
简体中文 | [English](./README-zh_CN.md)
```

## 3. 文档管理

### 3.1 metadata.json 规范

项目根目录必须包含 `metadata.json` 文件：

```json
{
  "AppName": "今日时事",
  "version": "2.0.0",
  "description": "一个现代化简约的新闻聚合平台",
  "author": "Yltf",
  "license": "MIT",
  "repository": "https://github.com/LYX9527/what-happen",
  "homepage": "https://news.yltfspace.com"
}
```

### 3.2 CHANGELOG.md 格式

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范：

```markdown
# Changelog

## [2.0.0] - YYYY-MM-DD

### Added
- 新增功能列表

### Changed
- 功能变更列表

### Deprecated
- 废弃功能列表

### Removed
- 移除功能列表

### Fixed
- Bug 修复列表

### Security
- 安全更新列表
```

**规则**：
- 版本号使用方括号：`[2.0.0]`
- 使用语义化标签：Added, Changed, Deprecated, Removed, Fixed, Security
- 不记录具体日期（根据规则）
- 每次提交递增 Patch 版本

### 3.3 openspec 目录

项目根目录必须包含 `openspec/` 目录，用于存放规范文档：

```
openspec/
├── SPEC.md              # 主要规范文档
├── architecture/       # 架构设计文档
├── api/                # API 规范文档
└── guidelines/         # 开发指南
```

## 4. 代码风格

### 4.1 环境要求

| 配置 | 要求 |
|------|------|
| 操作系统 | Windows |
| 编码 | UTF-8 |
| 行尾符 | CRLF |
| 缩进 | 2 空格或 4 空格（根据项目现有风格） |

### 4.2 HTML/JSX 规范

为页面容器添加语义化 `id`：

```vue
<template>
  <div id="news-timeline-container">
    <!-- 内容 -->
  </div>
</template>
```

### 4.3 组件注释

**规则**：所有函数必须有简练的注释。

**示例**：
```typescript
// 获取用户信息
const getUserInfo = () => { ... }

// 格式化日期
const formatDate = (date: Date): string => { ... }
```

**注意**：用户规则说"不要添加注释"，但这条规则与"所有函数必须有简练的注释"冲突。根据实际情况，对于业务逻辑复杂的函数应添加注释，UI 组件可省略注释。

## 5. 本地化 (L10n)

### 5.1 国际化支持

项目应支持以下语言：

| 语言代码 | 语言名称 |
|----------|----------|
| en | English |
| zh-CN | 简体中文 |
| zh-TW | 繁體中文 |
| es | Español |
| ar | العربية |
| fr | Français |
| pt-BR | Português (Brasil) |
| de | Deutsch |
| ja | 日本語 |
| ko | 한국어 |
| ru | Русский |

### 5.2 硬编码字符串处理

**规则**：发现硬编码中文字符串时，自动提取并建议更新到翻译文件。

**示例**：
```typescript
// ❌ 硬编码（不推荐）
const title = '新闻第一线'

// ✅ 使用 i18n（推荐）
const title = t('news.timeline.title')
```

**例外**：用户可见的正式文本（如错误消息、通知）应提取到 i18n 文件；内部变量命名可保留英文。

## 6. 测试规范

### 6.1 测试覆盖率要求

- 单元测试覆盖率 ≥ 80%
- 集成测试覆盖率 ≥ 60%
- 关键路径必须覆盖

### 6.2 测试命令

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行带覆盖率报告的测试
npm run test:coverage
```

### 6.3 测试文件命名

```
tests/
├── unit/                    # 单元测试
│   ├── api/
│   │   └── news.test.ts
│   ├── composables/
│   │   └── useFavorites.test.ts
│   └── utils/
│       └── formatDate.test.ts
├── integration/             # 集成测试
│   └── news.test.ts
└── e2e/                    # 端到端测试
    └── timeline.spec.ts
```

## 7. Git 提交规范

### 7.1 提交信息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 7.2 类型 (Type)

| 类型 | 说明 |
|------|------|
| feat | 新增功能 |
| fix | 修复问题 |
| docs | 文档变更 |
| style | 代码格式（不影响功能） |
| refactor | 重构（既不修复也不新增） |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具变更 |

### 7.3 示例

```bash
# 功能提交
git commit -m "feat(timeline): add news grouping by time"

# 修复提交
git commit -m "fix(api): resolve request timeout issue"

# 文档提交
git commit -m "docs(readme): update installation instructions"

# 重构提交
git commit -m "refactor(components): extract common logic"
```

## 8. 依赖管理

### 8.1 package.json 规范

- 使用精确版本号（^ 符号控制主版本）
- 包含 `packageManager` 字段指定包管理器版本
- 区分 `dependencies` 和 `devDependencies`

```json
{
  "name": "今日时事",
  "packageManager": "yarn@1.22.22",
  "dependencies": {
    "nuxt": "^4.0.1",
    "vue": "^3.5.18"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vitest": "^4.0.7"
  }
}
```

### 8.2 环境变量

项目根目录应包含 `.env.example` 文件：

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:10010
```

## 9. 安全规范

### 9.1 敏感信息处理

**禁止**：
- 在代码中硬编码密钥、API 密钥、密码
- 将 `.env` 文件提交到版本控制
- 在日志中输出敏感信息

**必须**：
- 使用环境变量存储敏感配置
- 使用 `.gitignore` 排除敏感文件
- 外部链接使用 `rel="noopener noreferrer"`

### 9.2 API 安全

- 所有 API 请求使用 HTTPS（生产环境）
- 使用 Bearer Token 进行身份验证
- 实现请求超时和重试机制

## 10. 性能规范

### 10.1 前端性能

| 指标 | 目标 |
|------|------|
| First Contentful Paint (FCP) | < 1.8s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3.8s |
| Cumulative Layout Shift (CLS) | < 0.1 |

### 10.2 优化策略

- 使用 SSR/SSG 提升首屏加载
- 实现懒加载和代码分割
- 使用 WebP 格式图片
- 配置浏览器缓存策略

## 11. 附录

### 11.1 相关资源

- [Nuxt 文档](https://nuxt.com/)
- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [TailwindCSS 文档](https://tailwindcss.com/)

### 11.2 变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v2.0.0 | 2025-09-03 | 完善规范文档 |
| v1.0.0 | 2025-07-30 | 初始版本 |

---

**文档版本**: v2.0.0
**最后更新**: 2025-09-03
**维护者**: Yltf
