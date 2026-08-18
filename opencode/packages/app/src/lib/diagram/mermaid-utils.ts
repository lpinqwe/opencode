import type { DiagramType, ValidationResult, ParseResult, DiagramNode, DiagramEdge } from "./types"

export function detectDiagramType(mermaid: string): DiagramType {
  const trimmed = mermaid.trim()
  const firstLine = trimmed.split("\n")[0] || ""

  if (firstLine.startsWith("graph") || firstLine.startsWith("flowchart")) return "graph"
  if (firstLine.startsWith("sequenceDiagram")) return "sequence"
  if (firstLine.startsWith("classDiagram")) return "class"
  if (firstLine.startsWith("erDiagram")) return "er"
  if (firstLine.startsWith("stateDiagram")) return "state"
  if (firstLine.startsWith("mindmap")) return "mindmap"
  if (firstLine.startsWith("gantt")) return "gantt"
  if (firstLine.startsWith("C4Context")) return "c4"

  return "graph"
}

export function validateMermaid(mermaid: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const trimmed = mermaid.trim()

  if (!trimmed) {
    errors.push("Empty diagram")
    return { valid: false, errors, warnings }
  }

  const type = detectDiagramType(trimmed)

  switch (type) {
    case "graph":
      validateFlowchart(trimmed, errors, warnings)
      break
    case "sequence":
      validateSequenceDiagram(trimmed, errors, warnings)
      break
    case "class":
      validateClassDiagram(trimmed, errors, warnings)
      break
    case "er":
      validateErDiagram(trimmed, errors, warnings)
      break
    case "state":
      validateStateDiagram(trimmed, errors, warnings)
      break
    case "mindmap":
      validateMindmap(trimmed, errors, warnings)
      break
    case "gantt":
      validateGantt(trimmed, errors, warnings)
      break
    case "c4":
      validateC4(trimmed, errors, warnings)
      break
  }

  return { valid: errors.length === 0, errors, warnings }
}

function validateFlowchart(mermaid: string, errors: string[], warnings: string[]) {
  const lines = mermaid.split("\n")
  const firstLine = lines[0]

  if (!firstLine.match(/^(graph|flowchart)\s+(TD|TB|LR|BT|RL)/i)) {
    warnings.push("Flowchart should start with 'graph TD', 'graph LR', etc.")
  }

  let subgraphCount = 0
  for (const line of lines) {
    if (line.trim().startsWith("subgraph")) subgraphCount++
    if (line.trim() === "end") subgraphCount--
  }
  if (subgraphCount !== 0) {
    errors.push("Mismatched subgraph/end blocks")
  }
}

function validateSequenceDiagram(mermaid: string, errors: string[], warnings: string[]) {
  const lines = mermaid.split("\n")
  const participants = new Set<string>()

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("participant")) {
      const match = trimmed.match(/participant\s+(\w+)/)
      if (match) participants.add(match[1])
    }
  }

  if (participants.size === 0) {
    warnings.push("No participants defined in sequence diagram")
  }
}

function validateClassDiagram(mermaid: string, errors: string[], warnings: string[]) {
  const lines = mermaid.split("\n")
  let hasClass = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.match(/^class\s+\w+/) || trimmed.match(/^\w+\s*\{/) || trimmed.match(/^\w+\s*--/)) {
      hasClass = true
      break
    }
  }

  if (!hasClass) {
    warnings.push("No classes or relationships found in class diagram")
  }
}

function validateErDiagram(mermaid: string, errors: string[], warnings: string[]) {
  const lines = mermaid.split("\n")
  let hasEntity = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.match(/^\w+\s+\{/) || trimmed.match(/^\w+\s+[\w\s]*\|\|/) || trimmed.match(/^\w+\s+[\w\s]*\|\|/)) {
      hasEntity = true
      break
    }
  }

  if (!hasEntity) {
    warnings.push("No entities found in ER diagram")
  }
}

function validateStateDiagram(mermaid: string, errors: string[], warnings: string[]) {
  const lines = mermaid.split("\n")
  let hasState = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("state") || trimmed.match(/^\[?\*?\]?/)) {
      hasState = true
      break
    }
  }

  if (!hasState) {
    warnings.push("No states found in state diagram")
  }
}

function validateMindmap(mermaid: string, errors: string[], warnings: string[]) {
  const lines = mermaid.split("\n")
  const indentLevels = new Set<number>()

  for (const line of lines) {
    const indent = line.search(/\S/)
    if (indent >= 0) indentLevels.add(indent)
  }

  if (indentLevels.size < 2) {
    warnings.push("Mindmap has only one level of hierarchy")
  }
}

function validateGantt(mermaid: string, errors: string[], warnings: string[]) {
  const lines = mermaid.split("\n")
  let hasTask = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.match(/^\s+-\s+/) || trimmed.startsWith("section")) {
      hasTask = true
      break
    }
  }

  if (!hasTask) {
    warnings.push("No tasks or sections found in Gantt chart")
  }
}

function validateC4(mermaid: string, errors: string[], warnings: string[]) {
  const lines = mermaid.split("\n")
  let hasComponent = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("Person") || trimmed.startsWith("System") || trimmed.startsWith("Container") || trimmed.startsWith("Component")) {
      hasComponent = true
      break
    }
  }

  if (!hasComponent) {
    warnings.push("No C4 components found in diagram")
  }
}

export function parseFlowchart(mermaid: string): ParseResult {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const lines = mermaid.split("\n")

  let nodeId = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("graph") || trimmed.startsWith("flowchart") || trimmed.startsWith("subgraph") || trimmed === "end") {
      continue
    }

    const nodeMatch = trimmed.match(/(\w+)\[(.+?)\]/)
    if (nodeMatch) {
      nodes.push({
        id: nodeMatch[1],
        label: nodeMatch[2],
        type: "block",
      })
    }

    const decisionMatch = trimmed.match(/(\w+)\{(.+?)\}/)
    if (decisionMatch) {
      nodes.push({
        id: decisionMatch[1],
        label: decisionMatch[2],
        type: "decision",
      })
    }

    const dbMatch = trimmed.match(/(\w+)\(\((.+?)\)\)/)
    if (dbMatch) {
      nodes.push({
        id: dbMatch[1],
        label: dbMatch[2],
        type: "database",
      })
    }

    const edgeMatch = trimmed.match(/(\w+)\s*(-->|---|--\||--\|>|--)\s*(\[|\{|\(|\()?(\w+)/)
    if (edgeMatch) {
      edges.push({
        id: `e-${edgeId++}`,
        source: edgeMatch[1],
        target: edgeMatch[4],
        type: "solid",
      })
    }
  }

  return {
    type: "graph",
    nodes,
    edges,
    raw: mermaid,
  }
}

let edgeId = 0

export function generateMermaidId(): string {
  return Math.random().toString(36).substring(2, 8)
}

export function sanitizeMermaidId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_")
}
