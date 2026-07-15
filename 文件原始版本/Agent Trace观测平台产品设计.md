# Agent Trace 观测平台 — 产品设计文档

> **产品定位**：不负责规划，不负责执行，只负责记录和观测。将任意 Agent 的执行轨迹转化为可视化的 DAG 图，用于调试、成本分析、流程优化。

---

## 一、产品价值

### 1.1 为什么需要这个？

AI Agent 的执行过程是一个"黑盒"。当一个 Agent 跑了 30 步、调用了 5 次工具、消耗了 2 万 Token 之后：

- **开发者想知道**：卡在哪一步了？为什么会进入死循环？
- **产品经理想知道**：用户的成本花在哪里了？哪一步最费钱？
- **运维想知道**：Agent 的平均执行时长是多少？失败率多高？
- **团队想知道**：不同 Prompt / Agent 架构之间，哪个效果更好、成本更低？

传统日志系统只能看文本，无法直观展示 Agent 的决策路径和依赖关系。

### 1.2 核心价值

| 价值 | 说明 |
|------|------|
| **调试 Agent** | 可视化执行轨迹，一眼看出卡住的步骤和失败原因 |
| **成本分析** | 精确到每一步的 Token 消耗、工具调用次数、重试次数 |
| **流程优化** | 分析大量执行轨迹，发现冗余步骤、可并行的步骤 |
| **Agent 对比** | 同一个任务，不同 Prompt/Agent 的执行轨迹差异对比 |
| **审计合规** | 完整记录 Agent 的每一个决策和工具调用，满足审计要求 |

### 1.3 与现有产品的差异化

市面上已经有 LangSmith、Langfuse 等观测平台。我们的不同之处：

| 维度 | 现有产品 (LangSmith/Langfuse) | 本产品 |
|------|------|------|
| **核心定位** | LLM 调用追踪 + 评估 | Agent 执行轨迹的 DAG 可视化 |
| **可视化方式** | 线性时间线 | **DAG 有向无环图**（支持并行、分支、循环） |
| **是否绑定框架** | 深度绑定 LangChain/LangGraph | **完全框架无关**，只接收事件流 |
| **规划能力** | 有（LangGraph） | **无**（纯观测，不干涉执行） |
| **执行能力** | 有（LangGraph） | **无**（纯观测，不干涉执行） |
| **部署方式** | SaaS + 企业级自托管 | **本地优先**，纯前端 + 可选后端 |

---

## 二、核心逻辑

### 2.1 工作原理

```
[Agent/IDE/任意系统] 执行 → 每一步产生事件 → 通过 SDK/HTTP 发送 → [本平台] 接收 → 自动构建 DAG → 可视化展示
```

**不需要你负责规划，不需要你负责执行，只需要被动接收事件。**

### 2.2 事件模型

Agent 需要报告以下事件（标准化的事件格式）：

| 事件类型 | 触发时机 | 包含字段 |
|---------|---------|---------|
| `run_start` | 任务开始执行 | run_id, task, timestamp, agent_version |
| `step_start` | 新步骤开始 | run_id, step_id, step_type, parent_step_id?, timestamp |
| `tool_call` | 调用工具 | run_id, step_id, tool_name, tool_params, timestamp |
| `tool_result` | 工具返回 | run_id, step_id, tool_name, result, duration_ms, retry_count |
| `llm_call` | 调用 LLM | run_id, step_id, model, prompt_tokens, completion_tokens, cost, duration_ms |
| `step_end` | 步骤结束 | run_id, step_id, status, output, duration_ms |
| `run_end` | 任务结束 | run_id, status, total_tokens, total_cost, total_duration_ms, error? |

### 2.3 从事件到 DAG

平台接收事件后，自动构建执行图：

```
规则 1：时间顺序
  step_A 在 step_B 之前开始，且 step_B 没有明确的 parent → A → B

规则 2：显式父子关系
  step_B.parent_step_id = step_A.id → A → B

规则 3：数据依赖
  step_B 的输入包含 step_A 的输出 → A → B

规则 4：并行步骤
  step_B 和 step_C 同时开始，且互不依赖 → 并行（同一个层级）

规则 5：重试/循环
  同一个 step_id 出现多次（重试） → 用循环边或重试计数器标记
```

### 2.4 可视化方式

- **DAG 图**：每个节点是一个步骤，边是依赖关系
- **节点信息**：步骤类型、状态、耗时、Token 消耗、工具调用次数
- **边信息**：数据流向、是否重试
- **时间线视图**：线性时间顺序，与 DAG 图联动
- **瀑布图**：展示并行步骤的时间重叠

---

## 三、数据模型

### 3.1 Run（一次任务执行）

```json
{
  "run_id": "run_abc123",
  "task": "调研 Python 和 JavaScript 的最新特性并生成对比报告",
  "agent_version": "v1.2.3",
  "start_time": "2025-07-14T10:00:00Z",
  "end_time": "2025-07-14T10:05:30Z",
  "status": "completed",
  "total_steps": 8,
  "total_tool_calls": 12,
  "total_llm_calls": 5,
  "total_prompt_tokens": 15000,
  "total_completion_tokens": 8000,
  "total_cost": 0.069,
  "error": null
}
```

### 3.2 Step（一个步骤）

