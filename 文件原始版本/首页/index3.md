# 程愚瀚 | 面试自我介绍

---

## 顶部导航

- **程愚瀚**（品牌名）
- 自我介绍（当前）
- [博客首页](index.html)
- [文章](文章/)
- [项目](项目/)

---

## 侧边栏导航

- **程愚瀚** — Agent 开发者 · 面试自我介绍
- 基本信息
- 技术栈
- 成本意识
- 测试方法论
- 联系方式

---

## 基本信息（Hero）

**面试官，您好**

# 我是 **程愚瀚**

🎓 电子科技大学 · 软件工程 · 28届本科

- **希望的工作方向：** Agent 开发
- **Base 地要求：** 无
- **支持实习时间：** 七月 - 来年一月

### 学习路线

**学习路线**

**24年11月** — **Java 后端开发** — **26年2月** — **Agent 学习** — **至今**

子项目时间线：
- Java 后端阶段：社区平台
- Agent 学习阶段：RAG 项目、workflow 2.0、MyClaw 项目、Tree (workflow 3.0)

[查看我的技术栈 ↓](#skills)

---

## 技术栈（Skills）

### ☕ Java 后端

- **Java：** 熟悉java语法，集合、异常、泛型、注解、反射、设计模式等内容。
- **JUC：** 熟悉Java并发编程，熟悉Synchronized、AQS、CAS、volatile、ThreadLocal、线程池。
- **JVM：** 对JMM、类加载机制、字节码执行、垃圾回收机制有深入理解。了解JVM调优、常见内存问题的解决。
- **MySQL：** 熟练掌握MySQL，熟悉其底层原理、SQL优化、索引优化、事务、MVCC、锁机制。
- **Redis：** 熟练使用Redis，了解其分布式锁、限流、消息队列的实现以及其数据结构、持久化、高可用。
- **框架：** 熟练使用Spring、SpringBoot、SpringMVC，了解IOC、AOP、Bean的生命周期、自动装配。

### 🤖 AI Agent 开发

**1. 辅助编程层面**

对基于 SDD 利用 AI 辅助编程比较熟练，简历上展示的项目 99% 都是 vibecoding 出来的，能够熟练利用 coding 工具，写出高质量的代码。

[📄 阅读文章：从 Vibe Coding 到 SDD →](文章/posts/从VibeCoding到SDD.html)

**2. 工具使用**

熟练使用多种 Agent 工具，深入学习了它们的核心策略与实现原理，并应用到了自己的项目当中：

- **OpenClaw** — 在使用过程中察觉其记忆实现的不足，于是做了 MyClaw
- **Claude Code** — 学习 checkpoint 机制，应用到可视化任务编排系统的节点回滚与断点恢复
- **豆包** — 学习对话主题更新机制，应用到 MyClaw 的滑动窗口策略
- **CodeBuddy** — 学习可控的问题改写策略，应用到 RAG 的智能路由

[📄 阅读文章：Claude Code 源码分析 →](文章/posts/读ClaudeCode源码我学到的五个设计.html)

---

## 成本意识（Cost Awareness）

### 💡 Token 优化

Workflow Sub Agent 职责拆分 · MyClaw 上下文精简

**↓ 41% 完整任务 Token**

[了解更多 →](项目/workflow.html#sub-agent)

### 📡 API 调用优化

RAG 智能路由跳过向量检索

**↓ 30% Embedding API 调用**

[了解更多 →](项目/rag.html#router)

### ⏱️ 耗时缩短

Workflow 并行执行 · RAG 智能路由跳过检索

**↓ 23% 执行时间**

[了解更多 →](项目/workflow.html#parallel)

[📄 阅读文章：Token 优化实践 →](文章/posts/Token优化实践.html)

---

## 测试方法论（Testing Methodology）

### 核心 · RAG 检索 — 检索 4 轮消融实验

**测试数据：** C-MTEB / T2Retrieval · Milvus 数据库 · 36w 条分块 · 2000 条 query

**模型：** BAAI/bge-m3（dense + sparse 双向量）+ BAAI/bge-reranker-v2-m3

**核心指标：recall_cap@5**

| 方案 | recall@5 | 提升 |
|------|----------|------|
| dense 纯向量检索（基线） | 68.38% | — |
| + RRF 混合检索（dense + BM25） | 75.66% | +7.28pp |
| + BM25 → sparse 向量 | 76.66% | +1.00pp |
| **+ Rerank 重排（候选池 50）** | **81.2%** | **+4.54pp** |

**7 项指标全面对比（基线 → 最终方案）**

| 指标 | 说明 | 提升幅度 |
|------|------|----------|
| recall_cap@5 | 上限截断召回率 | 68% → 81% |
| recall@5 | 召回率 | 57% → 68% |
| ndcg@5 | 排序质量 | 72% → 82% |
| mrr@5 | 首个相关排名 | 86% → 91% |
| precision@1 | 首位精确率 | 83% → 88% |
| f1@5 | 综合准确率 | 48% → 57% |
| 延迟 | — | 55ms → 360ms |

> ⚡ 生成阶段同样做了 3 轮消融（72% → 96%），详见 [RAG 检索优化文章](文章/posts/RAG检索优化.html)

---

### 可视化任务编排 — Plan 能力测评

Plan Agent 的 DAG 构建能力从 **Prompt（提示词）约束 → 后置校验 → FewShot（示例样本）→ 分级 Plan（规划）→ 双 Agent 评审 → 数据闭环采集** 六层递进优化，DAG 构建正确率 **97%**。基于 Reflexion（自反思）闭环 + LLM-as-Judge（模型评判），低分样本自动回流改进。

- **97%** — DAG 构建正确率
- **94%** — 子 Agent 任务完成率

---

### MyClaw — 长期记忆 4 种方案对比

基于 LongMemEval（长程记忆评估基准集），通过 RecallBench（召回评测框架）对比 4 种记忆方案在 4 个维度的准确率，最终选型选择 Hindsight。

| 维度 | 纯大窗口 | RAG检索 | **Hindsight** |
|------|----------|---------|:------------:|
| Information Extraction（精确检索） | 60% | 65% | **95%** |
| Multi-Session Reasoning（跨会话推理） | 45% | 50% | **90%** |
| Knowledge Updates（知识更新） | 50% | 45% | **88%** |
| Temporal Reasoning（时序推理） | 55% | 50% | **90%** |

---

## 项目链接

- [🔧 可视化任务编排系统 →](项目/workflow.html)
- [🧠 MyClaw →](项目/myclaw.html)
- [📊 Agentic RAG →](项目/rag.html)
- [🔀 RAG 智能路由 →](项目/rag.html#router)
- [💰 Token 优化实践 →](文章/posts/Token优化实践.html)
- [🔍 Claude Code 源码分析 →](文章/posts/读ClaudeCode源码我学到的五个设计.html)
- [📝 从 Vibe Coding 到 SDD →](文章/posts/从VibeCoding到SDD.html)
- [📈 RAG 检索优化 →](文章/posts/RAG检索优化.html)

---

## 联系方式（Contact）

感谢您的时间，期待进一步交流！

- 📞 (+86) 18111083906
- 📧 2952486829@qq.com
- 🐙 [GitHub](https://github.com/cyh6213)

---

## 话术提示（固定显示面板）

本页面右侧有一个固定话术框，随滚动位置切换不同内容：

**基本信息区域：** 面试官您好，我是程愚瀚，电子科技大学软件工程专业 28 届本科生。我之前一直在学习 Java 后端开发的内容，然后从今年 2 月份开始学习 AI 相关的内容，做了三个项目，包括简历上面的 RAG 项目、workflow 项目，然后出于个人兴趣做了 MyClaw 这个项目。最近在做的事情就是 tree 这个项目，它也就是 workflow 的 3.0。（……详见页面完整话术）

**技术栈区域：** 我的技术栈主要分为两块：Java 后端和 AI Agent。在后端方面，我对 JUC、JVM、MySQL、Redis 的底层原理和数据结构比较了解，也做过一个后端社区平台项目。在 AI 方面，我对基于 SDD 的 AI 辅助编程比较熟练，简历上的项目 99% 都是 vibecoding 出来的……

**成本意识区域：** 我在做项目的时候有比较强的成本意识。对这几个项目都实现了针对性的优化策略：比如 Workflow 通过 Sub Agent 职责拆分降低了 41% 的 Token 消耗；RAG 通过智能路由减少了 Embedding API 调用；并行执行也缩短了整体耗时……

**测试方法论区域：** 我对每个项目都进行了量化测评和消融实验，让每一次优化都能看到具体的数据提升：RAG 做了 4 轮检索消融和 3 轮生成消融，recall_cap@5 从 68% 提升到 81%，忠实度从 72% 提升到 96%；可视化任务编排的 Plan 能力经过六层递进优化，DAG 构建正确率达到 97%；MyClaw 则是对比了 4 种长期记忆方案在 4 个维度的表现后才最终选型 Hindsight……

---

© 2026 程愚瀚 · Built with ♥