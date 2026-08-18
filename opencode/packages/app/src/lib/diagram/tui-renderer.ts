import type { FlowData, FlowNode, FlowEdge } from "../../lib/diagram/types"

interface TUIRendererOptions {
  width?: number
  height?: number
  indent?: string
}

export function renderDiagramTUI(flowData: FlowData, options: TUIRendererOptions = {}): string {
  const { width = 80, height = 24, indent = "  " } = options
  const lines: string[] = []

  if (flowData.nodes.length === 0) {
    return "(empty diagram)"
  }

  const roots = findRoots(flowData)
  if (roots.length > 0) {
    lines.push("Diagram Structure:")
    lines.push("")
    for (const root of roots) {
      renderNodeTree(flowData, root, lines, indent, 0)
    }
  } else {
    lines.push("Diagram Nodes:")
    lines.push("")
    for (const node of flowData.nodes) {
      lines.push(`${indent}${node.label} (${node.type})`)
    }
  }

  lines.push("")
  lines.push(`Total: ${flowData.nodes.length} nodes, ${flowData.edges.length} edges`)

  return lines.join("\n")
}

function findRoots(flowData: FlowData): FlowNode[] {
  const childIds = new Set(flowData.edges.map((e) => e.target))
  return flowData.nodes.filter((n) => !childIds.has(n.id))
}

function renderNodeTree(
  flowData: FlowData,
  node: FlowNode,
  lines: string[],
  indent: string,
  depth: number
) {
  const prefix = indent.repeat(depth)
  const childEdges = flowData.edges.filter((e) => e.source === node.id)

  if (childEdges.length === 0) {
    lines.push(`${prefix}${getNodeIcon(node.type)} ${node.label}`)
    return
  }

  lines.push(`${prefix}${getNodeIcon(node.type)} ${node.label}`)

  for (const edge of childEdges) {
    const child = flowData.nodes.find((n) => n.id === edge.target)
    if (child) {
      const edgeLabel = edge.label ? ` (${edge.label})` : ""
      lines.push(`${prefix}${indent}├──${edgeLabel}`)
      renderNodeTree(flowData, child, lines, indent, depth + 1)
    }
  }
}

function getNodeIcon(type: string): string {
  const icons: Record<string, string> = {
    block: "□",
    decision: "◇",
    database: "◎",
    actor: "●",
    group: "▣",
    mindmap: "○",
    note: "□",
  }
  return icons[type] || "□"
}

export function renderMermaidTUI(mermaid: string): string {
  const lines: string[] = []
  const mermaidLines = mermaid.split("\n")

  lines.push("Mermaid Diagram (text representation):")
  lines.push("")

  for (const line of mermaidLines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith("graph") || trimmed.startsWith("flowchart")) {
      lines.push(`[${trimmed}]`)
    } else if (trimmed.includes("-->")) {
      const [source, target] = trimmed.split("-->").map((s) => s.trim())
      lines.push(`  ${source} → ${target}`)
    } else if (trimmed.includes("->>")) {
      const [source, rest] = trimmed.split("->>").map((s) => s.trim())
      const [target, message] = rest.split(":").map((s) => s.trim())
      lines.push(`  ${source} →> ${target}: ${message}`)
    } else if (trimmed.startsWith("subgraph")) {
      lines.push(`  [subgraph ${trimmed.replace("subgraph ", "")}]`)
    } else if (trimmed === "end") {
      lines.push(`  [/subgraph]`)
    } else {
      lines.push(`  ${trimmed}`)
    }
  }

  return lines.join("\n")
}

export function renderNodeDescription(node: FlowNode): string {
  const parts: string[] = []
  parts.push(`Type: ${node.type}`)
  parts.push(`Label: ${node.label}`)
  parts.push(`ID: ${node.id}`)
  if (node.x !== undefined && node.y !== undefined) {
    parts.push(`Position: (${node.x}, ${node.y})`)
  }
  return parts.join(", ")
}

export function renderEdgeDescription(edge: FlowEdge): string {
  const parts: string[] = []
  parts.push(`${edge.source} → ${edge.target}`)
  if (edge.label) {
    parts.push(`Label: ${edge.label}`)
  }
  parts.push(`Type: ${edge.type}`)
  return parts.join(", ")
}
