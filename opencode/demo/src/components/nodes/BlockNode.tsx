import type { FlowNode } from "../../lib/types"

interface BlockNodeProps {
  node: FlowNode
  on_click?: () => void
  on_double_click?: () => void
  on_mouse_down?: (e: MouseEvent) => void
}

export function BlockNode(props: BlockNodeProps) {
  return (
    <g
      transform={`translate(${props.node.x}, ${props.node.y})`}
      class="cursor-pointer"
      onClick={props.on_click}
      onDblClick={props.on_double_click}
      onMouseDown={props.on_mouse_down}
    >
      <rect
        width={props.node.width}
        height={props.node.height}
        rx="4"
        ry="4"
        fill="#e2e8f0"
        stroke="#94a3b8"
        stroke-width="2"
        class="hover:fill-blue-100 hover:stroke-blue-500 transition-colors"
      />
      <text
        x={props.node.width / 2}
        y={props.node.height / 2}
        text-anchor="middle"
        dominant-baseline="middle"
        class="text-sm fill-gray-800 pointer-events-none"
      >
        {props.node.label}
      </text>
    </g>
  )
}
