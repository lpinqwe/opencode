import { describe, it, expect } from "bun:test"
import { mermaidToFlow, flowToMermaid } from "./mermaid-to-flow"
import { parseMermaid } from "./mermaid-parser"

describe("mermaidToFlow", () => {
  it("converts flowchart to flow data", () => {
    const parsed = parseMermaid("graph TD\n  A[Frontend] --> B[API]\n  B --> C[(DB)]")
    const flow = mermaidToFlow(parsed)

    expect(flow.nodes.length).toBe(3)
    expect(flow.edges.length).toBe(2)
    expect(flow.nodes[0].label).toBe("Frontend")
    expect(flow.edges[0].source).toBe("A")
    expect(flow.edges[0].target).toBe("B")
  })

  it("converts sequence diagram to flow data", () => {
    const parsed = parseMermaid(`sequenceDiagram
      participant Client
      participant Server
      Client->>Server: GET /api`)
    const flow = mermaidToFlow(parsed)

    expect(flow.nodes.length).toBe(2)
    expect(flow.edges.length).toBe(1)
    expect(flow.edges[0].label).toBe("GET /api")
  })

  it("handles empty diagram", () => {
    const parsed = parseMermaid("graph TD")
    const flow = mermaidToFlow(parsed)

    expect(flow.nodes.length).toBe(0)
    expect(flow.edges.length).toBe(0)
  })
})

describe("flowToMermaid", () => {
  it("converts flow data to flowchart", () => {
    const flow = {
      nodes: [
        { id: "A", x: 0, y: 0, width: 150, height: 60, label: "Frontend", type: "block" },
        { id: "B", x: 200, y: 0, width: 150, height: 60, label: "API", type: "block" },
      ],
      edges: [
        { id: "e1", source: "A", target: "B", type: "solid" },
      ],
    }

    const mermaid = flowToMermaid(flow, "graph")
    expect(mermaid).toContain("graph TD")
    expect(mermaid).toContain("A[Frontend]")
    expect(mermaid).toContain("B[API]")
    expect(mermaid).toContain("A --> B")
  })

  it("converts flow data to sequence diagram", () => {
    const flow = {
      nodes: [
        { id: "Client", x: 0, y: 0, width: 150, height: 60, label: "Client", type: "actor" },
        { id: "Server", x: 200, y: 0, width: 150, height: 60, label: "Server", type: "actor" },
      ],
      edges: [
        { id: "e1", source: "Client", target: "Server", label: "GET /api", type: "solid" },
      ],
    }

    const mermaid = flowToMermaid(flow, "sequence")
    expect(mermaid).toContain("sequenceDiagram")
    expect(mermaid).toContain("participant Client as Client")
    expect(mermaid).toContain("Client->>Server: GET /api")
  })

  it("handles empty flow data", () => {
    const flow = { nodes: [], edges: [] }
    const mermaid = flowToMermaid(flow, "graph")
    expect(mermaid).toContain("graph TD")
  })
})

describe("roundtrip conversion", () => {
  it("converts flowchart to flow and back", () => {
    const original = "graph TD\n  A[Frontend] --> B[API]\n  B --> C[(DB)]"
    const parsed = parseMermaid(original)
    const flow = mermaidToFlow(parsed)
    const result = flowToMermaid(flow, "graph")

    expect(result).toContain("A[Frontend]")
    expect(result).toContain("B[API]")
    expect(result).toContain("C((DB))")
    expect(result).toContain("A --> B")
    expect(result).toContain("B --> C")
  })

  it("converts sequence diagram to flow and back", () => {
    const original = `sequenceDiagram
      participant Client
      participant Server
      Client->>Server: GET /api
      Server->>Client: 200 OK`
    const parsed = parseMermaid(original)
    const flow = mermaidToFlow(parsed)
    const result = flowToMermaid(flow, "sequence")

    expect(result).toContain("sequenceDiagram")
    expect(result).toContain("participant Client as Client")
    expect(result).toContain("Client->>Server: GET /api")
    expect(result).toContain("Server->>Client: 200 OK")
  })
})
