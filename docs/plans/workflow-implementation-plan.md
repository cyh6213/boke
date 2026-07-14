# Workflow 可视化任务编排与执行系统 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task.

**Goal:** 构建一个可运行的 Workflow 系统，用户通过对话提交任务，系统生成 DAG 图并自动执行

**Architecture:** 前端 React + DAG 可视化，后端 Java Spring Boot + LLM API 集成。Plan Agent 生成 DAG，执行引擎按 KAHN 拓扑排序调度 Sub Agent 执行。

**Tech Stack:** 
- 前端: React 18 + Vite + React Flow (DAG 可视化) + TailwindCSS
- 后端: Java Spring Boot 3.x + Spring AI + MySQL/H2
- LLM: OpenAI 兼容 API (可配置)

---

### Task 1: 项目初始化与基础架构

**Files:**
- Create: `workflow-app/backend/pom.xml`
- Create: `workflow-app/backend/src/main/java/com/workflow/WorkflowApplication.java`
- Create: `workflow-app/backend/src/main/resources/application.yml`
- Create: `workflow-app/frontend/package.json`
- Create: `workflow-app/frontend/vite.config.ts`
- Create: `workflow-app/frontend/src/App.tsx`
- Create: `workflow-app/frontend/src/main.tsx`
- Create: `workflow-app/frontend/index.html`

- [ ] **Step 1: 创建后端 Spring Boot 项目**

```xml
<!-- pom.xml 核心依赖 -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
        <version>1.0.0-M6</version>
    </dependency>
</dependencies>
```

- [ ] **Step 2: 创建前端 React 项目**

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "reactflow": "^11.11.0",
    "tailwindcss": "^3.4.0"
  }
}
```

- [ ] **Step 3: 验证项目启动**

Run: `cd workflow-app/backend && mvn spring-boot:run`
Expected: Spring Boot 启动在 8080 端口

Run: `cd workflow-app/frontend && npm install && npm run dev`
Expected: Vite 开发服务器启动在 5173 端口

- [ ] **Step 4: Commit**

```bash
git add workflow-app/
git commit -m "feat: init workflow project with spring boot + react"
```

---

### Task 2: 数据模型设计（三张核心表）

**Files:**
- Create: `workflow-app/backend/src/main/java/com/workflow/entity/FlowData.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/entity/ExecutionSnapshot.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/entity/ExecutionRecord.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/repository/FlowDataRepository.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/repository/ExecutionSnapshotRepository.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/repository/ExecutionRecordRepository.java`

- [ ] **Step 1: 创建 FlowData 实体**

```java
@Entity
@Table(name = "flow_data")
public class FlowData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT")  // JSON: {nodes: [...], edges: [...]}
    private String dagJson;
    
    @Column(columnDefinition = "TEXT")  // JSON: 每个节点的 output_schema
    private String schemasJson;
    
    private String status;  // PENDING, RUNNING, COMPLETED, FAILED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Step 2: 创建 ExecutionSnapshot 实体**

```java
@Entity
@Table(name = "execution_snapshot")
public class ExecutionSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long executionRecordId;
    private String nodeId;
    private String nodeType;  // RESEARCH, REVIEW, EXECUTE
    
    @Column(columnDefinition = "TEXT")
    private String inputJson;
    
    @Column(columnDefinition = "TEXT")
    private String outputJson;
    
    private String status;  // PENDING, RUNNING, SUCCESS, FAILED
    private Integer retryCount;
    private String errorMessage;
    private Long tokenCost;
    private Long durationMs;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Step 3: 创建 ExecutionRecord 实体**

```java
@Entity
@Table(name = "execution_record")
public class ExecutionRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long flowDataId;
    private String userTask;       // 用户原始任务描述
    private String status;         // RUNNING, COMPLETED, FAILED
    private Long totalTokenCost;
    private Long totalDurationMs;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Step 4: 创建对应的 Repository 接口**

```java
public interface FlowDataRepository extends JpaRepository<FlowData, Long> {}
public interface ExecutionSnapshotRepository extends JpaRepository<ExecutionSnapshot, Long> {
    List<ExecutionSnapshot> findByExecutionRecordId(Long executionRecordId);
}
public interface ExecutionRecordRepository extends JpaRepository<ExecutionRecord, Long> {}
```

