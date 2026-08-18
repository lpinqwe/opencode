import { describe, it, expect } from "bun:test"
import {
  detectDiagramType,
  validateMermaid,
  parseFlowchart,
  generateMermaidId,
  sanitizeMermaidId,
} from "./mermaid-utils"

describe("detectDiagramType", () => {
  it("detects graph TD", () => {
    expect(detectDiagramType("graph TD\n  A --> B")).toBe("graph")
  })

  it("detects graph LR", () => {
    expect(detectDiagramType("graph LR\n  A --> B")).toBe("graph")
  })

  it("detects flowchart", () => {
    expect(detectDiagramType("flowchart TD\n  A --> B")).toBe("graph")
  })

  it("detects sequenceDiagram", () => {
    expect(detectDiagramType("sequenceDiagram\n  participant A\n  participant B")).toBe("sequence")
  })

  it("detects classDiagram", () => {
    expect(detectDiagramType("classDiagram\n  class Animal")).toBe("class")
  })

  it("detects erDiagram", () => {
    expect(detectDiagramType("erDiagram\n  USERS {}")).toBe("er")
  })

  it("detects stateDiagram", () => {
    expect(detectDiagramType("stateDiagram-v2\n  [*] --> Idle")).toBe("state")
  })

  it("detects mindmap", () => {
    expect(detectDiagramType("mindmap\n  root\n    A")).toBe("mindmap")
  })

  it("detects gantt", () => {
    expect(detectDiagramType("gantt\n  title Test")).toBe("gantt")
  })

  it("detects C4Context", () => {
    expect(detectDiagramType("C4Context\n  title Test")).toBe("c4")
  })

  it("defaults to graph for unknown", () => {
    expect(detectDiagramType("unknown diagram type")).toBe("graph")
  })
})

describe("validateMermaid", () => {
  it("validates empty diagram", () => {
    const result = validateMermaid("")
    expect(result.valid).toBe(false)
    expect(result.errors).toContain("Empty diagram")
  })

  it("validates simple graph", () => {
    const result = validateMermaid("graph TD\n  A --> B")
    expect(result.valid).toBe(true)
  })

  it("detects mismatched subgraph", () => {
    const result = validateMermaid("graph TD\n  subgraph SG\n  A --> B")
    expect(result.valid).toBe(false)
    expect(result.errors).toContain("Mismatched subgraph/end blocks")
  })

  it("validates sequence diagram", () => {
    const result = validateMermaid("sequenceDiagram\n  participant A\n  A->>B: hello")
    expect(result.valid).toBe(true)
  })
})

describe("parseFlowchart", () => {
  it("parses simple nodes", () => {
    const result = parseFlowchart("graph TD\n  A[Node A]\n  B[Node B]")
    expect(result.nodes.length).toBe(2)
    expect(result.nodes[0].id).toBe("A")
    expect(result.nodes[0].label).toBe("Node A")
  })

  it("parses edges", () => {
    const result = parseFlowchart("graph TD\n  A[Node A] --> B[Node B]")
    expect(result.edges.length).toBe(1)
    expect(result.edges[0].source).toBe("A")
    expect(result.edges[0].target).toBe("B")
  })

  it("parses decision nodes", () => {
    const result = parseFlowchart("graph TD\n  A{Decision}")
    expect(result.nodes[0].type).toBe("decision")
  })

  it("parses database nodes", () => {
    const result = parseFlowchart("graph TD\n  A((Database))")
    expect(result.nodes[0].type).toBe("database")
  })
})

describe("generateMermaidId", () => {
  it("generates unique ids", () => {
    const id1 = generateMermaidId()
    const id2 = generateMermaidId()
    expect(id1).not.toBe(id2)
  })

  it("generates alphanumeric ids", () => {
    const id = generateMermaidId()
    expect(id).toMatch(/^[a-z0-9]+$/)
  })
})

describe("sanitizeMermaidId", () => {
  it("removes special characters", () => {
    expect(sanitizeMermaidId("node-1")).toBe("node_1")
    expect(sanitizeMermaidId("node@1!")).toBe("node_1_")
  })

  it("keeps valid characters", () => {
    expect(sanitizeMermaidId("valid_id")).toBe("valid_id")
  })
})
