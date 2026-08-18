import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import DESCRIPTION from "./diagram.txt"
import path from "path"

const DIAGRAMS_DIR = ".opencode/diagrams"

const DiagramType = Schema.Literal("graph", "sequence", "class", "er", "state", "mindmap", "gantt", "c4")

const Parameters = Schema.Struct({
  operation: Schema.Literals(["create", "read", "edit", "list", "delete", "explain"]).annotate({
    description: "Operation to perform on diagrams",
  }),
  name: Schema.String.pipe(Schema.optional).annotate({
    description: "Name of the diagram (used as filename .mmd)",
  }),
  mermaid_code: Schema.String.pipe(Schema.optional).annotate({
    description: "Mermaid code for create/edit operations",
  }),
  type: DiagramType.pipe(Schema.optional).annotate({
    description: "Diagram type (default: graph)",
  }),
})

type Metadata = {
  diagrams?: ReadonlyArray<{ name: string; type: string }>
  name?: string
  type?: string
}

function ensureDiagramsDir(dir: string): Effect.Effect<void> {
  return Effect.try({
    try: () => {
      const fs = require("fs")
      const fullPath = path.join(dir, DIAGRAMS_DIR)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
    },
    catch: (error) => new Error(`Failed to create diagrams directory: ${error}`),
  })
}

function getDiagramPath(dir: string, name: string): string {
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_")
  return path.join(dir, DIAGRAMS_DIR, `${safeName}.mmd`)
}

function listDiagramFiles(dir: string): Effect.Effect<Array<{ name: string; type: string }>> {
  return Effect.try({
    try: () => {
      const fs = require("fs")
      const fullPath = path.join(dir, DIAGRAMS_DIR)
      if (!fs.existsSync(fullPath)) return []
      const files = fs.readdirSync(fullPath).filter((f: string) => f.endsWith(".mmd"))
      return files.map((f: string) => {
        const content = fs.readFileSync(path.join(fullPath, f), "utf8")
        const typeMatch = content.match(/^(graph|sequenceDiagram|classDiagram|erDiagram|stateDiagram|mindmap|gantt|C4Context)/m)
        return {
          name: f.replace(/\.mmd$/, ""),
          type: typeMatch ? typeMatch[0] : "graph",
        }
      })
    },
    catch: () => [] as Array<{ name: string; type: string }>,
  })
}

function readDiagramFile(dir: string, name: string): Effect.Effect<{ mermaid: string; type: string }> {
  return Effect.try({
    try: () => {
      const fs = require("fs")
      const filePath = getDiagramPath(dir, name)
      if (!fs.existsSync(filePath)) throw new Error(`Diagram not found: ${name}`)
      const content = fs.readFileSync(filePath, "utf8")
      const typeMatch = content.match(/^(graph|sequenceDiagram|classDiagram|erDiagram|stateDiagram|mindmap|gantt|C4Context)/m)
      return {
        mermaid: content,
        type: typeMatch ? typeMatch[0] : "graph",
      }
    },
    catch: (error) => new Error(`Failed to read diagram: ${error}`),
  })
}

function writeDiagramFile(dir: string, name: string, content: string): Effect.Effect<void> {
  return Effect.try({
    try: () => {
      const fs = require("fs")
      const filePath = getDiagramPath(dir, name)
      fs.writeFileSync(filePath, content, "utf8")
    },
    catch: (error) => new Error(`Failed to write diagram: ${error}`),
  })
}

function deleteDiagramFile(dir: string, name: string): Effect.Effect<void> {
  return Effect.try({
    try: () => {
      const fs = require("fs")
      const filePath = getDiagramPath(dir, name)
      if (!fs.existsSync(filePath)) throw new Error(`Diagram not found: ${name}`)
      fs.unlinkSync(filePath)
    },
    catch: (error) => new Error(`Failed to delete diagram: ${error}`),
  })
}

