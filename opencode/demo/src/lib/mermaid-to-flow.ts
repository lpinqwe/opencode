import type { ParseResult, FlowNode, FlowEdge, DiagramNode, DiagramEdge } from "./types"

export interface FlowData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export function mermaidToFlow(parseResult: ParseResult): FlowData {
  const nodes = parseResult.nodes.map((node, index) => convertNode(node, index))
  const edges = parseResult.edges.map((edge, index) => convertEdge(edge, index, parseResult.nodes))

  return { nodes, edges }
}

function convertNode(node: DiagramNode, index: number): FlowNode {
  const baseNode: FlowNode = {
    id: node.id,
    x: node.x ?? (index % 4) * 200 + 50,
    y: node.y ?? Math.floor(index / 4) * 150 + 50,
    width: node.width ?? 150,
    height: node.height ?? 60,
    label: node.label,
    type: node.type,
  }

  return baseNode
}

function convertEdge(edge: DiagramEdge, index: number, nodes: DiagramNode[]): FlowEdge {
  return {
    id: edge.id || `e-${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: edge.type,
  }
}

export function flowToMermaid(flowData: FlowData, diagramType: string = "graph"): string {
  const lines: string[] = []

  switch (diagramType) {
    case "graph":
      lines.push(...flowToFlowchart(flowData))
      break
    case "sequence":
      lines.push(...flowToSequenceDiagram(flowData))
      break
    case "class":
      lines.push(...flowToClassDiagram(flowData))
      break
    case "er":
      lines.push(...flowToErDiagram(flowData))
      break
    case "state":
      lines.push(...flowToStateDiagram(flowData))
      break
    case "mindmap":
      lines.push(...flowToMindmap(flowData))
      break
    case "gantt":
      lines.push(...flowToGantt(flowData))
      break
    case "c4":
      lines.push(...flowToC4(flowData))
      break
    default:
      lines.push(...flowToFlowchart(flowData))
  }

  return lines.join("\n")
}

function flowToFlowchart(flowData: FlowData): string[] {
  const lines: string[] = ["graph TD"]

  for (const node of flowData.nodes) {
    switch (node.type) {
      case "decision":
        lines.push(`    ${node.id}{${node.label}}`)
        break
      case "database":
        lines.push(`    ${node.id}((${node.label}))`)
        break
      case "actor":
        lines.push(`    ${node.id}[(${node.label})]`)
        break
      default:
        lines.push(`    ${node.id}[${node.label}]`)
    }
  }

  lines.push("")

  for (const edge of flowData.edges) {
    const label = edge.label ? `|${edge.label}|` : ""
    switch (edge.type) {
      case "dashed":
        lines.push(`    ${edge.source} -.${label}.-> ${edge.target}`)
        break
      case "thick":
        lines.push(`    ${edge.source} ==>${label} ${edge.target}`)
        break
      default:
        lines.push(`    ${edge.source} -->${label} ${edge.target}`)
    }
  }

  return lines
}

function flowToSequenceDiagram(flowData: FlowData): string[] {
  const lines: string[] = ["sequenceDiagram"]

  for (const node of flowData.nodes) {
    if (node.type === "actor") {
      lines.push(`    participant ${node.id} as ${node.label}`)
    } else {
      lines.push(`    participant ${node.id} as ${node.label}`)
    }
  }

  lines.push("")

  for (const edge of flowData.edges) {
    lines.push(`    ${edge.source}->>${edge.target}: ${edge.label || ""}`)
  }

  return lines
}

function flowToClassDiagram(flowData: FlowData): string[] {
  const lines: string[] = ["classDiagram"]

  for (const node of flowData.nodes) {
    if (node.type === "group") {
      lines.push(`    namespace ${node.id} {`)
      lines.push(`        class ${node.label}`)
      lines.push(`    }`)
    } else {
      lines.push(`    class ${node.label} {`)
      lines.push(`        +${node.label}()`)
      lines.push(`    }`)
    }
  }

  lines.push("")

  for (const edge of flowData.edges) {
    lines.push(`    ${edge.source} --> ${edge.target}`)
  }

  return lines
}

function flowToErDiagram(flowData: FlowData): string[] {
  const lines: string[] = ["erDiagram"]

  for (const node of flowData.nodes) {
    lines.push(`    ${node.label} {`)
    lines.push(`        string id`)
    lines.push(`    }`)
  }

  lines.push("")

  for (const edge of flowData.edges) {
    lines.push(`    ${edge.source} ||--o{ ${edge.target} : "${edge.label || ""}"`)
  }

  return lines
}

function flowToStateDiagram(flowData: FlowData): string[] {
  const lines: string[] = ["stateDiagram-v2"]

  for (const edge of flowData.edges) {
    const label = edge.label || ""
    lines.push(`    ${edge.source} --> ${edge.target} : ${label}`)
  }

  return lines
}

function flowToMindmap(flowData: FlowData): string[] {
  const lines: string[] = ["mindmap"]

  const roots = findRoots(flowData)
  for (const root of roots) {
    lines.push(`  ${root.label}`)
    const children = findChildren(flowData, root.id)
    for (const child of children) {
      lines.push(`    ${child.label}`)
      const grandchildren = findChildren(flowData, child.id)
      for (const grandchild of grandchildren) {
        lines.push(`      ${grandchild.label}`)
      }
    }
  }

  return lines
}

function flowToGantt(flowData: FlowData): string[] {
  const lines: string[] = ["gantt", "    title Diagram", "    dateFormat  YYYY-MM-DD"]

  let currentDate = new Date()
  for (const node of flowData.nodes) {
    if (node.type === "group") {
      lines.push(`    section ${node.label}`)
    } else {
      const dateStr = currentDate.toISOString().split("T")[0]
      lines.push(`    ${node.label} :${dateStr}, 1d`)
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  return lines
}

function flowToC4(flowData: FlowData): string[] {
  const lines: string[] = ["C4Context", '    title System Context diagram', ""]

  for (const node of flowData.nodes) {
    if (node.type === "actor") {
      lines.push(`    Person(${node.id}, "${node.label}")`)
    } else {
      lines.push(`    System(${node.id}, "${node.label}")`)
    }
  }

  lines.push("")

  for (const edge of flowData.edges) {
    lines.push(`    Rel(${edge.source}, ${edge.target}, "${edge.label || ""}")`)
  }

  return lines
}

function findRoots(flowData: FlowData): FlowNode[] {
  const childIds = new Set(flowData.edges.map((e) => e.target))
  return flowData.nodes.filter((n) => !childIds.has(n.id))
}

function findChildren(flowData: FlowData, parentId: string): FlowNode[] {
  const childIds = flowData.edges.filter((e) => e.source === parentId).map((e) => e.target)
  return flowData.nodes.filter((n) => childIds.includes(n.id))
}
