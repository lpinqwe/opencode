import { createSignal, createEffect, For, Show } from "solid-js"
import type { FlowData, FlowNode } from "../../lib/diagram/types"
import { parseMermaid, mermaidToFlow, flowToMermaid } from "../../lib/diagram"
import { DiagramCanvas } from "./DiagramCanvas"
import { MermaidEditor } from "./MermaidEditor"
import { DiagramToolbar } from "./DiagramToolbar"
import { DiagramSidebar } from "./DiagramSidebar"

interface DiagramPanelProps {
  initialMermaid?: string
  diagrams?: Array<{ name: string; type: string }>
  onDiagramSelect?: (name: string) => void
  onDiagramSave?: (name: string, mermaid: string) => void
  onDiagramDelete?: (name: string) => void
}

export function DiagramPanel(props: DiagramPanelProps) {
  const [mermaid, setMermaid] = createSignal(props.initialMermaid || "")
  const [flowData, setFlowData] = createSignal<FlowData>({ nodes: [], edges: [] })
  const [selectedNode, setSelectedNode] = createSignal<FlowNode | null>(null)
  const [showSidebar, setShowSidebar] = createSignal(true)
  const [currentDiagram, setCurrentDiagram] = createSignal<string | null>(null)

  createEffect(() => {
    const code = mermaid()
    if (code) {
      const parsed = parseMermaid(code)
      const flow = mermaidToFlow(parsed)
      setFlowData(flow)
    }
  })

  const handleMermaidChange = (value: string) => {
    setMermaid(value)
  }

  const handleNodeClick = (node: FlowNode) => {
    setSelectedNode(node)
  }

  const handleNodeDoubleClick = (node: FlowNode) => {
    setSelectedNode(node)
  }

  const handleNodeDrag = (node: FlowNode, x: number, y: number) => {
    setFlowData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === node.id ? { ...n, x, y } : n)),
    }))
  }

  const handleSave = () => {
    const name = currentDiagram()
    if (name) {
      props.onDiagramSave?.(name, mermaid())
    }
  }

  const handleDiagramSelect = (name: string) => {
    setCurrentDiagram(name)
    props.onDiagramSelect?.(name)
  }

  const handleDiagramDelete = (name: string) => {
    props.onDiagramDelete?.(name)
    if (currentDiagram() === name) {
      setCurrentDiagram(null)
      setMermaid("")
    }
  }

  const handleAutoLayout = () => {
    const data = flowData()
    const nodeCount = data.nodes.length
    if (nodeCount === 0) return

    const cols = Math.ceil(Math.sqrt(nodeCount))
    const spacing = 200

    const newNodes = data.nodes.map((node, index) => ({
      ...node,
      x: (index % cols) * spacing + 50,
      y: Math.floor(index / cols) * 150 + 50,
    }))

    setFlowData({ ...data, nodes: newNodes })
    setMermaid(flowToMermaid({ ...data, nodes: newNodes }))
  }

  const handleExportSVG = () => {
    const svg = document.querySelector(".diagram-canvas svg")
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([svgData], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${currentDiagram() || "diagram"}.svg`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div class="flex h-full">
      <Show when={showSidebar()}>
        <DiagramSidebar
          diagrams={props.diagrams || []}
          currentDiagram={currentDiagram()}
          onSelect={handleDiagramSelect}
          onDelete={handleDiagramDelete}
          onToggle={() => setShowSidebar(false)}
        />
      </Show>

      <div class="flex-1 flex flex-col">
        <DiagramToolbar
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onFitToView={handleAutoLayout}
          onAutoLayout={handleAutoLayout}
          onExportSVG={handleExportSVG}
          onSave={handleSave}
          onToggleSidebar={() => setShowSidebar(!showSidebar())}
          hasSidebar={showSidebar()}
        />

        <div class="flex-1 flex">
          <div class="flex-1 border-r border-gray-200 dark:border-gray-700">
            <DiagramCanvas
              flowData={flowData()}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onNodeDrag={handleNodeDrag}
            />
          </div>

          <div class="w-1/2">
            <MermaidEditor
              value={mermaid()}
              onChange={handleMermaidChange}
            />
          </div>
        </div>

        <Show when={selectedNode()}>
          <div class="border-t border-gray-200 dark:border-gray-700 p-4">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Node</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedNode()?.label} ({selectedNode()?.type})
            </p>
          </div>
        </Show>
      </div>
    </div>
  )
}
