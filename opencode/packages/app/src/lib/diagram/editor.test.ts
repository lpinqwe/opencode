import { describe, it, expect, beforeEach } from "bun:test"
import { DiagramEditor } from "./editor"
import type { FlowData } from "./types"

describe("DiagramEditor", () => {
  let editor: DiagramEditor
  let flowData: FlowData

  beforeEach(() => {
    flowData = {
      nodes: [
        { id: "a", type: "process", label: "A" },
        { id: "b", type: "process", label: "B" },
        { id: "c", type: "decision", label: "C" },
      ],
      edges: [
        { id: "e1", source: "a", target: "b", label: "yes" },
        { id: "e2", source: "b", target: "c", label: "" },
      ],
    }
    editor = new DiagramEditor(flowData)
  })

  describe("History", () => {
    it("should track state changes", () => {
      expect(editor.canUndo()).toBe(true)
      expect(editor.canRedo()).toBe(false)
    })

    it("should undo to previous state", () => {
      editor.removeNode("a")
      expect(editor.getFlowData().nodes.length).toBe(2)

      editor.undo()
      expect(editor.getFlowData().nodes.length).toBe(3)
    })

    it("should redo after undo", () => {
      editor.removeNode("a")
      editor.undo()

      editor.redo()
      expect(editor.getFlowData().nodes.length).toBe(2)
    })

    it("should limit history size", () => {
      const smallEditor = new DiagramEditor(flowData)
      for (let i = 0; i < 60; i++) {
        smallEditor.addNode({ id: `n${i}`, type: "process", label: `N${i}` })
      }
      expect(smallEditor.canUndo()).toBe(true)
    })
  })

  describe("Selection", () => {
    it("should select a node", () => {
      editor.selectNode("a")
      expect(editor.getSelection().selectedNodes.has("a")).toBe(true)
    })

    it("should deselect a node", () => {
      editor.selectNode("a")
      editor.deselectNode("a")
      expect(editor.getSelection().selectedNodes.has("a")).toBe(false)
    })

    it("should clear selection", () => {
      editor.selectNode("a")
      editor.selectNode("b")
      editor.clearSelection()
      expect(editor.getSelection().selectedNodes.size).toBe(0)
    })

    it("should select all nodes and edges", () => {
      editor.selectAll()
      expect(editor.getSelection().selectedNodes.size).toBe(3)
      expect(editor.getSelection().selectedEdges.size).toBe(2)
    })

    it("should select an edge", () => {
      editor.selectEdge("e1")
      expect(editor.getSelection().selectedEdges.has("e1")).toBe(true)
    })

    it("should support multi-select", () => {
      editor.selectNode("a")
      editor.selectNode("b", true)
      expect(editor.getSelection().selectedNodes.size).toBe(2)
    })
  })

  describe("Copy/Paste", () => {
    it("should copy selected nodes", () => {
      editor.selectNode("a")
      editor.copy()
      editor.paste()
      const data = editor.getFlowData()
      expect(data.nodes.length).toBe(4)
    })

    it("should paste with offset", () => {
      editor.selectNode("a")
      editor.copy()
      editor.paste()
      const data = editor.getFlowData()
      const newNode = data.nodes[3]
      const originalNode = data.nodes[0]
      expect(newNode.x).toBe((originalNode.x ?? 0) + 50)
    })

    it("should paste with correct edges", () => {
      editor.selectNode("a")
      editor.selectNode("b", true)
      editor.copy()
      editor.paste()
      const data = editor.getFlowData()
      expect(data.edges.length).toBe(3)
    })
  })

  describe("Node operations", () => {
    it("should add a node", () => {
      editor.addNode({ id: "d", type: "process", label: "D" })
      expect(editor.getFlowData().nodes.length).toBe(4)
    })

    it("should remove a node", () => {
      editor.removeNode("a")
      const data = editor.getFlowData()
      expect(data.nodes.length).toBe(2)
      expect(data.edges.length).toBe(1)
    })

    it("should update node label", () => {
      editor.updateNodeLabel("a", "New Label")
      const node = editor.getFlowData().nodes.find((n) => n.id === "a")
      expect(node?.label).toBe("New Label")
    })

    it("should move a node", () => {
      editor.moveNode("a", 100, 200)
      const node = editor.getFlowData().nodes.find((n) => n.id === "a")
      expect(node?.x).toBe(100)
      expect(node?.y).toBe(200)
    })
  })

  describe("Edge operations", () => {
    it("should add an edge", () => {
      editor.addEdge({ id: "e3", source: "a", target: "c", label: "" })
      expect(editor.getFlowData().edges.length).toBe(3)
    })

    it("should not add duplicate edges", () => {
      editor.addEdge({ id: "e3", source: "a", target: "b", label: "" })
      expect(editor.getFlowData().edges.length).toBe(2)
    })

    it("should remove an edge", () => {
      editor.removeEdge("e1")
      expect(editor.getFlowData().edges.length).toBe(1)
    })

    it("should update edge label", () => {
      editor.updateEdgeLabel("e1", "no")
      const edge = editor.getFlowData().edges.find((e) => e.id === "e1")
      expect(edge?.label).toBe("no")
    })
  })

  describe("Alignment", () => {
    it("should align nodes to left", () => {
      editor.moveNode("a", 0, 0)
      editor.moveNode("b", 100, 100)
      editor.moveNode("c", 200, 200)

      editor.selectNode("a")
      editor.selectNode("b", true)
      editor.selectNode("c", true)

      editor.alignSelected("left")
      const data = editor.getFlowData()
      const nodeA = data.nodes.find((n) => n.id === "a")
      const nodeB = data.nodes.find((n) => n.id === "b")
      const nodeC = data.nodes.find((n) => n.id === "c")

      expect(nodeA?.x).toBe(0)
      expect(nodeB?.x).toBe(0)
      expect(nodeC?.x).toBe(0)
    })

    it("should align nodes to top", () => {
      editor.moveNode("a", 0, 0)
      editor.moveNode("b", 100, 100)
      editor.moveNode("c", 200, 200)

      editor.selectNode("a")
      editor.selectNode("b", true)
      editor.selectNode("c", true)

      editor.alignSelected("top")
      const data = editor.getFlowData()
      const nodeA = data.nodes.find((n) => n.id === "a")
      const nodeB = data.nodes.find((n) => n.id === "b")
      const nodeC = data.nodes.find((n) => n.id === "c")

      expect(nodeA?.y).toBe(0)
      expect(nodeB?.y).toBe(0)
      expect(nodeC?.y).toBe(0)
    })
  })

  describe("Grid snapping", () => {
    it("should snap nodes to grid", () => {
      editor.moveNode("a", 13, 27)
      editor.selectNode("a")
      editor.snapToGrid(20)
      const node = editor.getFlowData().nodes.find((n) => n.id === "a")
      expect(node?.x).toBe(20)
      expect(node?.y).toBe(20)
    })
  })

  describe("Delete selected", () => {
    it("should delete selected nodes and connected edges", () => {
      editor.selectNode("a")
      editor.deleteSelected()
      const data = editor.getFlowData()
      expect(data.nodes.length).toBe(2)
      expect(data.edges.length).toBe(0)
    })

    it("should delete selected edges only", () => {
      editor.selectEdge("e1")
      editor.deleteSelected()
      expect(editor.getFlowData().edges.length).toBe(1)
    })
  })
})
