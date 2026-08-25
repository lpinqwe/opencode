import type { FlowEdge, FlowNode } from "../../lib/types"

interface CustomEdgeProps {
  edge: FlowEdge
  source: FlowNode
  target: FlowNode
}

export function CustomEdge(props: CustomEdgeProps) {
  const sourceCenterX = props.source.x + props.source.width / 2
  const sourceCenterY = props.source.y + props.source.height / 2
  const targetCenterX = props.target.x + props.target.width / 2
  const targetCenterY = props.target.y + props.target.height / 2

  const dx = targetCenterX - sourceCenterX
  const dy = targetCenterY - sourceCenterY
  const angle = Math.atan2(dy, dx)

  const sourceX = sourceCenterX + Math.cos(angle) * props.source.width / 2
  const sourceY = sourceCenterY + Math.sin(angle) * props.source.height / 2
  const targetX = targetCenterX - Math.cos(angle) * props.target.width / 2
  const targetY = targetCenterY - Math.sin(angle) * props.target.height / 2

  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2

  const strokeDasharray = props.edge.type === "dashed" ? "5,5" : props.edge.type === "dotted" ? "2,2" : "none"
  const strokeWidth = props.edge.type === "thick" ? 3 : 2

  return (
    <g>
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke="#64748b"
        stroke-width={strokeWidth}
        stroke-dasharray={strokeDasharray}
        marker-end="url(#arrowhead)"
      />
      <Show when={props.edge.label}>
        <rect
          x={midX - 40}
          y={midY - 10}
          width={80}
          height={20}
          fill="white"
          stroke="#e2e8f0"
          stroke-width="1"
          rx="4"
        />
        <text
          x={midX}
          y={midY}
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-xs fill-gray-600 pointer-events-none"
        >
          {props.edge.label}
        </text>
      </Show>
    </g>
  )
}

function Show(props: { when: unknown; children: () => JSX.Element }) {
  return props.when ? props.children() : null
}
