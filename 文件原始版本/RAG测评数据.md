# 程愚瀚《RAG检索优化：从68%到81.2%》7张图表完整文字版数据
## 一、实验基础信息
数据集：C-MTEB / T2Retrieval，语料12w，分块后36w，2000条query测试
模型：BAAI/bge-m3（dense+sparse）、bge-reranker-v2-m3
向量库：Milvus HNSW索引
融合规则：fixed固定权重=0.6*dense+0.4*sparse；RRF k=60；rerank候选池50条
测试方法分类（共9组）：
1. bm25：纯关键词检索
2. embedding：纯dense向量（基线Baseline）
3. sparse_bge：纯bge sparse稀疏向量
4. fixed_bm25_dense：BM25+dense固定权重融合
5. fixed_sparse_dense：sparse+dense固定权重融合
6. rrf_bm25_dense：BM25+dense RRF融合
7. rrf_sparse_dense：sparse+dense RRF融合
8. rerank_bm25_dense：BM25+dense RRF + Rerank
9. rerank_sparse_dense：sparse+dense RRF + Rerank（最优方案）

## 二、7张图表对应全量数值（所有指标统一@5）
### 图表1：recall_cap@5（核心召回指标）
| 检索方案            | recall_cap@5 |
|---------------------|--------------|
| bm25                | 61.5%        |
| embedding（基线）| 68.38%       |
| sparse_bge          | 68.9%        |
| fixed_bm25_dense    | 75.66%       |
| fixed_sparse_dense  | 76.66%       |
| rrf_bm25_dense      | 76.3%        |
| rrf_sparse_dense    | 77.0%        |
| rerank_bm25_dense   | 79.5%        |
| rerank_sparse_dense | 81.2%        |

### 图表2：recall@5（标准召回率）
| 检索方案            | recall@5 |
|---------------------|----------|
| bm25                | 49.2%    |
| embedding（基线）| 56.5%    |
| sparse_bge          | 57.1%    |
| fixed_bm25_dense    | 63.4%    |
| fixed_sparse_dense  | 64.2%    |
| rrf_bm25_dense      | 64.0%    |
| rrf_sparse_dense    | 64.7%    |
| rerank_bm25_dense   | 66.1%    |
| rerank_sparse_dense | 67.5%    |

### 图表3：NDCG@5（排序整体质量）
| 检索方案            | ndcg@5 |
|---------------------|--------|
| bm25                | 63.7%  |
| embedding（基线）| 71.6%  |
| sparse_bge          | 72.3%  |
| fixed_bm25_dense    | 78.5%  |
| fixed_sparse_dense  | 79.2%  |
| rrf_bm25_dense      | 79.0%  |
| rrf_sparse_dense    | 79.8%  |
| rerank_bm25_dense   | 80.7%  |
| rerank_sparse_dense | 82.1%  |

### 图表4：MRR@5（首位相关文档排名）
| 检索方案            | mrr@5 |
|---------------------|-------|
| bm25                | 78.6% |
| embedding（基线）| 85.6% |
| sparse_bge          | 86.1% |
| fixed_bm25_dense    | 88.3% |
| fixed_sparse_dense  | 88.7% |
| rrf_bm25_dense      | 88.6% |
| rrf_sparse_dense    | 89.2% |
| rerank_bm25_dense   | 90.3% |
| rerank_sparse_dense | 91.1% |

### 图表5：Precision@1（第一条结果精准度）
| 检索方案            | precision@1 |
|---------------------|-------------|
| bm25                | 74.1%       |
| embedding（基线）| 82.6%       |
| sparse_bge          | 83.2%       |
| fixed_bm25_dense    | 85.1%       |
| fixed_sparse_dense  | 85.6%       |
| rrf_bm25_dense      | 85.4%       |
| rrf_sparse_dense    | 86.0%       |
| rerank_bm25_dense   | 87.3%       |
| rerank_sparse_dense | 88.2%       |

### 图表6：F1@5（召回+精确调和平均）
| 检索方案            | f1@5  |
|---------------------|-------|
| bm25                | 42.3% |
| embedding（基线）| 47.9% |
| sparse_bge          | 48.4% |
| fixed_bm25_dense    | 54.1% |
| fixed_sparse_dense  | 54.8% |
| rrf_bm25_dense      | 54.6% |
| rrf_sparse_dense    | 55.3% |
| rerank_bm25_dense   | 56.2% |
| rerank_sparse_dense | 57.3% |

### 图表7：Average End-to-End Latency 端到端延迟（单位：秒s，图中柱状图）
| 检索方案            | 平均延迟(秒) | 换算ms |
|---------------------|--------------|--------|
| bm25                | 0.01         | 10ms   |
| embedding（基线）| 0.055        | 55ms   |
| sparse_bge          | 0.056        | 56ms   |
| fixed_bm25_dense    | 0.061        | 61ms   |
| fixed_sparse_dense  | 0.062        | 62ms   |
| rrf_bm25_dense      | 0.062        | 62ms   |
| rrf_sparse_dense    | 0.063        | 63ms   |
| rerank_bm25_dense   | 0.345        | 345ms  |
| rerank_sparse_dense | 0.362        | 362ms  |

## 三、阶梯优化消融实验对比（原文核心链路）
1. Baseline：纯dense embedding
   recall_cap@5 = 68.38%，延迟55ms
2. + BM25混合检索（fixed融合）
   recall_cap@5 = 75.66%，提升+7.28pp，延迟61ms
3. BM25替换为bge sparse向量（fixed_sparse_dense）
   recall_cap@5 = 76.66%，再+1.00pp，延迟62ms
4. 融合方式改为RRF + 增加Rerank重排（rerank_sparse_dense）
   recall_cap@5 = 81.2%，再+4.54pp，总提升+12.82pp，延迟飙升至362ms

## 四、固定权重融合 vs RRF融合（有无Rerank差异）
1. **无Rerank（仅融合检索）**
   fixed_sparse_dense：76.66%；rrf_sparse_dense：77.0%，差距仅0.34pp，效果几乎持平
2. **开启Rerank后**
   fixed融合+rerank：提升不足1pp；RRF融合+rerank直接冲到81.2%，差距显著

## 五、最优方案完整7项指标汇总（rerank_sparse_dense）
| 指标           | 基线dense | 最优方案 | 提升幅度 |
|----------------|-----------|----------|----------|
| recall_cap@5   | 68.4%     | 81.2%    | +12.8pp  |
| recall@5       | 56.5%     | 67.5%    | +11.0pp  |
| ndcg@5         | 71.6%     | 82.1%    | +10.5pp  |
| mrr@5          | 85.6%     | 91.1%    | +5.5pp   |
| precision@1    | 82.6%     | 88.2%    | +5.6pp   |
| f1@5           | 47.9%     | 57.3%    | +9.4pp   |
| 延迟           | 55ms      | 362ms    | +307ms   |

需要我把这份数据整理成可直接复制的Excel纯表格文本吗？