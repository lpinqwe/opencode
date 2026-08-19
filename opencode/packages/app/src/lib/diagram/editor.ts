import type { FlowNode, FlowEdge, FlowData } from "./types"

export interface HistoryState {
  nodes: FlowNode[]
  edges: FlowEdge[]
  timestamp: number
}

export interface SelectionState {
  selectedNodes: Set<string>
  selectedEdges: Set<string>
}

export interface ClipboardState {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export class DiagramEditor {
  private history: HistoryState[] = []
  private historyIndex: number = -1
  private selection: SelectionState = { selectedNodes: new Set(), selectedEdges: new Set() }
  private clipboard: ClipboardState = { nodes: [], edges: [] }
  private maxHistorySize: number = 50

  constructor(private flowData: FlowData) {
    this.saveState()
  }

  getFlowData(): FlowData {
    return this.flowData
  }

  getSelection(): SelectionState {
    return this.selection
  }

  canUndo(): boolean {
    return this.historyIndex > 0
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  saveState(): void {
    const state: HistoryState = {
      nodes: [...this.flowData.nodes],
      edges: [...this.flowData.edges],
      timestamp: Date.now(),
    }

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }

    this.history.push(state)
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }
    this.historyIndex = this.history.length - 1
  }

  undo(): FlowData {
    if (!this.canUndo()) return this.flowData

    this.historyIndex--
    const state = this.history[this.historyIndex]
    this.flowData = { nodes: [...state.nodes], edges: [...state.edges] }
    this.clearSelection()
    return this.flowData
  }

  redo(): FlowData {
    if (!this.canRedo()) return this.flowData

    this.historyIndex++
    const state = this.history[this.historyIndex]
    this.flowData = { nodes: [...state.nodes], edges: [...state.edges] }
    this.clearSelection()
    return this.flowData
  }

  selectNode(nodeId: string, multi: boolean = false): void {
    if (!multi) {
      this.selection.selectedNodes.clear()
      this.selection.selectedEdges.clear()
    }
    this.selection.selectedNodes.add(nodeId)
  }

  deselectNode(nodeId: string): void {
    this.selection.selectedNodes.delete(nodeId)
  }

  selectEdge(edgeId: string, multi: boolean = false): void {
    if (!multi) {
      this.selection.selectedNodes.clear()
      this.selection.selectedEdges.clear()
    }
    this.selection.selectedEdges.add(edgeId)
  }

  deselectEdge(edgeId: string): void {
    this.selection.selectedEdges.delete(edgeId)
  }

  clearSelection(): void {
    this.selection.selectedNodes.clear()
    this.selection.selectedEdges.clear()
  }

  selectAll(): void {
    this.flowData.nodes.forEach((node) => this.selection.selectedNodes.add(node.id))
    this.flowData.edges.forEach((edge) => this.selection.selectedEdges.add(edge.id))
  }

  copy(): void {
    const selectedNodes = this.flowData.nodes.filter((node) =>
      this.selection.selectedNodes.has(node.id)
    )
    const selectedEdges = this.flowData.edges.filter((edge) =>
      this.selection.selectedEdges.has(edge.id)
    )

    this.clipboard = {
      nodes: selectedNodes.map((node) => ({ ...node })),
      edges: selectedEdges.map((edge) => ({ ...edge })),
    }
  }

  paste(): FlowData {
    if (this.clipboard.nodes.length === 0) return this.flowData

    const idMap = new Map<string, string>()
    const newNodes: FlowNode[] = []

    for (const node of this.clipboard.nodes) {
      const newId = `${node.id}-copy-${Date.now()}`
      idMap.set(node.id, newId)
      newNodes.push({
        ...node,
        id: newId,
        x: (node.x ?? 0) + 50,
        y: (node.y ?? 0) + 50,
      })
    }

    const newEdges: FlowEdge[] = []
    for (const edge of this.clipboard.edges) {
      const source = idMap.get(edge.source)
      const target = idMap.get(edge.target)
      if (source && target) {
        newEdges.push({
          ...edge,
          id: `${edge.id}-copy-${Date.now()}`,
          source,
          target,
        })
      }
    }

    this.flowData = {
      nodes: [...this.flowData.nodes, ...newNodes],
      edges: [...this.flowData.edges, ...newEdges],
    }

    this.clearSelection()
    newNodes.forEach((node) => this.selection.selectedNodes.add(node.id))
    newEdges.forEach((edge) => this.selection.selectedEdges.add(edge.id))

    this.saveState()
    return this.flowData
  }

  deleteSelected(): FlowData {
    const selectedNodeIds = new Set(this.selection.selectedNodes)
    const selectedEdgeIds = new Set(this.selection.selectedEdges)

    this.flowData = {
      nodes: this.flowData.nodes.filter((node) => !selectedNodeIds.has(node.id)),
      edges: this.flowData.edges.filter(
        (edge) =>
          !selectedEdgeIds.has(edge.id) &&
          !selectedNodeIds.has(edge.source) &&
          !selectedNodeIds.has(edge.target)
      ),
    }

    this.clearSelection()
    this.saveState()
    return this.flowData
  }

