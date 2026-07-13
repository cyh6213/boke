---
name: "Mermaid图表生成"
description: 用于从代码或需求生成UML类图、流程图、时序图、状态图或任何可视化图表。当用户提到"类图"、"流程图"、"时序图"、"状态图"、"ER图"、"图表"、"UML"、"mermaid"、"画图"、"生成图"时触发。
---

# Mermaid 图表生成

## 概述

使用 Mermaid + mermaid-cli (mmdc) 在本机生成白底黑字、精简清晰的各类技术图表。

## 环境信息

- **工具**: mermaid-cli (`mmdc`)
- **安装**: `npm install -g @mermaid-js/mermaid-cli`
- **验证**: `mmdc --version`

## 支持的图表类型

| 关键字 | 类型 | 用途 |
|--------|------|------|
| `classDiagram` | 类图 | 类继承、属性、方法、关系 |
| `flowchart` / `graph` | 流程图 | 流程、分支、循环 |
| `sequenceDiagram` | 时序图 | 对象间消息交互 |
| `stateDiagram-v2` | 状态图 | 状态转换 |
| `erDiagram` | ER 图 | 数据库实体关系 |
| `gantt` | 甘特图 | 项目排期 |
| `pie` | 饼图 | 占比分布 |
| `mindmap` | 思维导图 | 层级结构 |

## 用户偏好（必须遵守）

1. **白底黑字** — 所有颜色变量强制 `#FFFFFF`（背景）/ `#000000`（文字边框），禁止默认紫色/彩色
2. **内容精简** — 删掉不重要的类/节点，保留的核心元素只展示关键属性和方法，不堆砌所有成员
3. **给现有元素加属性** — 在已有类/节点上补充属性，不额外引入新类/节点
4. **排版 LR** — 默认 `direction LR`（从左到右），子元素纵向排列，避免横向一长排
5. **字号 22px** — `classFontSize` / `fontSize` 设为 `22px`
6. **图片宽度 1600px** — 渲染时 `-w 1600`
7. **版本管理** — 修改时加版本号后缀（`_v2`, `_v3`...），不覆盖旧文件
8. **直接出图** — 不需要中间方案讨论，直接生成可用图片

## 白底黑字模板

每个 `.mmd` 文件必须以以下 init 指令开头：

```
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#FFFFFF',
  'primaryTextColor': '#000000',
  'primaryBorderColor': '#000000',
  'lineColor': '#000000',
  'secondaryColor': '#FFFFFF',
  'tertiaryColor': '#FFFFFF',
  'noteBkgColor': '#FFFFFF',
  'noteTextColor': '#000000',
  'noteBorderColor': '#000000',
  'classTextColor': '#000000',
  'classBorderColor': '#000000',
  'classFontSize': '22px',
  'fontFamily': 'Arial',
  'fontSize': '22px'
}}}%%
```

## 渲染命令

```bash
mmdc -i "<输入.mmd>" -o "<输出.png>" -b white -w 1600
```

| 参数 | 说明 |
|------|------|
| `-i` | 输入 .mmd 文件路径 |
| `-o` | 输出文件路径（后缀决定格式：.png / .svg / .pdf） |
| `-b white` | 白色背景 |
| `-w 1600` | 输出宽度 1600px |
| `-s 2` | 可选，2倍渲染更清晰 |

## 完整工作流

1. 分析源码/需求，提取关键元素和关系
2. 编写 `.mmd` 文件（用白底黑字模板）
3. 执行 `mmdc` 渲染为图片
4. 根据反馈修改时，生成新版本文件（加 `_v2` 等后缀），不替换旧文件