- [ ] **Step 5: Commit**

```bash
git add workflow-app/backend/src/main/java/com/workflow/entity/
git add workflow-app/backend/src/main/java/com/workflow/repository/
git commit -m "feat: add core data models (flow_data, execution_snapshot, execution_record)"
```

---

### Task 3: DAG 数据结构与 Plan Agent

**Files:**
- Create: `workflow-app/backend/src/main/java/com/workflow/model/DagGraph.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/model/DagNode.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/model/DagEdge.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/service/PlanAgentService.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/service/LLMService.java`

- [ ] **Step 1: 定义 DAG 数据结构**

```java
// DagNode.java
public class DagNode {
    private String id;           // "node-1"
    private String type;         // "RESEARCH", "REVIEW", "EXECUTE"
    private String label;        // "搜索竞品资料"
    private String prompt;       // 给 Sub Agent 的指令
    private List<String> tools;  // 绑定的工具列表
    private Map<String, Object> outputSchema;  // 动态 schema
    private Map<String, Object> config;        // 重试策略、超时等
}

// DagEdge.java
public class DagEdge {
    private String sourceId;     // 上游节点 ID
    private String targetId;     // 下游节点 ID
    private String condition;    // 可选条件表达式
}

// DagGraph.java
public class DagGraph {
    private List<DagNode> nodes;
    private List<DagEdge> edges;
}
```

- [ ] **Step 2: 实现 LLMService（调用大模型生成 DAG）**

```java
@Service
public class LLMService {
    // 调用 LLM API，传入用户任务描述，返回结构化 DAG JSON
    public DagGraph generateDag(String userTask) {
        String prompt = buildPlanPrompt(userTask);
        String response = callLLM(prompt);
        return parseDagResponse(response);
    }
    
    private String buildPlanPrompt(String userTask) {
        // 包含：角色定义、JsonSchema 约束、拆解规则、生成规则、FewShot 样本
        return """
            你是一个任务规划专家。将用户任务拆解为 DAG 图。
            
            输出格式（严格 JSON）：
            {
              "nodes": [
                {"id": "node-1", "type": "RESEARCH", "label": "...", 
                 "prompt": "...", "tools": ["web_search"],
                 "output_schema": {"type": "object", "properties": {...}}}
              ],
              "edges": [
                {"sourceId": "node-1", "targetId": "node-2"}
              ]
            }
            
            规则：
            1. 检索/工具操作必须在生成类节点之前
            2. 独立无依赖任务拆为并行节点
            3. 不存在循环依赖
            4. 单次工具调用 = 1 个节点
            
            用户任务：""" + userTask;
    }
}
```

- [ ] **Step 3: 实现 PlanAgentService**

```java
@Service
public class PlanAgentService {
    
    public DagGraph createPlan(String userTask) {
        DagGraph dag = llmService.generateDag(userTask);
        validateDag(dag);  // 环路检测、引用合法性
        return dag;
    }
    
    private void validateDag(DagGraph dag) {
        // KAHN 环路检测
        Map<String, Integer> inDegree = new HashMap<>();
        for (DagNode node : dag.getNodes()) inDegree.put(node.getId(), 0);
        for (DagEdge edge : dag.getEdges()) 
            inDegree.merge(edge.getTargetId(), 1, Integer::sum);
        
        Queue<String> queue = new LinkedList<>();
        for (var entry : inDegree.entrySet()) 
            if (entry.getValue() == 0) queue.add(entry.getKey());
        
        int visited = 0;
        while (!queue.isEmpty()) {
            String nodeId = queue.poll();
            visited++;
            for (DagEdge edge : dag.getEdges()) 
                if (edge.getSourceId().equals(nodeId)) {
                    int deg = inDegree.get(edge.getTargetId()) - 1;
                    inDegree.put(edge.getTargetId(), deg);
                    if (deg == 0) queue.add(edge.getTargetId());
                }
        }
        
        if (visited != dag.getNodes().size()) 
            throw new RuntimeException("DAG contains cycle!");
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add workflow-app/backend/src/main/java/com/workflow/model/
git add workflow-app/backend/src/main/java/com/workflow/service/
git commit -m "feat: add DAG data model and Plan Agent service"
```

---

### Task 4: 执行引擎（KAHN 拓扑排序 + 并行调度）

