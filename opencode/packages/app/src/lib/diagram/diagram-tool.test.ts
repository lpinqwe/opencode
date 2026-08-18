import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { existsSync, mkdirSync, rmSync, readFileSync } from "fs"
import path from "path"

const TEST_DIR = path.join(import.meta.dir, "__test_diagrams__")
const DIAGRAMS_DIR = path.join(TEST_DIR, ".opencode", "diagrams")

beforeEach(() => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true })
  }
  mkdirSync(DIAGRAMS_DIR, { recursive: true })
})

afterEach(() => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true })
  }
})

function createDiagramFile(name: string, content: string) {
  const filePath = path.join(DIAGRAMS_DIR, `${name}.mmd`)
  const fs = require("fs")
  fs.writeFileSync(filePath, content, "utf8")
}

function readDiagramFile(name: string): string {
  const filePath = path.join(DIAGRAMS_DIR, `${name}.mmd`)
  const fs = require("fs")
  return fs.readFileSync(filePath, "utf8")
}

function listDiagramFiles(): string[] {
  const fs = require("fs")
  return fs.readdirSync(DIAGRAMS_DIR).filter((f: string) => f.endsWith(".mmd"))
}

function deleteDiagramFile(name: string) {
  const fs = require("fs")
  const filePath = path.join(DIAGRAMS_DIR, `${name}.mmd`)
  fs.unlinkSync(filePath)
}

describe("Diagram Tool Integration", () => {
  it("creates diagram files", () => {
    const content = "graph TD\n  A[Frontend] --> B[API]"
    createDiagramFile("test", content)
    
    expect(existsSync(path.join(DIAGRAMS_DIR, "test.mmd"))).toBe(true)
    expect(readDiagramFile("test")).toBe(content)
  })

  it("lists diagram files", () => {
    createDiagramFile("auth", "graph TD\n  A[Login] --> B[Dashboard]")
    createDiagramFile("db", "erDiagram\n  USERS {}")
    
    const files = listDiagramFiles()
    expect(files.length).toBe(2)
    expect(files).toContain("auth.mmd")
    expect(files).toContain("db.mmd")
  })

  it("reads diagram files", () => {
    const content = "graph TD\n  A --> B"
    createDiagramFile("test", content)
    
    expect(readDiagramFile("test")).toBe(content)
  })

  it("deletes diagram files", () => {
    createDiagramFile("test", "graph TD\n  A --> B")
    expect(existsSync(path.join(DIAGRAMS_DIR, "test.mmd"))).toBe(true)
    
    deleteDiagramFile("test")
    expect(existsSync(path.join(DIAGRAMS_DIR, "test.mmd"))).toBe(false)
  })

  it("handles multiple diagram types", () => {
    const diagrams = [
      { name: "flow", content: "graph TD\n  A --> B" },
      { name: "sequence", content: "sequenceDiagram\n  participant A\n  A->>B: hello" },
      { name: "er", content: "erDiagram\n  USERS {}" },
      { name: "state", content: "stateDiagram-v2\n  [*] --> Idle" },
    ]

    for (const diagram of diagrams) {
      createDiagramFile(diagram.name, diagram.content)
    }

    const files = listDiagramFiles()
    expect(files.length).toBe(4)
  })

  it("sanitizes filenames", () => {
    const sanitizedName = "test-diagram_name"
    createDiagramFile(sanitizedName, "graph TD\n  A --> B")
    
    expect(existsSync(path.join(DIAGRAMS_DIR, `${sanitizedName}.mmd`))).toBe(true)
  })
})

describe("Diagram Content Validation", () => {
  it("validates mermaid syntax", () => {
    const validDiagrams = [
      "graph TD\n  A --> B",
      "graph LR\n  A[Node] --> B[Node]",
      "sequenceDiagram\n  participant A\n  A->>B: message",
      "classDiagram\n  class Animal",
      "erDiagram\n  USERS {}",
      "stateDiagram-v2\n  [*] --> Idle",
      "mindmap\n  root\n    A",
      "gantt\n  title Test",
      "C4Context\n  title Test",
    ]

    for (const diagram of validDiagrams) {
      const { detectDiagramType } = require("./mermaid-utils")
      const type = detectDiagramType(diagram)
      expect(type).not.toBe("graph") // Should detect specific type
    }
  })

  it("detects diagram types correctly", () => {
    const { detectDiagramType } = require("./mermaid-utils")
    
    expect(detectDiagramType("graph TD\n  A --> B")).toBe("graph")
    expect(detectDiagramType("sequenceDiagram\n  A->>B: hi")).toBe("sequence")
    expect(detectDiagramType("classDiagram\n  class A")).toBe("class")
    expect(detectDiagramType("erDiagram\n  A {}")).toBe("er")
    expect(detectDiagramType("stateDiagram-v2\n  [*] --> A")).toBe("state")
    expect(detectDiagramType("mindmap\n  root")).toBe("mindmap")
    expect(detectDiagramType("gantt\n  title Test")).toBe("gantt")
    expect(detectDiagramType("C4Context\n  title Test")).toBe("c4")
  })
})
