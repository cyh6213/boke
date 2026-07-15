# Agent 观测平台 — 竞品分析报告

> 调研时间：2026-07-14
> 调研范围：主流 Agent/LLM 可观测性平台

---

## 一、市场格局

AgentOps（Agent Operations）是一个快速增长的赛道。根据 2025 年的市场报告：

- **全球市场**：AI Agent 市场规模约 52.9 亿美元（2024年），预计 2030 年达到 471 亿美元，年复合增长率 45%
- **中国市场**：企业级 AI Agent 市场规模复合增长率将达到 120%，2027 年预计达到 655 亿元
- **企业需求**：Gartner 预测，到 2028 年，至少 15% 的日常工作决策将通过 Agent AI 自主做出

随着 Agent 走向生产环境，**可观测性已经从"锦上添花"变成了"必不可少"**。

---

## 二、核心玩家对比

### 2.1 主要玩家一览

| 产品 | 公司 | 开源 | 定位 | 核心优势 |
|------|------|------|------|---------|
| **LangSmith** | LangChain | ❌ 闭源 | 全生命周期 Agent 工程平台 | 与 LangChain/LangGraph 深度集成，生态最强 |
| **Langfuse** | Langfuse | ✅ MIT | LLM 追踪 + 提示词管理 | 开源免费，自托管友好，社区活跃 |
| **Arize Phoenix** | Arize AI | ✅ Apache 2.0 | LLM 评估 + 可观测性 | 评估能力最强，RAG 专项优化 |
| **Traceloop OpenLLMetry** | Traceloop | ✅ Apache 2.0 | 埋点库（非平台） | 基于 OpenTelemetry，可对接任意后端 |
| **Helicone** | Helicone | ✅ MIT | 轻量级 LLM 代理 | 部署简单，专注成本追踪 |
| **HoneyHive** | HoneyHive | ❌ 闭源 | 全栈 LLM 运营平台 | 评估 + 追踪 + 提示词管理一体化 |
| **ZenML** | ZenML | ✅ Apache 2.0 | MLOps 平台 | 通用 MLOps，LLM 是其中一部分 |
| **Opik** | Comet | ✅ MIT | LLM 评估平台 | 评估能力强，与 Comet 生态集成 |
| **Lunary** | Lunary | ✅ MIT | LLM 可观测性 | 轻量，支持多种框架 |
| **LangWatch** | LangWatch | ✅ MIT | LLM 可观测性 | 守卫rails + 追踪一体化 |

---

### 2.2 头部产品深度对比

#### LangSmith vs Langfuse

这是当前市场上最主流的两个选择，详细对比如下：

| 维度 | LangSmith | Langfuse |
|------|-----------|----------|
| **开源协议** | 闭源（SDK MIT） | MIT（核心开源，企业模块商业） |
| **绑定框架** | 最强于 LangChain/LangGraph | 框架无关（Python/TS/OTel 等） |
| **可观测性 + 追踪** | ✅ 完整 | ✅ 完整 |
| **自动化生产洞察** | ✅ Insights Agent, Polly | ❌ 无 |
| **LLM-as-Judge 评估** | ✅ | ✅ |
| **在线确定性评估** | ✅ | ❌（路线图中） |
| **标注队列** | ✅ | ✅ |
| **队列路由 + 自动分配** | ✅ | ❌（文档未提及） |
| **自动化规则** | ✅ | ❌ |
| **生产告警** | ✅ | ❌ |
| **自定义 RBAC** | ✅ | ❌（仅固定角色） |
| **提示词管理** | ✅ Prompt Hub | ✅ 成熟 |
| **Agent 托管部署** | ✅ Agent Servers | ❌ |
| **自托管** | 仅企业版 | 所有版本均可 |
| **自托管高可用** | ✅ 企业级 | ❌（文档明确说明缺少 HA、扩展、备份） |
| **评估模板数量** | 30+（含轨迹、安全、多模态） | 8 个（仅基础质量） |
| **起价** | 免费 / $39/人/月 | 免费 / $29/月 / $199/月 |
| **计费方式** | 按追踪量（基础$2.5/1K，扩展$5/1K） | 按 Units（追踪+观测+评分） |
| **跨团队席位** | 按席位计费 | 无限 |

**结论**：
- 选 **LangSmith**：如果你深度使用 LangChain/LangGraph，需要生产级告警、评估、自动化
- 选 **Langfuse**：如果你需要自托管、预算敏感、框架无关、早期开发阶段

---

### 2.3 其他值得关注的产品