**Files:**
- Create: `workflow-app/backend/src/main/java/com/workflow/engine/ExecutionEngine.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/engine/SubAgentExecutor.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/engine/OutputIsolation.java`

- [ ] **Step 1: 实现 ExecutionEngine（KAHN 调度器）**

```java
@Component
public class ExecutionEngine {
    
    public void execute(DagGraph dag, Long executionRecordId) {
        // 1. 计算入度
        Map<String, Integer> inDegree = new HashMap<>();
        Map<String, List<DagEdge>> outEdges = new HashMap<>();
        for (DagNode node : dag.getNodes()) inDegree.put(node.getId(), 0);
        for (DagEdge edge : dag.getEdges()) {
            inDegree.merge(edge.getTargetId(), 1, Integer::sum);
            outEdges.computeIfAbsent(edge.getSourceId(), k -> new ArrayList<>()).add(edge);
        }
        
        // 2. 批次执行
        while (true) {
            // 找出当前入度为 0 的节点（可并行执行）
            List<DagNode> readyNodes = dag.getNodes().stream()
                .filter(n -> inDegree.get(n.getId()) != null && inDegree.get(n.getId()) == 0)
                .collect(Collectors.toList());
            
            if (readyNodes.isEmpty()) break;
            
            // 并行执行这批节点
            List<CompletableFuture<Void>> futures = readyNodes.stream()
                .map(node -> CompletableFuture.runAsync(() -> {
                    SubAgentResult result = subAgentExecutor.execute(node, executionRecordId);
                    // 保存快照
                    saveSnapshot(node, result, executionRecordId);
                }))
                .collect(Collectors.toList());
            
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            
            // 更新入度
            for (DagNode node : readyNodes) {
                inDegree.put(node.getId(), -1);  // 标记已执行
                for (DagEdge edge : outEdges.getOrDefault(node.getId(), List.of())) {
                    if (shouldActivate(edge, node)) {
                        inDegree.merge(edge.getTargetId(), -1, Integer::sum);
                    }
                }
            }
        }
    }
    
    private boolean shouldActivate(DagEdge edge, DagNode sourceNode) {
        if (edge.getCondition() == null || edge.getCondition().isEmpty()) return true;
        // 检查条件分支
        return evaluateCondition(edge.getCondition(), sourceNode.getOutput());
    }
}
```

- [ ] **Step 2: 实现 SubAgentExecutor**

```java
@Component
public class SubAgentExecutor {
    
    public SubAgentResult execute(DagNode node, Long executionRecordId) {
        // 1. 根据 node.type 选择对应的 Sub Agent Prompt
        String systemPrompt = buildSubAgentPrompt(node);
        
        // 2. 注入 output_schema
        String schemaJson = JsonUtils.toJson(node.getOutputSchema());
        String fullPrompt = systemPrompt + "\n\n输出格式（严格 JSON）：" + schemaJson;
        
        // 3. 调用 LLM
        String response = callLLM(fullPrompt, node.getTools());
        
        // 4. 解析结构化输出
        return parseResult(response, node.getOutputSchema());
    }
    
    private String buildSubAgentPrompt(DagNode node) {
        switch (node.getType()) {
            case "RESEARCH":
                return "你是一个调研助手。负责搜索和收集信息。只使用搜索类工具。";
            case "REVIEW":
                return "你是一个审查助手。负责代码审查和安全检查。只使用代码检查工具。";
            case "EXECUTE":
                return "你是一个执行助手。负责执行命令和生成报告。只使用执行类工具。";
            default:
                return "你是一个通用助手。";
        }
    }
}
```

- [ ] **Step 3: 实现 OutputIsolation**

```java
public class OutputIsolation {
    // 每个任务独立缓冲区
    private Map<String, ByteArrayOutputStream> buffers = new ConcurrentHashMap<>();
    
    public PrintStream createIsolatedOutput(String nodeId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        buffers.put(nodeId, baos);
        return new PrintStream(baos);
    }
    
    public void flushAll(List<String> orderedNodeIds) {
        for (String nodeId : orderedNodeIds) {
            ByteArrayOutputStream baos = buffers.get(nodeId);
            if (baos != null) {
                System.out.println("=== Node: " + nodeId + " ===");
                System.out.println(baos.toString());
                System.out.println("=== End: " + nodeId + " ===");
            }
        }
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add workflow-app/backend/src/main/java/com/workflow/engine/
git commit -m "feat: implement execution engine with KAHN topological sort and parallel scheduling"
```

