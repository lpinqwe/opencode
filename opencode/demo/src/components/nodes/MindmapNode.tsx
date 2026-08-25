import type { FlowNode } from "../../lib/types"

interface MindmapNodeProps {
  node: FlowNode
  on_click?: () => void
  on_double_click?: () => void
  on_mouse_down?: (e: MouseEvent) => void
}

export function MindmapNode(props: MindmapNodeProps) {
  const padding = 16
  const textWidth = props.node.label.length * 8 + padding * 2
  const width = Math.max(props.node.width, textWidth)
  const height = props.node.height

  return (
    <g
      transform={`translate(${props.node.x}, ${props.node.y})`}
      class="cursor-pointer"
      onClick={props.on_click}
      onDblClick={props.on_double_click}
      onMouseDown={props.on_mouse_down}
    >
      <rect
        width={width}
        height={height}
        rx={height / 2}
        ry={height / 2}
        fill="#ede9fe"
        stroke="#8b5cf6"
        stroke-width="2"
        class="hover:fill-violet-100 hover:stroke-violet-500 transition-colors"
      />
      <text
        x={width / 2}
        y={height / 2}
        text-anchor="middle"
        dominant-baseline="middle"
        class="text-sm fill-gray-800 pointer-events-none"
      >
        {props.node.label}
      </text>
    </g>
  )
}
