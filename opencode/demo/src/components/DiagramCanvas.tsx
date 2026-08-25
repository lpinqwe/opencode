import { createSignal, createMemo, For, Show, onCleanup } from "solid-js"
import type { FlowNode, FlowEdge, FlowData } from "../lib/types"
import { BlockNode } from "./nodes/BlockNode"
import { DecisionNode } from "./nodes/DecisionNode"
import { DatabaseNode } from "./nodes/DatabaseNode"
import { ActorNode } from "./nodes/ActorNode"
import { GroupNode } from "./nodes/GroupNode"
import { MindmapNode } from "./nodes/MindmapNode"
import { CustomEdge } from "./edges/CustomEdge"

interface DiagramCanvasProps {
  flowData: FlowData
  onNodeClick?: (node: FlowNode) => void
  onNodeDoubleClick?: (node: FlowNode) => void
  onNodeDrag?: (node: FlowNode, x: number, y: number) => void
  readonly?: boolean
}

export function DiagramCanvas(props: DiagramCanvasProps) {
  const [zoom, setZoom] = createSignal(1)
  const [panX, setPanX] = createSignal(0)
  const [panY, setPanY] = createSignal(0)
  const [isPanning, setIsPanning] = createSignal(false)
  const [startX, setStartX] = createSignal(0)
  const [startY, setStartY] = createSignal(0)
  const [draggingNode, setDraggingNode] = createSignal<string | null>(null)

  const viewBox = createMemo(() => {
    const width = 800
    const height = 600
    const x = -panX() / zoom()
    const y = -panY() / zoom()
    const w = width / zoom()
    const h = height / zoom()
    return `${x} ${y} ${w} ${h}`
  })

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(zoom() * delta, 0.1), 5)
    setZoom(newZoom)
  }

  const handleMouseDown = (e: MouseEvent) => {
    if (e.target instanceof SVGElement && e.target.closest("svg") === e.currentTarget) {
      setIsPanning(true)
      setStartX(e.clientX - panX())
      setStartY(e.clientY - panY())
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning()) {
      setPanX(e.clientX - startX())
      setPanY(e.clientY - startY())
    }
    if (draggingNode()) {
      const svg = e.currentTarget as SVGSVGElement
      const rect = svg.getBoundingClientRect()
      const x = (e.clientX - rect.left - panX()) / zoom()
      const y = (e.clientY - rect.top - panY()) / zoom()
      props.onNodeDrag?.(props.flowData.nodes.find((n) => n.id === draggingNode())!, x, y)
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setDraggingNode(null)
  }

  const handleNodeMouseDown = (node: FlowNode, e: MouseEvent) => {
    e.stopPropagation()
    setDraggingNode(node.id)
  }

  const handleZoomIn = () => setZoom(Math.min(zoom() * 1.2, 5))
  const handleZoomOut = () => setZoom(Math.max(zoom() * 0.8, 0.1))
  const handleFitToView = () => {
    setZoom(1)
    setPanX(0)
    setPanY(0)
  }

  const renderNode = (node: FlowNode) => {
    const nodeProps = {
      node,
      on_click: () => props.onNodeClick?.(node),
      on_double_click: () => props.onNodeDoubleClick?.(node),
      on_mouse_down: (e: MouseEvent) => handleNodeMouseDown(node, e),
    }

    switch (node.type) {
      case "decision":
        return <DecisionNode {...nodeProps} />
      case "database":
        return <DatabaseNode {...nodeProps} />
      case "actor":
        return <ActorNode {...nodeProps} />
      case "group":
        return <GroupNode {...nodeProps} />
      case "mindmap":
        return <MindmapNode {...nodeProps} />
      default:
        return <BlockNode {...nodeProps} />
    }
  }

  return (
    <div class="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <svg
        class="w-full h-full"
        viewBox={viewBox()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>

        <g transform={`translate(${panX()}, ${panY()}) scale(${zoom()})`}>
          <For each={props.flowData.edges}>
            {(edge) => {
              const source = props.flowData.nodes.find((n) => n.id === edge.source)
              const target = props.flowData.nodes.find((n) => n.id === edge.target)
              if (!source || !target) return null
              return (
                <CustomEdge
                  edge={edge}
                  source={source}
                  target={target}
                />
              )
            }}
          </For>

          <For each={props.flowData.nodes}>
            {(node) => renderNode(node)}
          </For>
        </g>
      </svg>

      <div class="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          class="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
          onClick={handleZoomIn}
        >
          +
        </button>
        <button
          class="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
          onClick={handleZoomOut}
        >
          -
        </button>
        <button
          class="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-xs"
          onClick={handleFitToView}
        >
          Fit
        </button>
      </div>
    </div>
  )
}