---

### Task 5: 断点恢复机制

**Files:**
- Create: `workflow-app/backend/src/main/java/com/workflow/engine/CheckpointService.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/engine/RecoveryService.java`

- [ ] **Step 1: 实现 CheckpointService**

```java
@Service
public class CheckpointService {
    
    public void saveSnapshot(ExecutionSnapshot snapshot) {
        snapshotRepository.save(snapshot);
    }
    
    public void saveRecord(ExecutionRecord record) {
        executionRecordRepository.save(record);
    }
    
    public List<ExecutionSnapshot> getSnapshots(Long recordId) {
        return snapshotRepository.findByExecutionRecordId(recordId);
    }
}
```

- [ ] **Step 2: 实现 RecoveryService**

```java
@Service
public class RecoveryService {
    
    public RecoveryState buildRecoveryState(Long recordId, String specifiedNodeId) {
        ExecutionRecord record = executionRecordRepository.findById(recordId).orElseThrow();
        List<ExecutionSnapshot> snapshots = checkpointService.getSnapshots(recordId);
        
        // 确定恢复起始节点
        String startNodeId = specifiedNodeId;
        if (startNodeId == null) {
            startNodeId = findFirstFailedNode(snapshots);
        }
        if (startNodeId == null) {
            startNodeId = findFirstIncompleteNode(snapshots);
        }
        
        // 收集恢复起始节点之前所有成功节点的输出
        Map<String, Object> previousOutputs = new HashMap<>();
        for (ExecutionSnapshot snap : snapshots) {
            if (snap.getStatus().equals("SUCCESS")) {
                previousOutputs.put(snap.getNodeId(), snap.getOutputJson());
            }
        }
        
        return new RecoveryState(record, startNodeId, previousOutputs);
    }
    
    private String findFirstFailedNode(List<ExecutionSnapshot> snapshots) {
        return snapshots.stream()
            .filter(s -> "FAILED".equals(s.getStatus()))
            .map(ExecutionSnapshot::getNodeId)
            .findFirst().orElse(null);
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add workflow-app/backend/src/main/java/com/workflow/engine/CheckpointService.java
git add workflow-app/backend/src/main/java/com/workflow/engine/RecoveryService.java
git commit -m "feat: add checkpoint and recovery services"
```

---

### Task 6: 三级异常治理

**Files:**
- Create: `workflow-app/backend/src/main/java/com/workflow/engine/RetryStrategy.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/engine/ExceptionHandler.java`

- [ ] **Step 1: 实现 RetryStrategy**

```java
public enum RetryStrategy {
    FIXED,      // 固定间隔
    LINEAR,     // 线性递增
    EXPONENTIAL // 指数退避
}

@Component
public class RetryHandler {
    
    public <T> T executeWithRetry(Supplier<T> action, RetryStrategy strategy, 
                                   int maxRetries, long baseDelayMs) {
        Exception lastException = null;
        for (int i = 0; i <= maxRetries; i++) {
            try {
                return action.get();
            } catch (Exception e) {
                lastException = e;
                if (i < maxRetries) {
                    long delay = calculateDelay(strategy, baseDelayMs, i);
                    Thread.sleep(delay);
                }
            }
        }
        throw new RuntimeException("All retries failed", lastException);
    }
    
    private long calculateDelay(RetryStrategy strategy, long baseDelayMs, int attempt) {
        switch (strategy) {
            case FIXED: return baseDelayMs;
            case LINEAR: return baseDelayMs * (attempt + 1);
            case EXPONENTIAL: return baseDelayMs * (long) Math.pow(2, attempt);
            default: return baseDelayMs;
        }
    }
}
```

- [ ] **Step 2: 实现 ExceptionHandler**

