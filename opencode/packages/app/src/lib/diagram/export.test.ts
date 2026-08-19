import { describe, it, expect } from "bun:test"
import { exportDiagram, copyMermaidToClipboard } from "./export"
import type { FlowData } from "./types"

describe("Export", () => {
  const flowData: FlowData = {
    nodes: [
      { id: "a", type: "process", label: "Start", x: 0, y: 0 },
      { id: "b", type: "decision", label: "Decision?", x: 200, y: 100 },
      { id: "c", type: "process", label: "End", x: 400, y: 0 },
    ],
    edges: [
      { id: "e1", source: "a", target: "b", label: "yes" },
      { id: "e2", source: "b", target: "c", label: "no" },
    ],
  }

  describe("SVG Export", () => {
    it("should generate valid SVG", async () => {
      const result = await exportDiagram(flowData, { format: "svg" })
      expect(result).toContain("<svg")
      expect(result).toContain("</svg>")
      expect(result).toContain("xmlns")
    })

    it("should include all nodes", async () => {
      const result = await exportDiagram(flowData, { format: "svg" })
      expect(result).toContain("Start")
      expect(result).toContain("Decision?")
      expect(result).toContain("End")
    })

    it("should include edge labels", async () => {
      const result = await exportDiagram(flowData, { format: "svg" })
      expect(result).toContain("yes")
      expect(result).toContain("no")
    })

    it("should handle empty diagram", async () => {
      const empty: FlowData = { nodes: [], edges: [] }
      const result = await exportDiagram(empty, { format: "svg" })
      expect(result).toContain("<svg")
    })

    it("should include background color", async () => {
      const result = await exportDiagram(flowData, {
        format: "svg",
        background: "#f0f0f0",
      })
      expect(result).toContain("#f0f0f0")
    })
  })

  describe("Mermaid Export", () => {
    it("should generate mermaid code", async () => {
      const result = await exportDiagram(flowData, { format: "mermaid" })
      expect(result).toContain("graph")
    })
  })

  describe("SVG Download", () => {
    it("should create downloadable SVG string", async () => {
      const result = await exportDiagram(flowData, { format: "svg" })
      expect(typeof result).toBe("string")
      expect(result).toMatch(/^<svg/)
    })
  })

  describe("PNG Export", () => {
    it("should return base64 data", async () => {
      const result = await exportDiagram(flowData, {
        format: "png",
        scale: 1,
      })
      expect(typeof result).toBe("string")
    })
  })
})

describe("Clipboard Export", () => {
  const flowData: FlowData = {
    nodes: [{ id: "a", type: "process", label: "Test" }],
    edges: [],
  }

  it("should copy mermaid to clipboard", async () => {
    await copyMermaidToClipboard(flowData)
  })
})
