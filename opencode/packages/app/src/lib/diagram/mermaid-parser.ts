import type { DiagramType, ParseResult, DiagramNode, DiagramEdge } from "./types"
import { detectDiagramType, parseFlowchart } from "./mermaid-utils"

export function parseMermaid(mermaid: string): ParseResult {
  const type = detectDiagramType(mermaid)

  switch (type) {
    case "graph":
      return parseFlowchart(mermaid)
    case "sequence":
      return parseSequenceDiagram(mermaid)
    case "class":
      return parseClassDiagram(mermaid)
    case "er":
      return parseErDiagram(mermaid)
    case "state":
      return parseStateDiagram(mermaid)
    case "mindmap":
      return parseMindmap(mermaid)
    case "gantt":
      return parseGantt(mermaid)
    case "c4":
      return parseC4(mermaid)
    default:
      return { type: "graph", nodes: [], edges: [], raw: mermaid }
  }
}

function parseSequenceDiagram(mermaid: string): ParseResult {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const lines = mermaid.split("\n")
  let edgeIdx = 0

  for (const line of lines) {
    const trimmed = line.trim()
    const participantMatch = trimmed.match(/^participant\s+(\w+)\s+as\s+(.+)$/)
    if (participantMatch) {
      nodes.push({
        id: participantMatch[1],
        label: participantMatch[2],
        type: "actor",
      })
      continue
    }

    const simpleParticipant = trimmed.match(/^participant\s+(\w+)$/)
    if (simpleParticipant) {
      nodes.push({
        id: simpleParticipant[1],
        label: simpleParticipant[1],
        type: "actor",
      })
      continue
    }

    const arrowMatch = trimmed.match(/^(\w+)\s*(->>|-->>|->|-->)\s*(\w+)\s*:\s*(.+)$/)
    if (arrowMatch) {
      edges.push({
        id: `e-${edgeIdx++}`,
        source: arrowMatch[1],
        target: arrowMatch[3],
        label: arrowMatch[4],
        type: "solid",
      })
    }
  }

  return { type: "sequence", nodes, edges, raw: mermaid }
}