```java
@Component
public class ExceptionHandler {
    
    public NodeErrorResult handle(Throwable error, ErrorStrategy strategy) {
        switch (strategy) {
            case ABORT:
                throw new RuntimeException("Critical node failed", error);
            case ERROR_CODE:
                return new NodeErrorResult("error", "使用默认值继续执行");
            case FALLBACK_BRANCH:
                return new NodeErrorResult("fallback", "引导到异常处理分支");
            default:
                throw new RuntimeException("Unknown strategy", error);
        }
    }
}

enum ErrorStrategy {
    ABORT,           // 直接中断
    ERROR_CODE,      // 错误码策略
    FALLBACK_BRANCH  // 失败条件分支
}
```

- [ ] **Step 3: Commit**

```bash
git add workflow-app/backend/src/main/java/com/workflow/engine/RetryStrategy.java
git add workflow-app/backend/src/main/java/com/workflow/engine/ExceptionHandler.java
git commit -m "feat: add retry strategies and exception handling"
```

---

### Task 7: 前端 DAG 可视化

**Files:**
- Create: `workflow-app/frontend/src/components/DagViewer.tsx`
- Create: `workflow-app/frontend/src/components/ChatPanel.tsx`
- Create: `workflow-app/frontend/src/components/ExecutionMonitor.tsx`
- Create: `workflow-app/frontend/src/api/workflowApi.ts`

- [ ] **Step 1: 实现 DAG 可视化组件（使用 React Flow）**

```tsx
// DagViewer.tsx
import React, { useCallback } from 'react';
import ReactFlow, {
  Node, Edge, Controls, Background, useNodesState, useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

interface DagViewerProps {
  nodes: DagNodeData[];
  edges: DagEdgeData[];
  onConfirm?: () => void;
}

export function DagViewer({ nodes: inputNodes, edges: inputEdges, onConfirm }: DagViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    inputNodes.map((n, i) => ({
      id: n.id,
      type: 'default',
      position: { x: 200 * (i % 3), y: 150 * Math.floor(i / 3) },
      data: { label: `${n.label}\n(${n.type})` },
      style: getNodeStyle(n.type),
    }))
  );
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    inputEdges.map(e => ({
      id: `${e.sourceId}-${e.targetId}`,
      source: e.sourceId,
      target: e.targetId,
      label: e.condition || '',
      style: e.condition ? { stroke: '#f59e0b' } : {},
    }))
  );

  return (
    <div style={{ height: 400, border: '1px solid #e2e8f0', borderRadius: 12 }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}>
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

function getNodeStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'RESEARCH': return { background: '#eef2ff', border: '2px solid #4f46e5', borderRadius: 8 };
    case 'REVIEW': return { background: '#f0fdf4', border: '2px solid #059669', borderRadius: 8 };
    case 'EXECUTE': return { background: '#fef3c7', border: '2px solid #d97706', borderRadius: 8 };
    default: return { background: '#f8fafc', border: '1px solid #94a3b8', borderRadius: 8 };
  }
}
```

- [ ] **Step 2: 实现 ChatPanel**

```tsx
// ChatPanel.tsx
export function ChatPanel({ onDagGenerated }: { onDagGenerated: (dag: any) => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  const sendMessage = async () => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    const response = await fetch('/api/workflow/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: input }),
    });
    
    const dag = await response.json();
    onDagGenerated(dag);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '已生成执行计划，请确认 DAG 图是否正确。',
      dag 
    }]);
    setLoading(false);
  };
  
  return (
    <div className="chat-panel">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input value={input} onChange={e => setInput(e.target.value)} 
               placeholder="描述你的任务..." />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? '生成中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 实现 API 调用层**

```ts
// workflowApi.ts
const API_BASE = '/api/workflow';

