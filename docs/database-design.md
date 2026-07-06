# 知径 MySQL 数据库设计

## 数据库名称

- `zhijing_db`

## 设计原则

- 围绕个人学习闭环建模：学习包 -> 题目 -> 练习 -> 错题 -> 卡片 -> 任务/专注 -> 社区/目标规划
- 优先保证主业务链路可落地
- 与 NestJS TypeORM 实体字段保持一致
- 统一使用 `uuid` 字符串主键
- 统一保留 `created_at`、`updated_at`、`deleted_at` 字段，便于审计与软删除

## 核心业务表

### 用户与偏好

- `users`
- `user_preferences`

### 学习包与资料

- `learning_packs`
- `pack_materials`
- `pack_chapters`
- `pack_knowledge_points`

### AI 学习记录

- `qa_records`

### 练习与错题

- `practice_questions`
- `practice_sessions`
- `practice_answers`
- `wrong_questions`

### 记忆卡片

- `flashcards`
- `flashcard_reviews`

### 学习习惯

- `learning_tasks`
- `focus_records`
- `study_streaks`

### 社区

- `community_posts`
- `community_comments`
- `community_likes`

### 目标规划与报告

- `target_plans`
- `learning_reports`

## 当前后端对接情况

当前 NestJS 项目已完成：

- MySQL + TypeORM 配置接入
- 实体类与数据表字段对齐
- 登录注册接口骨架
- 用户资料与偏好接口
- 学习包、资料上传与模拟解析接口
- AI 问答、生成题目、生成卡片、错题回顾接口
- 练习会话、提交答案、错题沉淀接口
- 错题本接口
- 卡片复习接口
- 任务与专注打卡接口
- 社区接口
- 目标规划与学习报告接口
- 个人中心聚合接口
- 排行榜接口

## 后续建议

下一阶段可以继续接入：

1. 真正的 MySQL 实例与迁移工具。
2. 文件上传存储，例如本地存储、MinIO 或对象存储。
3. 真实大模型服务与资料解析服务。
4. 更细的 repository / domain service 分层。
5. Redis 缓存、队列任务和异步 AI 工作流。