function explainDiagram(mermaid: string): string {
  const lines = mermaid.trim().split("\n")
  const firstLine = lines[0] || ""
  const typeMatch = firstLine.match(/^(graph|sequenceDiagram|classDiagram|erDiagram|stateDiagram|mindmap|gantt|C4Context)\s*(.*)$/)

  if (!typeMatch) {
    return `This diagram contains ${lines.length} lines of Mermaid code. Its structure is not immediately recognizable by type.`
  }

  const diagramType = typeMatch[1]
  const direction = typeMatch[2]?.trim()

  const nodeCount = (mermaid.match(/\[[^\]]*\]/g) || []).length +
    (mermaid.match(/\([^)]*\)/g) || []).length +
    (mermaid.match(/\{[^}]*\}/g) || []).length

  const edgeCount = (mermaid.match(/-->/g) || []).length +
    (mermaid.match(/---/g) || []).length +
    (mermaid.match(/--\|/g) || []).length +
    (mermaid.match(/\.\./g) || []).length

  const descriptions: Record<string, string> = {
    graph: `A flowchart diagram${direction ? ` flowing ${direction}` : ""} with approximately ${nodeCount} nodes and ${edgeCount} connections. It shows the flow or relationship between components.`,
    sequenceDiagram: `A sequence diagram showing the interaction between components over time. It contains ${edgeCount} message exchanges.`,
    classDiagram: `A class diagram showing the structure of classes and their relationships. It contains approximately ${nodeCount} classes/interfaces with ${edgeCount} relationships.`,
    erDiagram: `An entity-relationship diagram showing database structure. It contains approximately ${nodeCount} entities with ${edgeCount} relationships.`,
    stateDiagram: `A state diagram showing the states and transitions of a system. It contains approximately ${nodeCount} states with ${edgeCount} transitions.`,
    mindmap: `A mind map showing a hierarchical structure with approximately ${nodeCount} nodes branching from central concepts.`,
    gantt: `A Gantt chart showing a timeline or project plan with approximately ${nodeCount} tasks.`,
    C4Context: `A C4 context diagram showing system architecture with approximately ${nodeCount} components and ${edgeCount} interactions.`,
  }

  return descriptions[diagramType] || `A ${diagramType} diagram with approximately ${nodeCount} nodes and ${edgeCount} connections.`
}

export const DiagramTool = Tool.define<typeof Parameters, Metadata>(
  "diagram",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context<Metadata>) =>
        Effect.gen(function* () {
          const dir = ctx.extra?.directory ?? process.cwd()

          switch (params.operation) {
            case "create": {
              if (!params.name) return { title: "Create diagram", output: "Error: name is required", metadata: {} }
              if (!params.mermaid_code) return { title: "Create diagram", output: "Error: mermaid_code is required", metadata: {} }

              yield* ensureDiagramsDir(dir)
              yield* writeDiagramFile(dir, params.name, params.mermaid_code)

              return {
                title: `Created diagram: ${params.name}`,
                output: `Diagram "${params.name}" created successfully.\n\nMermaid code:\n\`\`\`\n${params.mermaid_code}\n\`\`\``,
                metadata: { name: params.name, type: params.type ?? "graph" },
              }
            }

            case "read": {
              if (!params.name) return { title: "Read diagram", output: "Error: name is required", metadata: {} }

              const diagram = yield* readDiagramFile(dir, params.name)

              return {
                title: `Read diagram: ${params.name}`,
                output: `Diagram "${params.name}" (${diagram.type}):\n\`\`\`\n${diagram.mermaid}\n\`\`\``,
                metadata: { name: params.name, type: diagram.type },
              }
            }

            case "edit": {
              if (!params.name) return { title: "Edit diagram", output: "Error: name is required", metadata: {} }
              if (!params.mermaid_code) return { title: "Edit diagram", output: "Error: mermaid_code is required", metadata: {} }

              yield* writeDiagramFile(dir, params.name, params.mermaid_code)

              return {
                title: `Edited diagram: ${params.name}`,
                output: `Diagram "${params.name}" updated successfully.\n\nNew Mermaid code:\n\`\`\`\n${params.mermaid_code}\n\`\`\``,
                metadata: { name: params.name, type: params.type ?? "graph" },
              }
            }

            case "list": {
              const diagrams = yield* listDiagramFiles(dir)

              if (diagrams.length === 0) {
                return {
                  title: "List diagrams",
                  output: "No diagrams found in .opencode/diagrams/",
                  metadata: { diagrams: [] },
                }
              }

              const list = diagrams.map((d) => `- ${d.name} (${d.type})`).join("\n")
              return {
                title: `Listed ${diagrams.length} diagram(s)`,
                output: `Diagrams in .opencode/diagrams/:\n${list}`,
                metadata: { diagrams },
              }
            }

            case "delete": {
              if (!params.name) return { title: "Delete diagram", output: "Error: name is required", metadata: {} }

              yield* deleteDiagramFile(dir, params.name)

              return {
                title: `Deleted diagram: ${params.name}`,
                output: `Diagram "${params.name}" deleted successfully.`,
                metadata: { name: params.name },
              }
            }

            case "explain": {
              if (!params.name) {
                if (params.mermaid_code) {
                  const explanation = explainDiagram(params.mermaid_code)
                  return {
                    title: "Explained diagram",
                    output: explanation,
                    metadata: {},
                  }
                }
                return { title: "Explain diagram", output: "Error: name or mermaid_code is required", metadata: {} }
              }

              const diagram = yield* readDiagramFile(dir, params.name)
              const explanation = explainDiagram(diagram.mermaid)

              return {
                title: `Explained diagram: ${params.name}`,
                output: `Diagram "${params.name}" (${diagram.type}):\n${explanation}\n\nFull Mermaid code:\n\`\`\`\n${diagram.mermaid}\n\`\`\``,
                metadata: { name: params.name, type: diagram.type },
              }
            }

            default:
              return { title: "Diagram operation", output: "Unknown operation", metadata: {} }
          }
        }).pipe(Effect.orDie),
    }
  }),
)
