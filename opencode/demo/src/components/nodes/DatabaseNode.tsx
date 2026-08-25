import type { FlowNode } from "../../lib/types"

interface DatabaseNodeProps {
  node: FlowNode
  on_click?: () => void
  on_double_click?: () => void
  on_mouse_down?: (e: MouseEvent) => void
}

export function DatabaseNode(props: DatabaseNodeProps) {
  const width = props.node.width
  const height = props.node.height
  const ry = height / 4

  return (
    <g
      transform={`translate(${props.node.x}, ${props.node.y})`}
      class="cursor-pointer"
      onClick={props.on_click}
      onDblClick={props.on_double_click}
      onMouseDown={props.on_mouse_down}
    >
      <path
        d={`M 0 ${ry}
            A ${width / 2} ${ry} 0 0 1 ${width} ${ry}
            L ${width} ${height - ry}
            A ${width / 2} ${ry} 0 0 1 0 ${height - ry}
            Z`}
        fill="#d1fae5"
        stroke="#10b981"
        stroke-width="2"
        class="hover:fill-green-100 hover:stroke-green-500 transition-colors"
      />
      <ellipse
        cx={width / 2}
        cy={ry}
        rx={width / 2}
        ry={ry}
        fill="#d1fae5"
        stroke="#10b981"
        stroke-width="2"
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
