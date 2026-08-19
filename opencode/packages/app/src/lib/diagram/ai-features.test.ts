import { describe, it, expect } from "bun:test"
import {
  generateDiagramFromDescription,
  explainDiagram,
  convertToCode,
} from "./ai-features"

describe("AI Features", () => {
  describe("generateDiagramFromDescription", () => {
    it("should generate a flowchart from description", () => {
      const result = generateDiagramFromDescription({
        description: "User authentication flow with login and logout",
      })
      expect(result.mermaid).toContain("graph")
      expect(result.type).toBe("graph")
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it("should detect sequence diagram type", () => {
      const result = generateDiagramFromDescription({
        description: "sequence of API calls between client and server",
        type: "sequence",
      })
      expect(result.type).toBe("sequence")
      expect(result.mermaid).toContain("sequenceDiagram")
    })

    it("should detect class diagram type", () => {
      const result = generateDiagramFromDescription({
        description: "class inheritance hierarchy with polymorphism",
        type: "class",
      })
      expect(result.type).toBe("class")
      expect(result.mermaid).toContain("classDiagram")
    })

    it("should detect ER diagram type", () => {
      const result = generateDiagramFromDescription({
        description: "database schema with entities and relationships",
        type: "er",
      })
      expect(result.type).toBe("er")
      expect(result.mermaid).toContain("erDiagram")
    })

    it("should detect state diagram type", () => {
      const result = generateDiagramFromDescription({
        description: "state machine for order processing",
        type: "state",
      })
      expect(result.type).toBe("state")
      expect(result.mermaid).toContain("stateDiagram-v2")
    })

    it("should detect mindmap type", () => {
      const result = generateDiagramFromDescription({
        description: "mind map of project ideas and brainstorming",
        type: "mindmap",
      })
      expect(result.type).toBe("mindmap")
      expect(result.mermaid).toContain("mindmap")
    })

    it("should detect C4 type", () => {
      const result = generateDiagramFromDescription({
        description: "C4 system context architecture diagram",
        type: "c4",
      })
      expect(result.type).toBe("c4")
      expect(result.mermaid).toContain("C4Context")
    })

    it("should include suggestions", () => {
      const result = generateDiagramFromDescription({
        description: "microservices architecture",
        type: "graph",
      })
      expect(result.suggestions).toBeDefined()
      expect(result.suggestions!.length).toBeGreaterThan(0)
    })

    it("should respect explicit type parameter", () => {
      const result = generateDiagramFromDescription({
        description: "anything",
        type: "sequence",
      })
      expect(result.type).toBe("sequence")
    })

    it("should include context when provided", () => {
      const result = generateDiagramFromDescription({
        description: "data flow",
        context: "e-commerce system",
      })
      expect(result.mermaid).toBeDefined()
    })
  })

  describe("explainDiagram", () => {
    it("should explain a flowchart", () => {
      const mermaid = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[End]
    B -->|No| D[Process]`

      const result = explainDiagram(mermaid)
      expect(result.summary).toBeDefined()
      expect(result.components).toBeDefined()
      expect(result.relationships).toBeDefined()
      expect(result.suggestions).toBeDefined()
    })

    it("should explain a sequence diagram", () => {
      const mermaid = `sequenceDiagram
    participant A as Client
    participant B as Server
    A->>B: Request
    B-->>A: Response`

      const result = explainDiagram(mermaid)
      expect(result.summary).toContain("sequence")
    })

    it("should explain an ER diagram", () => {
      const mermaid = `erDiagram
    USER {
        string id
        string name
    }
    ORDER {
        string id
        string userId
    }
    USER ||--o{ ORDER : places`

      const result = explainDiagram(mermaid)
      expect(result.summary).toContain("er")
      expect(result.components.length).toBeGreaterThan(0)
    })

    it("should explain a class diagram", () => {
      const mermaid = `classDiagram
    class Animal {
        +String name
        +void speak()
    }
    class Dog {
        +void fetch()
    }
    Animal <|-- Dog`

      const result = explainDiagram(mermaid)
      expect(result.summary).toContain("class")
    })

    it("should handle unknown diagram type gracefully", () => {
      const mermaid = `customDiagram
    node1 --> node2`

      const result = explainDiagram(mermaid)
      expect(result.summary).toBeDefined()
    })
  })

  describe("convertToCode", () => {
    it("should convert description to mermaid", () => {
      const result = convertToCode({
        input: "simple flowchart with start and end",
        inputType: "description",
        outputType: "graph",
      })
      expect(result.mermaid).toContain("graph")
      expect(result.type).toBe("graph")
      expect(result.warnings).toBeDefined()
    })

    it("should convert JSON to mermaid", () => {
      const json = JSON.stringify({
        nodes: [
          { id: "a", label: "Start" },
          { id: "b", label: "End" },
        ],
      })
      const result = convertToCode({
        input: json,
        inputType: "json",
        outputType: "graph",
      })
      expect(result.mermaid).toBeDefined()
    })

    it("should return input when inputType is code", () => {
      const mermaid = "graph TD\n    A --> B"
      const result = convertToCode({
        input: mermaid,
        inputType: "code",
        outputType: "graph",
      })
      expect(result.mermaid).toBe(mermaid)
    })

    it("should include warnings for AI-generated content", () => {
      const result = convertToCode({
        input: "some description",
        inputType: "description",
        outputType: "graph",
      })
      expect(result.warnings).toBeDefined()
      expect(result.warnings!.length).toBeGreaterThan(0)
    })
  })
})
