import { render } from "solid-js/web"
import { createSignal, For, Show } from "solid-js"
import { DiagramCanvas } from "./components/DiagramCanvas"
import { MermaidEditor } from "./components/MermaidEditor"
import { mermaidToFlow, flowToMermaid } from "./lib/mermaid-to-flow"
import { parseMermaid } from "./lib/mermaid-parser"
import type { FlowData } from "./lib/types"

const DEMO_MERMAID = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`

function App() {
  const [mermaid, setMermaid] = createSignal(DEMO_MERMAID)
  const [flowData, setFlowData] = createSignal<FlowData>({ nodes: [], edges: [] })

  const handleMermaidChange = (code: string) => {
    setMermaid(code)
    try {
      const result = parseMermaid(code)
      if (result && result.nodes) {
        const flow = mermaidToFlow(result)
        setFlowData(flow)
      }
    } catch (e) {
      console.error("Parse error:", e)
    }
  }

  // Initial parse
  try {
    const result = parseMermaid(DEMO_MERMAID)
    if (result && result.nodes) {
      const flow = mermaidToFlow(result)
      setTimeout(() => setFlowData(flow), 0)
    }
  } catch (e) {
    console.error("Init parse error:", e)
  }

  return (
    <div style={{ display: "flex", "flex-direction": "column", height: "100vh" }}>
      <header style={{ padding: "12px 20px", background: "#1e293b", "border-bottom": "1px solid #334155" }}>
        <h1 style={{ "font-size": "18px", "font-weight": "600" }}>Diagram Editor Demo</h1>
        <p style={{ "font-size": "13px", color: "#94a3b8" }}>Mermaid ↔ SVG Canvas — Phase 4 Features</p>
      </header>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "auto", background: "#1e293b" }}>
          <DiagramCanvas
            flowData={flowData()}
            onNodeClick={(node) => console.log("Clicked:", node.id)}
          />
        </div>
        <div style={{ width: "400px", border: "1px solid #334155", display: "flex", "flex-direction": "column" }}>
          <div style={{ padding: "8px 12px", background: "#1e293b", "border-bottom": "1px solid #334155", "font-size": "13px", color: "#94a3b8" }}>
            Mermaid Code
          </div>
          <MermaidEditor
            value={mermaid()}
            onChange={handleMermaidChange}
          />
        </div>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById("app")!)
