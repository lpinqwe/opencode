export interface DiagramNode {
  id: string
  label: string
  type: "block" | "decision" | "database" | "actor" | "group" | "mindmap" | "note"
  x?: number
  y?: number
  width?: number
  height?: number
  metadata?: Record<string, unknown>
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  label?: string
  type: "solid" | "dashed" | "dotted" | "thick"
  metadata?: Record<string, unknown>
}

export interface Diagram {
  name: string
  type: DiagramType
  mermaid: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  metadata?: DiagramMetadata
}

export type DiagramType =
  | "graph"
  | "sequence"
  | "class"
  | "er"
  | "state"
  | "mindmap"
  | "gantt"
  | "c4"

export interface DiagramMetadata {
  created?: string
  updated?: string
  description?: string
  tags?: string[]
}

export interface FlowNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  type: string
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  label?: string
  type: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface ParseResult {
  type: DiagramType
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  raw: string
}

export interface LayoutOptions {
  direction: "TB" | "BT" | "LR" | "RL"
  rankSeparation: number
  nodeSeparation: number
  marginX: number
  marginY: number
}
