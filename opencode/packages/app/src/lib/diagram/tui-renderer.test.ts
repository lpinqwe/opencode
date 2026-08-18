import { describe, it, expect } from "bun:test"
import { renderDiagramTUI, renderMermaidTUI, renderNodeDescription, renderEdgeDescription } from "./tui-renderer"
import type { FlowData, FlowNode, FlowEdge } from "./types"

describe("renderDiagramTUI", () => {
  it("renders empty diagram", () => {
    const flowData: FlowData = { nodes: [], edges: [] }
    const result = renderDiagramTUI(flowData)
    expect(result).toBe("(empty diagram)")
  })

  it("renders single node", () => {
    const flowData: FlowData = {
      nodes: [{ id: "A", x: 0, y: 0, width: 150, height: 60, label: "Frontend", type: "block" }],
      edges: [],
    }
    const result = renderDiagramTUI(flowData)
    expect(result).toContain("Frontend")
    expect(result).toContain("block")
  })

  it("renders tree structure", () => {
    const flowData: FlowData = {
      nodes: [
        { id: "A", x: 0, y: 0, width: 150, height: 60, label: "Root", type: "block" },
        { id: "B", x: 200, y: 0, width: 150, height: 60, label: "Child", type: "block" },
      ],
      edges: [{ id: "e1", source: "A", target: "B", type: "solid" }],
    }
    const result = renderDiagramTUI(flowData)
    expect(result).toContain("Root")
    expect(result).toContain("Child")
    expect(result).toContain("→")
  })

  it("renders with edge labels", () => {
    const flowData: FlowData = {
      nodes: [
        { id: "A", x: 0, y: 0, width: 150, height: 60, label: "Client", type: "block" },
        { id: "B", x: 200, y: 0, width: 150, height: 60, label: "Server", type: "block" },
      ],
      edges: [{ id: "e1", source: "A", target: "B", label: "HTTP", type: "solid" }],
    }
    const result = renderDiagramTUI(flowData)
    expect(result).toContain("HTTP")
  })

  it("renders statistics", () => {
    const flowData: FlowData = {
      nodes: [
        { id: "A", x: 0, y: 0, width: 150, height: 60, label: "Node A", type: "block" },
        { id: "B", x: 200, y: 0, width: 150, height: 60, label: "Node B", type: "block" },
      ],
      edges: [{ id: "e1", source: "A", target: "B", type: "solid" }],
    }
    const result = renderDiagramTUI(flowData)
    expect(result).toContain("Total: 2 nodes, 1 edges")
  })
})

describe("renderMermaidTUI", () => {
  it("renders flowchart", () => {
    const mermaid = "graph TD\n  A[Frontend] --> B[API]\n  B --> C[(DB)]"
    const result = renderMermaidTUI(mermaid)
    expect(result).toContain("[graph TD]")
    expect(result).toContain("A[Frontend] → B[API]")
    expect(result).toContain("B → C[(DB)]")
  })

  it("renders sequence diagram", () => {
    const mermaid = "sequenceDiagram\n  participant Client\n  Client->>Server: GET /api"
    const result = renderMermaidTUI(mermaid)
    expect(result).toContain("participant Client")
    expect(result).toContain("Client →> Server: GET /api")
  })

  it("renders subgraphs", () => {
    const mermaid = "graph TD\n  subgraph Frontend\n    A\n  end"
    const result = renderMermaidTUI(mermaid)
    expect(result).toContain("[subgraph Frontend]")
    expect(result).toContain("[/subgraph]")
  })

  it("handles empty mermaid", () => {
    const result = renderMermaidTUI("")
    expect(result).toContain("Mermaid Diagram (text representation):")
  })
})

describe("renderNodeDescription", () => {
  it("renders node info", () => {
    const node: FlowNode = {
      id: "A",
      x: 100,
      y: 200,
      width: 150,
      height: 60,
      label: "Frontend",
      type: "block",
    }
    const result = renderNodeDescription(node)
    expect(result).toContain("Type: block")
    expect(result).toContain("Label: Frontend")
    expect(result).toContain("ID: A")
    expect(result).toContain("Position: (100, 200)")
  })
})

describe("renderEdgeDescription", () => {
  it("renders edge info", () => {
    const edge: FlowEdge = {
      id: "e1",
      source: "A",
      target: "B",
      label: "HTTP",
      type: "solid",
    }
    const result = renderEdgeDescription(edge)
    expect(result).toContain("A → B")
    expect(result).toContain("Label: HTTP")
    expect(result).toContain("Type: solid")
  })

  it("renders edge without label", () => {
    const edge: FlowEdge = {
      id: "e1",
      source: "A",
      target: "B",
      type: "solid",
    }
    const result = renderEdgeDescription(edge)
    expect(result).toContain("A → B")
    expect(result).not.toContain("Label:")
  })
})
