import type { FlowNode } from "../../../lib/diagram/types"

interface DecisionNodeProps {
  node: FlowNode
  on_click?: () => void
  on_double_click?: () => void
  on_mouse_down?: (e: MouseEvent) => void
}

export function DecisionNode(props: DecisionNodeProps) {
  const size = props.node.width
  const halfSize = size / 2

  return (
    <g
      transform={`translate(${props.node.x}, ${props.node.y})`}
      class="cursor-pointer"
      onClick={props.on_click}
      onDblClick={props.on_double_click}
      onMouseDown={props.on_mouse_down}
    >
      <polygon
        points={`${halfSize},0 ${size},${halfSize} ${halfSize},${size} 0,${halfSize}`}
        fill="#fef3c7"
        stroke="#f59e0b"
        stroke-width="2"
        class="hover:fill-yellow-100 hover:stroke-yellow-500 transition-colors"
      />
      <text
        x={halfSize}
        y={halfSize}
        text-anchor="middle"
        dominant-baseline="middle"
        class="text-sm fill-gray-800 pointer-events-none"
      >
        {props.node.label}
      </text>
    </g>
  )
}