export async function createPlan(task: string): Promise<DagGraph> {
  const res = await fetch(`${API_BASE}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task }),
  });
  return res.json();
}

export async function executeDag(flowDataId: number): Promise<ExecutionResult> {
  const res = await fetch(`${API_BASE}/execute/${flowDataId}`, {
    method: 'POST',
  });
  return res.json();
}

export async function getExecutionStatus(recordId: number): Promise<ExecutionStatus> {
  const res = await fetch(`${API_BASE}/status/${recordId}`);
  return res.json();
}
```

- [ ] **Step 4: Commit**

```bash
git add workflow-app/frontend/src/components/
git add workflow-app/frontend/src/api/
git commit -m "feat: add DAG visualization, chat panel, and API layer"
```

---

### Task 8: 后端 Controller 与 API 集成

**Files:**
- Create: `workflow-app/backend/src/main/java/com/workflow/controller/WorkflowController.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/controller/ChatController.java`
- Create: `workflow-app/backend/src/main/java/com/workflow/service/WorkflowOrchestrator.java`

- [ ] **Step 1: 实现 WorkflowController**

```java
@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {
    
    @PostMapping("/plan")
    public ResponseEntity<DagGraph> createPlan(@RequestBody PlanRequest request) {
        DagGraph dag = planAgentService.createPlan(request.getTask());
        // 保存到 flow_data
        FlowData flowData = new FlowData();
        flowData.setDagJson(JsonUtils.toJson(dag));
        flowData.setStatus("PENDING");
        flowDataRepository.save(flowData);
        return ResponseEntity.ok(dag);
    }
    
    @PostMapping("/execute/{flowDataId}")
    public ResponseEntity<ExecutionRecord> execute(@PathVariable Long flowDataId) {
        FlowData flowData = flowDataRepository.findById(flowDataId).orElseThrow();
        DagGraph dag = JsonUtils.fromJson(flowData.getDagJson(), DagGraph.class);
        
        ExecutionRecord record = new ExecutionRecord();
        record.setFlowDataId(flowDataId);
        record.setStatus("RUNNING");
        executionRecordRepository.save(record);
        
        CompletableFuture.runAsync(() -> executionEngine.execute(dag, record.getId()));
        
        return ResponseEntity.ok(record);
    }
    
    @GetMapping("/status/{recordId}")
    public ResponseEntity<ExecutionStatus> getStatus(@PathVariable Long recordId) {
        ExecutionRecord record = executionRecordRepository.findById(recordId).orElseThrow();
        List<ExecutionSnapshot> snapshots = checkpointService.getSnapshots(recordId);
        return ResponseEntity.ok(new ExecutionStatus(record, snapshots));
    }
}
```

- [ ] **Step 2: 实现 WorkflowOrchestrator（串联完整流程）**

```java
@Service
public class WorkflowOrchestrator {
    
    public ExecutionRecord runFullWorkflow(String userTask) {
        // 1. Plan Agent 生成 DAG
        DagGraph dag = planAgentService.createPlan(userTask);
        
        // 2. 保存 DAG
        FlowData flowData = saveFlowData(dag);
        
        // 3. 创建执行记录
        ExecutionRecord record = createRecord(flowData.getId(), userTask);
        
        // 4. 执行引擎执行
        executionEngine.execute(dag, record.getId());
        
        // 5. 更新状态
        record.setStatus("COMPLETED");
        executionRecordRepository.save(record);
        
        return record;
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add workflow-app/backend/src/main/java/com/workflow/controller/
git add workflow-app/backend/src/main/java/com/workflow/service/WorkflowOrchestrator.java
git commit -m "feat: add REST API controllers and workflow orchestrator"
```

---

### Task 9: 前端主页面集成

**Files:**
- Modify: `workflow-app/frontend/src/App.tsx`
- Create: `workflow-app/frontend/src/App.css`

- [ ] **Step 1: 实现主页面布局**

```tsx
// App.tsx
function App() {
  const [dag, setDag] = useState<DagGraph | null>(null);
  const [executing, setExecuting] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);
  
  const handleDagGenerated = (newDag: DagGraph) => {
    setDag(newDag);
  };
  
  const handleConfirm = async () => {
    if (!dag?.flowDataId) return;
    setExecuting(true);
    const result = await executeDag(dag.flowDataId);
    setRecordId(result.id);
    // 轮询状态
    pollStatus(result.id);
  };
  
  return (
    <div className="app">
      <header>
        <h1>可视化任务编排与执行系统</h1>
      </header>
      <div className="main-layout">
        <div className="left-panel">
          <ChatPanel onDagGenerated={handleDagGenerated} />
        </div>
        <div className="right-panel">
          {dag && (
            <>
              <DagViewer nodes={dag.nodes} edges={dag.edges} />
              <button onClick={handleConfirm} disabled={executing}>
                {executing ? '执行中...' : '确认并执行'}
              </button>
            </>
          )}
          {recordId && <ExecutionMonitor recordId={recordId} />}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 添加样式**

```css
/* App.css */
.app { display: flex; flex-direction: column; height: 100vh; }
.main-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px; flex: 1; }
.left-panel { display: flex; flex-direction: column; }
.right-panel { display: flex; flex-direction: column; gap: 16px; }
.chat-panel { flex: 1; display: flex; flex-direction: column; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
.messages { flex: 1; overflow-y: auto; margin-bottom: 16px; }
.message { padding: 8px 12px; margin-bottom: 8px; border-radius: 8px; }
.message.user { background: #eef2ff; align-self: flex-end; }
.message.assistant { background: #f8fafc; align-self: flex-start; }
.input-area { display: flex; gap: 8px; }
.input-area input { flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; }
.input-area button { padding: 8px 16px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
```

- [ ] **Step 3: Commit**

```bash
git add workflow-app/frontend/src/App.tsx
git add workflow-app/frontend/src/App.css
git commit -m "feat: integrate main page with chat, DAG viewer, and execution monitor"
```

---

### Task 10: 条件分支路由实现

**Files:**
- Create: `workflow-app/backend/src/main/java/com/workflow/engine/ConditionRouter.java`

- [ ] **Step 1: 实现条件分支路由**

```java
@Component
public class ConditionRouter {
    
    public boolean evaluateCondition(String condition, Map<String, Object> nodeOutput) {
        // condition 格式: "output.field == 'value'" 或 "output.field > 10"
        // 简单实现：支持 ==, !=, >, <, contains
        
        if (condition == null || condition.isEmpty()) return true;
        
        String[] parts = condition.split(" ");
        if (parts.length < 3) return true;
        
        String field = parts[0].replace("output.", "");
        String operator = parts[1];
        String value = parts[2];
        
        Object actualValue = nodeOutput.get(field);
        if (actualValue == null) return false;
        
        switch (operator) {
            case "==": return actualValue.toString().equals(value);
            case "!=": return !actualValue.toString().equals(value);
            case ">": return Double.parseDouble(actualValue.toString()) > Double.parseDouble(value);
            case "<": return Double.parseDouble(actualValue.toString()) < Double.parseDouble(value);
            case "contains": return actualValue.toString().contains(value);
            default: return true;
        }
    }
}
```

- [ ] **Step 2: 集成到 ExecutionEngine**

修改 ExecutionEngine 的 shouldActivate 方法，使用 ConditionRouter 判断条件分支。

- [ ] **Step 3: Commit**

```bash
git add workflow-app/backend/src/main/java/com/workflow/engine/ConditionRouter.java
git commit -m "feat: add condition branch routing for DAG edges"
```

---

### Task 11: 配置与启动脚本

**Files:**
- Create: `workflow-app/docker-compose.yml`
- Create: `workflow-app/start.sh`
- Create: `workflow-app/README.md`

- [ ] **Step 1: 创建 docker-compose**

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_AI_OPENAI_API_KEY=${OPENAI_API_KEY}
      - SPRING_AI_OPENAI_BASE_URL=${OPENAI_BASE_URL}
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

- [ ] **Step 2: 创建启动脚本**

```bash
#!/bin/bash
# 启动后端
cd backend && mvn spring-boot:run &
# 启动前端
cd frontend && npm run dev &
wait
```

- [ ] **Step 3: Commit**

```bash
git add workflow-app/docker-compose.yml
git add workflow-app/start.sh
git add workflow-app/README.md
git commit -m "docs: add deployment config and README"
```

---

## 自检

### Spec 覆盖
- [x] Task 1: 项目初始化
- [x] Task 2: 三张核心表 (flow_data, execution_snapshot, execution_record)
- [x] Task 3: DAG 数据结构 + Plan Agent (含环路检测)
- [x] Task 4: KAHN 并行执行引擎 + Sub Agent 分发
- [x] Task 5: 断点恢复 (节点级快照)
- [x] Task 6: 三级异常治理 (重试/超时/异常处理)
- [x] Task 7: 前端 DAG 可视化 (React Flow)
- [x] Task 8: REST API + 完整流程编排
- [x] Task 9: 前端主页面集成
- [x] Task 10: 条件分支路由
- [x] Task 11: 部署配置

### 待完善
- 动态 Schema 注入 (已在 Task 4 Step 2 中实现基础版本)
- 压缩策略兜底 (需要额外实现)
- 实际 LLM API 调用 (需要 API Key)
