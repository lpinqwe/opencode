import type { DiagramType, FlowData, FlowNode, FlowEdge } from "./types"
import { generateMermaidId } from "./mermaid-utils"

export interface AIGenerationRequest {
  description: string
  type?: DiagramType
  context?: string
}

export interface AIGenerationResponse {
  mermaid: string
  type: DiagramType
  confidence: number
  suggestions?: string[]
}

export interface AIExplanationRequest {
  mermaid: string
}

export interface AIExplanationResponse {
  summary: string
  components: string[]
  relationships: string[]
  suggestions?: string[]
}

export interface AIConversionRequest {
  input: string
  inputType: "code" | "description" | "json"
  outputType: DiagramType
}

export interface AIConversionResponse {
  mermaid: string
  type: DiagramType
  warnings?: string[]
}

export function generateDiagramFromDescription(
  request: AIGenerationRequest
): AIGenerationResponse {
  const type = request.type || detectBestType(request.description)

  let mermaid = ""

  switch (type) {
    case "graph":
      mermaid = generateFlowchart(request.description)
      break
    case "sequence":
      mermaid = generateSequenceDiagram(request.description)
      break
    case "class":
      mermaid = generateClassDiagram(request.description)
      break
    case "er":
      mermaid = generateErDiagram(request.description)
      break
    case "state":
      mermaid = generateStateDiagram(request.description)
      break
    case "mindmap":
      mermaid = generateMindmap(request.description)
      break
    case "c4":
      mermaid = generateC4(request.description)
      break
    default:
      mermaid = generateFlowchart(request.description)
  }

  return {
    mermaid,
    type,
    confidence: 0.7,
    suggestions: generateSuggestions(request.description, type),
  }
}

function detectBestType(description: string): DiagramType {
  const lower = description.toLowerCase()

  if (lower.includes("sequence") || lower.includes("interaction") || lower.includes("api call")) {
    return "sequence"
  }
  if (lower.includes("class") || lower.includes("object") || lower.includes("inheritance")) {
    return "class"
  }
  if (lower.includes("database") || lower.includes("entity") || lower.includes("schema")) {
    return "er"
  }
  if (lower.includes("state") || lower.includes("transition") || lower.includes("machine")) {
    return "state"
  }
  if (lower.includes("mind map") || lower.includes("brainstorm") || lower.includes("hierarchy")) {
    return "mindmap"
  }
  if (lower.includes("architecture") || lower.includes("system") || lower.includes("c4")) {
    return "c4"
  }

  return "graph"
}

function generateFlowchart(description: string): string {
  const lines = ["graph TD"]
  const words = description.split(/\s+/).filter((w) => w.length > 3)
  const nodes = words.slice(0, 6).map((word, i) => ({
    id: String.fromCharCode(65 + i),
    label: word.charAt(0).toUpperCase() + word.slice(1),
  }))

  for (const node of nodes) {
    lines.push(`    ${node.id}[${node.label}]`)
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    lines.push(`    ${nodes[i].id} --> ${nodes[i + 1].id}`)
  }

  return lines.join("\n")
}

function generateSequenceDiagram(description: string): string {
  const lines = ["sequenceDiagram"]
  const words = description.split(/\s+/).filter((w) => w.length > 3)
  const participants = words.slice(0, 3).map((word, i) => ({
    id: `P${i + 1}`,
    name: word.charAt(0).toUpperCase() + word.slice(1),
  }))

  for (const p of participants) {
    lines.push(`    participant ${p.id} as ${p.name}`)
  }

  for (let i = 0; i < participants.length - 1; i++) {
    lines.push(`    ${participants[i].id}->>${participants[i + 1].id}: message`)
  }

  return lines.join("\n")
}

function generateClassDiagram(description: string): string {
  const lines = ["classDiagram"]
  const words = description.split(/\s+/).filter((w) => w.length > 3)
  const classes = words.slice(0, 3).map((word) => ({
    name: word.charAt(0).toUpperCase() + word.slice(1),
  }))

  for (const cls of classes) {
    lines.push(`    class ${cls.name} {`)
    lines.push(`        +String name`)
    lines.push(`        +void method()`)
    lines.push(`    }`)
  }

  if (classes.length >= 2) {
    lines.push(`    ${classes[0].name} <|-- ${classes[1].name}`)
  }

  return lines.join("\n")
}

function generateErDiagram(description: string): string {
  const lines = ["erDiagram"]
  const words = description.split(/\s+/).filter((w) => w.length > 3)
  const entities = words.slice(0, 3).map((word) => ({
    name: word.toUpperCase(),
  }))

  for (const entity of entities) {
    lines.push(`    ${entity.name} {`)
    lines.push(`        string id`)
    lines.push(`        string name`)
    lines.push(`    }`)
  }

  if (entities.length >= 2) {
    lines.push(`    ${entities[0].name} ||--o{ ${entities[1].name} : has`)
  }

  return lines.join("\n")
}