function parseClassDiagram(mermaid: string): ParseResult {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const lines = mermaid.split("\n")
  let edgeIdx = 0

  for (const line of lines) {
    const trimmed = line.trim()

    const classMatch = trimmed.match(/^class\s+(\w+)\s*\{/)
    if (classMatch) {
      nodes.push({
        id: classMatch[1],
        label: classMatch[1],
        type: "block",
      })
      continue
    }

    const relMatch = trimmed.match(/^(\w+)\s*(<\|--|<\|\--|\*--|o--|--|-->|<-->|<\|--\*|<\|--o|--\*|--o|<\|\|--\*|<\|\|--o)\s*(\w+)(\s*:\s*(.+))?$/)
    if (relMatch) {
      edges.push({
        id: `e-${edgeIdx++}`,
        source: relMatch[1],
        target: relMatch[3],
        label: relMatch[5] || undefined,
        type: "solid",
      })
    }
  }

  return { type: "class", nodes, edges, raw: mermaid }
}

function parseErDiagram(mermaid: string): ParseResult {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const lines = mermaid.split("\n")
  let edgeIdx = 0

  for (const line of lines) {
    const trimmed = line.trim()

    const entityMatch = trimmed.match(/^(\w+)\s*\{/)
    if (entityMatch) {
      nodes.push({
        id: entityMatch[1],
        label: entityMatch[1],
        type: "block",
      })
      continue
    }

    const relMatch = trimmed.match(/^(\w+)\s+([\w|]+)\s+(\w+)\s+(.+)$/)
    if (relMatch) {
      edges.push({
        id: `e-${edgeIdx++}`,
        source: relMatch[1],
        target: relMatch[3],
        label: `${relMatch[2]} ${relMatch[4]}`,
        type: "solid",
      })
    }
  }

  return { type: "er", nodes, edges, raw: mermaid }
}

function parseStateDiagram(mermaid: string): ParseResult {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const lines = mermaid.split("\n")
  let edgeIdx = 0

  for (const line of lines) {
    const trimmed = line.trim()

    const stateMatch = trimmed.match(/^\[?(\w+)\]?$/)
    if (stateMatch && !trimmed.includes("-->")) {
      nodes.push({
        id: stateMatch[1],
        label: stateMatch[1],
        type: "block",
      })
      continue
    }

    const arrowMatch = trimmed.match(/^(\w+)\s*-->\s*(\w+)(\s*:\s*(.+))?$/)
    if (arrowMatch) {
      edges.push({
        id: `e-${edgeIdx++}`,
        source: arrowMatch[1],
        target: arrowMatch[2],
        label: arrowMatch[4] || undefined,
        type: "solid",
      })
    }
  }

  return { type: "state", nodes, edges, raw: mermaid }
}

function parseMindmap(mermaid: string): ParseResult {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const lines = mermaid.split("\n")
  let nodeId = 0

  const stack: Array<{ id: string; indent: number }> = []

  for (const line of lines) {
    const indent = line.search(/\S/)
    if (indent < 0) continue

    const content = line.trim()
    const id = `node-${nodeId++}`

    nodes.push({
      id,
      label: content,
      type: "mindmap",
    })

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    if (stack.length > 0) {
      const parent = stack[stack.length - 1]
      edges.push({
        id: `e-${edges.length}`,
        source: parent.id,
        target: id,
        type: "solid",
      })
    }

    stack.push({ id, indent })
  }

  return { type: "mindmap", nodes, edges, raw: mermaid }
}

function parseGantt(mermaid: string): ParseResult {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const lines = mermaid.split("\n")
  let nodeId = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("section")) {
      nodes.push({
        id: `section-${nodeId++}`,
        label: trimmed.replace("section ", ""),
        type: "group",
      })
    } else if (trimmed.match(/^\s*-\s+/)) {
      const taskMatch = trimmed.match(/^-\s+(.+)$/)
      if (taskMatch) {
        nodes.push({
          id: `task-${nodeId++}`,
          label: taskMatch[1],
          type: "block",
        })
      }
    }
  }

  return { type: "gantt", nodes, edges, raw: mermaid }
}

function parseC4(mermaid: string): ParseResult {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const lines = mermaid.split("\n")
  let edgeIdx = 0

  for (const line of lines) {
    const trimmed = line.trim()

    const personMatch = trimmed.match(/^Person\((\w+),\s*"(.+?)"(?:,\s*"(.+?)")?\)/)
    if (personMatch) {
      nodes.push({
        id: personMatch[1],
        label: personMatch[2],
        type: "actor",
        metadata: { description: personMatch[3] },
      })
      continue
    }

    const systemMatch = trimmed.match(/^System\((\w+),\s*"(.+?)"(?:,\s*"(.+?)")?\)/)
    if (systemMatch) {
      nodes.push({
        id: systemMatch[1],
        label: systemMatch[2],
        type: "block",
        metadata: { description: systemMatch[3] },
      })
      continue
    }

    const containerMatch = trimmed.match(/^Container\((\w+),\s*"(.+?)"(?:,\s*"(.+?)")?(?:,\s*"(.+?)")?\)/)
    if (containerMatch) {
      nodes.push({
        id: containerMatch[1],
        label: containerMatch[2],
        type: "block",
        metadata: { technology: containerMatch[3], description: containerMatch[4] },
      })
      continue
    }

    const relMatch = trimmed.match(/^Rel\((\w+),\s*(\w+),\s*"(.+?)"(?:,\s*"(.+?)")?\)/)
    if (relMatch) {
      edges.push({
        id: `e-${edgeIdx++}`,
        source: relMatch[1],
        target: relMatch[2],
        label: relMatch[3],
        type: "solid",
        metadata: { technology: relMatch[4] },
      })
    }
  }

  return { type: "c4", nodes, edges, raw: mermaid }
}