  moveNode(nodeId: string, x: number, y: number): FlowData {
    this.flowData = {
      ...this.flowData,
      nodes: this.flowData.nodes.map((node) =>
        node.id === nodeId ? { ...node, x, y } : node
      ),
    }
    this.saveState()
    return this.flowData
  }

  addNode(node: FlowNode): FlowData {
    this.flowData = {
      ...this.flowData,
      nodes: [...this.flowData.nodes, node],
    }
    this.saveState()
    return this.flowData
  }

  removeNode(nodeId: string): FlowData {
    this.flowData = {
      nodes: this.flowData.nodes.filter((node) => node.id !== nodeId),
      edges: this.flowData.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    }
    this.saveState()
    return this.flowData
  }

  updateNodeLabel(nodeId: string, label: string): FlowData {
    this.flowData = {
      ...this.flowData,
      nodes: this.flowData.nodes.map((node) =>
        node.id === nodeId ? { ...node, label } : node
      ),
    }
    this.saveState()
    return this.flowData
  }

  addEdge(edge: FlowEdge): FlowData {
    const exists = this.flowData.edges.some(
      (e) => e.source === edge.source && e.target === edge.target
    )
    if (exists) return this.flowData

    this.flowData = {
      ...this.flowData,
      edges: [...this.flowData.edges, edge],
    }
    this.saveState()
    return this.flowData
  }

  removeEdge(edgeId: string): FlowData {
    this.flowData = {
      ...this.flowData,
      edges: this.flowData.edges.filter((edge) => edge.id !== edgeId),
    }
    this.saveState()
    return this.flowData
  }

  updateEdgeLabel(edgeId: string, label: string): FlowData {
    this.flowData = {
      ...this.flowData,
      edges: this.flowData.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, label } : edge
      ),
    }
    this.saveState()
    return this.flowData
  }

  alignSelected(direction: "left" | "right" | "top" | "bottom" | "center" | "middle"): FlowData {
    const selectedNodes = this.flowData.nodes.filter((node) =>
      this.selection.selectedNodes.has(node.id)
    )
    if (selectedNodes.length < 2) return this.flowData

    const minX = Math.min(...selectedNodes.map((n) => n.x ?? 0))
    const maxX = Math.max(...selectedNodes.map((n) => (n.x ?? 0) + (n.width ?? 150)))
    const minY = Math.min(...selectedNodes.map((n) => n.y ?? 0))
    const maxY = Math.max(...selectedNodes.map((n) => (n.y ?? 0) + (n.height ?? 60)))

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    this.flowData = {
      ...this.flowData,
      nodes: this.flowData.nodes.map((node) => {
        if (!this.selection.selectedNodes.has(node.id)) return node

        const width = node.width ?? 150
        const height = node.height ?? 60

        switch (direction) {
          case "left":
            return { ...node, x: minX }
          case "right":
            return { ...node, x: maxX - width }
          case "top":
            return { ...node, y: minY }
          case "bottom":
            return { ...node, y: maxY - height }
          case "center":
            return { ...node, x: centerX - width / 2 }
          case "middle":
            return { ...node, y: centerY - height / 2 }
          default:
            return node
        }
      }),
    }

    this.saveState()
    return this.flowData
  }

  distributeSelected(direction: "horizontal" | "vertical"): FlowData {
    const selectedNodes = this.flowData.nodes
      .filter((node) => this.selection.selectedNodes.has(node.id))
      .sort((a, b) => {
        if (direction === "horizontal") {
          return (a.x ?? 0) - (b.x ?? 0)
        }
        return (a.y ?? 0) - (b.y ?? 0)
      })

    if (selectedNodes.length < 3) return this.flowData

    const first = selectedNodes[0]
    const last = selectedNodes[selectedNodes.length - 1]

    if (direction === "horizontal") {
      const startX = first.x ?? 0
      const endX = last.x ?? 0
      const spacing = (endX - startX) / (selectedNodes.length - 1)

      this.flowData = {
        ...this.flowData,
        nodes: this.flowData.nodes.map((node) => {
          if (!this.selection.selectedNodes.has(node.id)) return node
          const index = selectedNodes.indexOf(node)
          return { ...node, x: startX + index * spacing }
        }),
      }
    } else {
      const startY = first.y ?? 0
      const endY = last.y ?? 0
      const spacing = (endY - startY) / (selectedNodes.length - 1)

      this.flowData = {
        ...this.flowData,
        nodes: this.flowData.nodes.map((node) => {
          if (!this.selection.selectedNodes.has(node.id)) return node
          const index = selectedNodes.indexOf(node)
          return { ...node, y: startY + index * spacing }
        }),
      }
    }

    this.saveState()
    return this.flowData
  }

  snapToGrid(gridSize: number = 20): FlowData {
    this.flowData = {
      ...this.flowData,
      nodes: this.flowData.nodes.map((node) => {
        if (!this.selection.selectedNodes.has(node.id)) return node
        return {
          ...node,
          x: Math.round((node.x ?? 0) / gridSize) * gridSize,
          y: Math.round((node.y ?? 0) / gridSize) * gridSize,
        }
      }),
    }

    this.saveState()
    return this.flowData
  }
}