function generateStateDiagram(description: string): string {
  const lines = ["stateDiagram-v2"]
  const words = description.split(/\s+/).filter((w) => w.length > 3)
  const states = words.slice(0, 4).map((word) => ({
    name: word.charAt(0).toUpperCase() + word.slice(1),
  }))

  lines.push(`    [*] --> ${states[0].name}`)

  for (let i = 0; i < states.length - 1; i++) {
    lines.push(`    ${states[i].name} --> ${states[i + 1].name}`)
  }

  lines.push(`    ${states[states.length - 1].name} --> [*]`)

  return lines.join("\n")
}

function generateMindmap(description: string): string {
  const lines = ["mindmap"]
  const words = description.split(/\s+/).filter((w) => w.length > 3)
  const root = words[0] || "Root"
  const children = words.slice(1, 5)

  lines.push(`  root((${root.charAt(0).toUpperCase() + root.slice(1)}))`)

  for (const child of children) {
    lines.push(`    ${child.charAt(0).toUpperCase() + child.slice(1)}`)
  }

  return lines.join("\n")
}

function generateC4(description: string): string {
  const lines = ["C4Context"]
  lines.push('    title System Context diagram')
  lines.push("")

  lines.push('    Person(user, "User", "A user of the system")')
  lines.push('    System(app, "Application", "The main application")')

  lines.push("")
  lines.push('    Rel(user, app, "uses")')

  return lines.join("\n")
}

function generateSuggestions(description: string, type: DiagramType): string[] {
  const suggestions: string[] = []

  if (type === "graph") {
    suggestions.push("Consider adding subgraphs to group related components")
    suggestions.push("Use different node shapes for different types (rectangles for processes, diamonds for decisions)")
  }

  if (type === "sequence") {
    suggestions.push("Add notes to clarify complex interactions")
    suggestions.push("Use alt/opt/loop blocks for conditional or repeated sequences")
  }

  if (type === "class") {
    suggestions.push("Add attributes and methods to classes")
    suggestions.push("Use different relationship types (inheritance, composition, aggregation)")
  }

  if (type === "er") {
    suggestions.push("Define primary keys and foreign keys")
    suggestions.push("Specify cardinality for relationships")
  }

  if (type === "state") {
    suggestions.push("Add entry/exit actions to states")
    suggestions.push("Use compound states for hierarchical state machines")
  }

  return suggestions
}

export function explainDiagram(mermaid: string): AIExplanationResponse {
  const lines = mermaid.trim().split("\n")
  const firstLine = lines[0] || ""

  let diagramType = "graph"
  if (firstLine.startsWith("sequenceDiagram")) diagramType = "sequence"
  else if (firstLine.startsWith("classDiagram")) diagramType = "class"
  else if (firstLine.startsWith("erDiagram")) diagramType = "er"
  else if (firstLine.startsWith("stateDiagram")) diagramType = "state"
  else if (firstLine.startsWith("mindmap")) diagramType = "mindmap"
  else if (firstLine.startsWith("C4Context")) diagramType = "c4"

  const components: string[] = []
  const relationships: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.match(/^\w+\[.+\]$/)) {
      const match = trimmed.match(/^\w+\[(.+)\]$/)
      if (match) components.push(`Process: ${match[1]}`)
    }

    if (trimmed.match(/^\w+\{.+\}$/)) {
      const match = trimmed.match(/^\w+\{(.+)\}$/)
      if (match) components.push(`Decision: ${match[1]}`)
    }

    if (trimmed.match(/^\w+\(\(.+\)\)$/)) {
      const match = trimmed.match(/^\w+\(\((.+)\)\)$/)
      if (match) components.push(`Database: ${match[1]}`)
    }

    if (trimmed.includes("-->")) {
      const match = trimmed.match(/(\w+)\s*-->\s*(\w+)/)
      if (match) relationships.push(`${match[1]} flows to ${match[2]}`)
    }

    if (trimmed.includes("--")) {
      const match = trimmed.match(/(\w+)\s*--\s*(\w+)/)
      if (match) relationships.push(`${match[1]} connects to ${match[2]}`)
    }
  }

  const summary = `This is a ${diagramType} diagram with ${components.length} components and ${relationships.length} relationships.`
  const suggestions = [
    "Consider adding labels to relationships for clarity",
    "Use colors to distinguish different types of components",
  ]

  return {
    summary,
    components,
    relationships,
    suggestions,
  }
}

export function convertToCode(
  request: AIConversionRequest
): AIConversionResponse {
  const { input, inputType, outputType } = request

  let mermaid = ""

  if (inputType === "description") {
    const result = generateDiagramFromDescription({ description: input, type: outputType })
    mermaid = result.mermaid
  } else if (inputType === "json") {
    mermaid = convertJsonToMermaid(input, outputType)
  } else {
    mermaid = input
  }

  return {
    mermaid,
    type: outputType,
    warnings: ["This is an AI-generated conversion. Please review for accuracy."],
  }
}

function convertJsonToMermaid(json: string, type: DiagramType): string {
  try {
    const data = JSON.parse(json)
    return JSON.stringify(data, null, 2)
  } catch {
    return `graph TD\n    A[Invalid JSON input]`
  }
}
