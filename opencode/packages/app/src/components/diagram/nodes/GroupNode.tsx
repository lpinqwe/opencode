import type { FlowNode } from "../../../lib/diagram/types"

interface GroupNodeProps {
  node: FlowNode
  on_click?: () => void
  on_double_click?: () => void
  on_mouse_down?: (e: MouseEvent) => void
}

export function GroupNode(props: GroupNodeProps) {
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
        rx="8"
        ry="8"
        fill="#f3f4f6"
        stroke="#9ca3af"
        stroke-width="2"
        stroke-dasharray="5,5"
        class="hover:fill-gray-100 hover:stroke-gray-500 transition-colors"
      />
      <text
        x={10}
        y={20}
        class="text-xs fill-gray-600 pointer-events-none font-medium"
      >
        {props.node.label}
      </text>
    </g>
  )
}
