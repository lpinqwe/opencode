import type { FlowNode } from "../../lib/types"

interface ActorNodeProps {
  node: FlowNode
  on_click?: () => void
  on_double_click?: () => void
  on_mouse_down?: (e: MouseEvent) => void
}

export function ActorNode(props: ActorNodeProps) {
  const width = props.node.width
  const height = props.node.height
  const centerX = width / 2
  const headRadius = 15
  const bodyY = headRadius * 2 + 10
  const bodyHeight = height - bodyY - 10

  return (
    <g
      transform={`translate(${props.node.x}, ${props.node.y})`}
      class="cursor-pointer"
      onClick={props.on_click}
      onDblClick={props.on_double_click}
      onMouseDown={props.on_mouse_down}
    >
      <circle
        cx={centerX}
        cy={headRadius}
        r={headRadius}
        fill="#e0e7ff"
        stroke="#6366f1"
        stroke-width="2"
        class="hover:fill-indigo-100 hover:stroke-indigo-500 transition-colors"
      />
      <line
        x1={centerX}
        y1={headRadius * 2}
        x2={centerX}
        y2={bodyY + bodyHeight}
        stroke="#6366f1"
        stroke-width="2"
      />
      <line
        x1={centerX - 20}
        y1={bodyY + 15}
        x2={centerX + 20}
        y2={bodyY + 15}
        stroke="#6366f1"
        stroke-width="2"
      />
      <line
        x1={centerX}
        y1={bodyY + bodyHeight}
        x2={centerX - 15}
        y2={height}
        stroke="#6366f1"
        stroke-width="2"
      />
      <line
        x1={centerX}
        y1={bodyY + bodyHeight}
        x2={centerX + 15}
        y2={height}
        stroke="#6366f1"
        stroke-width="2"
      />
      <text
        x={centerX}
        y={height + 15}
        text-anchor="middle"
        class="text-sm fill-gray-800 pointer-events-none"
      >
        {props.node.label}
      </text>
    </g>
  )
}