#### Arize Phoenix
- **优势**：RAG 评估能力最强，支持嵌入可视化、聚类分析
- **适合**：RAG 系统为主的场景
- **缺点**：Agent 追踪能力相对较弱

#### Traceloop OpenLLMetry
- **定位**：不是平台，是一个**埋点库**
- **优势**：基于 OpenTelemetry 标准，零代码接入主流库（OpenAI、LangChain、LlamaIndex）
- **适合**：不想绑定特定平台，想把追踪数据送到任意后端（Jaeger、Datadog、自建等）

#### Helicone
- **优势**：部署最简单，作为 LLM 代理，一行代码就能接入
- **适合**：快速验证、成本追踪为主的场景

---

## 三、市场空白与机会

### 3.1 现有产品的共同痛点

| 痛点 | 说明 | 机会 |
|------|------|------|
| **都是线性时间线** | 所有产品都用时间线/列表展示，没有真正的 DAG 可视化 | DAG 图展示执行轨迹，直观展示并行、分支、循环 |
| **框架绑定严重** | LangSmith 绑定 LangChain，其他产品各有偏好 | 完全框架无关，只收事件 |
| **太重了** | 全平台都包含评估、提示词管理、数据集等大而全 | 专注"记录+可视化"，做到极致简单 |
| **部署成本高** | 自托管需要 Kubernetes、多个服务 | 纯前端 + IndexedDB，零后端也能用 |
| **本地优先缺失** | 都是 SaaS 优先，数据要上传云端 | 本地存储优先，可选同步云端 |
| **IDE 集成弱** | 都是独立的 Web 应用 | 直接嵌入 Trae/VSCode 作为插件 |

### 3.2 差异化定位

我们的定位不是「另一个 LangSmith」，而是「Agent 的执行轨迹可视化工具」：

```
LangSmith = 追踪 + 评估 + 提示词 + 数据集 + 部署 + ...（大而全）

我们 = 事件接收 + DAG 自动构建 + 轨迹可视化（小而美，专注一件事做到极致）
```

### 3.3 为什么这个定位成立？

1. **分工细化是必然趋势**：当一个赛道成熟时，会从"大而全"走向"专精"。早期大家都用 Excel 记账，后来才有了专业的 QuickBooks、Xero
2. **你已经有 DAG 可视化的技术积累**：这是别人没有的独特优势
3. **不需要跟巨头正面竞争**：你做的是他们不重视的"可视化"这一层，但这一层对开发者来说体验差异巨大
4. **可以跟现有平台互补**：数据可以同时送到 LangSmith（做评估）和你的平台（做可视化）

---

## 四、技术选型参考

### 4.1 是否支持 OpenTelemetry？

**建议**：支持，但不作为唯一标准。

- **Traceloop OpenLLMetry** 已经证明了 OpenTelemetry 在 LLM 场景的可行性
- 支持 OTel 意味着可以接入整个 OpenTelemetry 生态（Jaeger、Grafana Tempo 等）
- 但 OTel 比较重，也要提供简单的 HTTP JSON 接口作为备选

### 4.2 本地存储方案

| 方案 | 容量 | 复杂度 | 适合 |
|------|------|--------|------|
| localStorage | ~5MB | 低 | 简单配置 |
| IndexedDB | ~500MB+ | 中 | 大量轨迹数据 |
| OPFS (Origin Private File System) | 无限制 | 高 | 需要文件系统访问 |

**建议**：IndexedDB 为主，localStorage 存配置。

### 4.3 数据导入/导出

- **导入**：支持 OpenTelemetry、LangSmith JSON、Langfuse JSON
- **导出**：JSON、Markdown 报告、图片（DAG 截图）

---

## 五、参考资料

### 文档链接
- [LangSmith 官网](https://www.langchain.com/langsmith)
- [Langfuse GitHub](https://github.com/langfuse/langfuse)
- [Traceloop OpenLLMetry](https://github.com/traceloop/openllmetry)
- [Arize Phoenix](https://github.com/Arize-ai/phoenix)

### 深度文章
- [LangSmith vs Langfuse (LangChain 官方)](https://www.langchain.com/articles/langsmith-vs-langfuse)
- [9 Best LangSmith Alternatives (ZenML Blog)](https://www.zenml.io/blog/langsmith-alternatives)
- [2025 年国内外 AgentOps 痛点与解决方案综述](https://cloud.tencent.com.cn/developer/article/2601632)
- [LLM Observability & AI Agent Tracing (Habr)](https://habr.com/en/articles/972480/)