```json
{
  "step_id": "step_004",
  "run_id": "run_abc123",
  "parent_step_id": "step_003",
  "type": "tool_call",
  "title": "搜索 JavaScript 最新特性",
  "start_time": "2025-07-14T10:01:30Z",
  "end_time": "2025-07-14T10:02:15Z",
  "duration_ms": 45000,
  "status": "completed",
  "retry_count": 0,
  "tool_calls": [
    {
      "tool_name": "web_search",
      "params": { "query": "JavaScript ES2025 new features" },
      "start_time": "2025-07-14T10:01:30Z",
      "end_time": "2025-07-14T10:01:45Z",
      "duration_ms": 15000,
      "retry_count": 0
    }
  ],
  "llm_calls": [
    {
      "model": "gpt-4o",
      "prompt_tokens": 2000,
      "completion_tokens": 800,
      "cost": 0.012,
      "duration_ms": 3000
    }
  ],
  "input": { "previous_result": "..." },
  "output": { "search_result": "..." }
}
```

### 3.3 统计数据（用于分析）

```json
{
  "run_id": "run_abc123",
  "step_id": "step_004",
  "metrics": {
    "tool_call_count": 1,
    "tool_retry_count": 0,
    "llm_call_count": 1,
    "total_prompt_tokens": 2000,
    "total_completion_tokens": 800,
    "total_cost": 0.012,
    "total_duration_ms": 45000,
    "tool_time_ratio": 0.33,
    "llm_time_ratio": 0.07
  }
}
```

---

## 四、实现路径

### 4.1 MVP 版本（最小可行产品）

**目标**：能用，能看，能记录

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **事件接收 API** | HTTP 接口接收事件流 | P0 |
| **DAG 自动构建** | 从事件自动生成 DAG 图 | P0 |
| **可视化界面** | DAG 图展示 + 节点详情 | P0 |
| **本地存储** | localStorage / IndexedDB 本地保存 | P0 |
| **Run 列表** | 历史执行记录列表 | P1 |

### 4.2 V2 版本（分析能力）

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **Token / 成本分析** | 按步骤、按工具统计 Token 和费用 | P1 |
| **时间线视图** | 线性时间线，可与 DAG 联动 | P1 |
| **搜索过滤** | 按任务、状态、时间范围搜索 | P1 |
| **导出功能** | 导出 JSON / Markdown 报告 | P2 |

### 4.3 V3 版本（对比与优化）

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **Run 对比** | 两个执行轨迹并排对比 | P2 |
| **统计面板** | 平均耗时、成功率、Token 趋势 | P2 |
| **异常检测** | 自动检测死循环、异常重试、高成本步骤 | P2 |
| **标注功能** | 对轨迹进行标注和评分 | P3 |

---

## 五、集成方式

### 5.1 作为 Trae / VSCode 插件

```
Trae 内的 Agent 执行 → 产生事件 → Trae 插件 API → [本平台] → 可视化
```

**好处**：不需要额外运行后端，前端直接嵌入 IDE

**技术路径**：
1. Trae 插件提供事件监听 API
2. 本平台作为 Webview 面板嵌入
3. 直接在 IDE 内展示执行轨迹

### 5.2 作为独立 Web 应用

```
任意 Agent → HTTP POST 事件 → [本平台后端] → 前端可视化
```

**好处**：框架无关，任何语言/框架都能接入

### 5.3 作为 SDK 埋点

```python
# Python SDK
from agent_trace import Tracer

tracer = Tracer(endpoint="http://localhost:3000")

@tracer.step
def search_web(query):
    result = web_search(query)
    return result

@tracer.run
def main_task():
    result1 = search_web("Python 新特性")
    result2 = search_web("JavaScript 新特性")
    return generate_report(result1, result2)
```

---

## 六、技术架构

```
┌─────────────────────────────────────────┐
│           前端 (React)                   │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ DAG 图  │  │ 时间线   │  │ 统计   │ │
│  └─────────┘  └──────────┘  └────────┘ │
└───────────────────┬─────────────────────┘
                    │
          ┌─────────▼─────────┐
          │  状态管理 (Zustand)│
          └─────────┬─────────┘
                    │
    ┌───────────────▼───────────────┐
    │                               │
    │    事件总线 (Event Bus)        │
    │                               │
    └──────┬───────────────┬────────┘
           │               │
    ┌──────▼──────┐  ┌────▼──────────┐
    │ 本地存储     │  │ 后端 API (可选) │
    │ (IndexedDB)  │  │ (FastAPI)      │
    └─────────────┘  └───────────────┘
```

---

## 七、与 Plan-and-Execute 框架的关系

这不是替代关系，而是**互补关系**：

```
[Plan Agent] 规划 → [Executor] 执行 → [Trace Platform] 观测
     ↑                    │                    │
     │                    ▼                    ▼
     └──────── 基于观测结果优化 Prompt ───────┘
```

- **Plan Agent**：你的长处，擅长 DAG 规划
- **Trae/Cursor**：别人的长处，擅长 Agent 执行、工具调用、上下文压缩
- **Trace Platform**：把两者连接起来，记录执行过程，用于持续优化

**这就是你说的「把我的长处和他的长处结合起来」的最佳方式。**

---

## 八、总结

这个产品的核心洞察是：

> **当 Agent 足够复杂时，执行轨迹本身就比执行结果更有价值。**

- 你不需要跟 LangChain 比规划能力
- 你不需要跟 Trae 比执行能力
- 你只需要**把所有 Agent 的执行轨迹记录下来、可视化出来**

这是一个**横向的观测层**，可以对接任何 Agent 框架、任何 IDE、任何执行环境。

这也是你的独特优势：你已经有了 DAG 可视化的技术积累，只需要把输入从"规划结果"换成"执行事件"即可。
