import type { FlowData } from "./types"
import { flowToMermaid } from "./mermaid-to-flow"

export interface ExportOptions {
  format: "svg" | "png" | "clipboard" | "mermaid"
  quality?: number
  scale?: number
  background?: string
}

export async function exportDiagram(
  flowData: FlowData,
  options: ExportOptions
): Promise<string | void> {
  switch (options.format) {
    case "svg":
      return exportAsSVG(flowData, options)
    case "png":
      return exportAsPNG(flowData, options)
    case "clipboard":
      return exportToClipboard(flowData, options)
    case "mermaid":
      return exportAsMermaid(flowData)
  }
}

function exportAsSVG(flowData: FlowData, options: ExportOptions): string {
  const width = calculateWidth(flowData)
  const height = calculateHeight(flowData)
  const padding = 40

  const svgParts: string[] = []
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width + padding * 2}" height="${height + padding * 2}" viewBox="0 0 ${width + padding * 2} ${height + padding * 2}">`)

  if (options.background) {
    svgParts.push(`<rect width="100%" height="100%" fill="${options.background}"/>`)
  } else {
    svgParts.push(`<rect width="100%" height="100%" fill="white"/>`)
  }

  svgParts.push(`<g transform="translate(${padding}, ${padding})">`)

  for (const edge of flowData.edges) {
    const source = flowData.nodes.find((n) => n.id === edge.source)
    const target = flowData.nodes.find((n) => n.id === edge.target)
    if (source && target) {
      const svgEdge = createSVGEdge(edge, source, target)
      svgParts.push(svgEdge)
    }
  }

  for (const node of flowData.nodes) {
    const svgNode = createSVGNode(node)
    svgParts.push(svgNode)
  }

  svgParts.push("</g>")
  svgParts.push("</svg>")

  return svgParts.join("\n")
}

function createSVGNode(node: FlowData["nodes"][0]): string {
  const x = node.x ?? 0
  const y = node.y ?? 0
  const width = node.width ?? 150
  const height = node.height ?? 60

  let shape = ""
  switch (node.type) {
    case "decision":
      const halfW = width / 2
      const halfH = height / 2
      shape = `<polygon points="${x + halfW},${y} ${x + width},${y + halfH} ${x + halfW},${y + height} ${x},${y + halfH}" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>`
      break
    case "database":
      const ry = height / 4
      shape = `<path d="M ${x} ${y + ry} A ${width / 2} ${ry} 0 0 1 ${x + width} ${y + ry} L ${x + width} ${y + height - ry} A ${width / 2} ${ry} 0 0 1 ${x} ${y + height - ry} Z" fill="#d1fae5" stroke="#10b981" stroke-width="2"/>`
      break
    case "actor":
      const centerX = x + width / 2
      const headRadius = 15
      shape = `<circle cx="${centerX}" cy="${y + headRadius}" r="${headRadius}" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>`
      shape += `<line x1="${centerX}" y1="${y + headRadius * 2}" x2="${centerX}" y2="${y + height - 20}" stroke="#6366f1" stroke-width="2"/>`
      shape += `<line x1="${centerX - 20}" y1="${y + headRadius * 2 + 15}" x2="${centerX + 20}" y2="${y + headRadius * 2 + 15}" stroke="#6366f1" stroke-width="2"/>`
      break
    default:
      shape = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="4" ry="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>`
  }

  const text = `<text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="14" fill="#1e293b">${escapeXml(node.label)}</text>`

  return `<g>${shape}${text}</g>`
}

function createSVGEdge(
  edge: FlowData["edges"][0],
  source: FlowData["nodes"][0],
  target: FlowData["nodes"][0]
): string {
  const sourceX = (source.x ?? 0) + (source.width ?? 150) / 2
  const sourceY = (source.y ?? 0) + (source.height ?? 60) / 2
  const targetX = (target.x ?? 0) + (target.width ?? 150) / 2
  const targetY = (target.y ?? 0) + (target.height ?? 60) / 2

  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const angle = Math.atan2(dy, dx)

  const startX = sourceX + Math.cos(angle) * (source.width ?? 150) / 2
  const startY = sourceY + Math.sin(angle) * (source.height ?? 60) / 2
  const endX = targetX - Math.cos(angle) * (target.width ?? 150) / 2
  const endY = targetY - Math.sin(angle) * (target.height ?? 60) / 2

  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2

  let line = `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#64748b" stroke-width="2" marker-end="url(#arrowhead)"/>`

  if (edge.label) {
    const labelWidth = edge.label.length * 8 + 16
    line += `<rect x="${midX - labelWidth / 2}" y="${midY - 10}" width="${labelWidth}" height="20" fill="white" stroke="#e2e8f0" stroke-width="1" rx="4"/>`
    line += `<text x="${midX}" y="${midY}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="12" fill="#64748b">${escapeXml(edge.label)}</text>`
  }

  return line
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function calculateWidth(flowData: FlowData): number {
  if (flowData.nodes.length === 0) return 400
  const maxX = Math.max(...flowData.nodes.map((n) => (n.x ?? 0) + (n.width ?? 150)))
  return maxX + 100
}

function calculateHeight(flowData: FlowData): number {
  if (flowData.nodes.length === 0) return 300
  const maxY = Math.max(...flowData.nodes.map((n) => (n.y ?? 0) + (n.height ?? 60)))
  return maxY + 100
}

async function exportAsPNG(flowData: FlowData, options: ExportOptions): Promise<string> {
  const svg = exportAsSVG(flowData, options)
  const scale = options.scale || 2

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  const img = new Image()
  const blob = new Blob([svg], { type: "image/svg+xml" })
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Could not create blob"))
          return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1]
          resolve(base64)
        }
        reader.readAsDataURL(blob)
      }, "image/png")
    }
    img.onerror = reject
    img.src = url
  })
}

async function exportToClipboard(flowData: FlowData, options: ExportOptions): Promise<void> {
  const svg = exportAsSVG(flowData, options)

  const blob = new Blob([svg], { type: "image/svg+xml" })
  const item = new ClipboardItem({ "image/svg+xml": blob })
  await navigator.clipboard.write([item])
}

function exportAsMermaid(flowData: FlowData): string {
  return flowToMermaid(flowData, "graph")
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadSVG(flowData: FlowData, filename: string): void {
  const svg = exportAsSVG(flowData, { format: "svg" })
  downloadFile(svg, filename, "image/svg+xml")
}

export function downloadPNG(flowData: FlowData, filename: string, scale: number = 2): void {
  exportAsPNG(flowData, { format: "png", scale }).then((base64) => {
    const binary = atob(base64)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i)
    }
    const blob = new Blob([array], { type: "image/png" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  })
}

export function downloadMermaid(flowData: FlowData, filename: string): void {
  const mermaid = exportAsMermaid(flowData)
  downloadFile(mermaid, filename, "text/plain")
}

export function copyMermaidToClipboard(flowData: FlowData): Promise<void> {
  const mermaid = exportAsMermaid(flowData)
  return navigator.clipboard.writeText(mermaid)
}

export function copyImageToClipboard(flowData: FlowData): Promise<void> {
  return exportToClipboard(flowData, { format: "clipboard" })
}
