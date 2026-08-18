import { describe, it, expect } from "bun:test"
import { parseMermaid } from "./mermaid-parser"

describe("parseMermaid", () => {
  it("parses flowchart", () => {
    const result = parseMermaid("graph TD\n  A[Frontend] --> B[API]\n  B --> C[(DB)]")
    expect(result.type).toBe("graph")
    expect(result.nodes.length).toBe(3)
    expect(result.edges.length).toBe(2)
  })

  it("parses sequence diagram", () => {
    const result = parseMermaid(`sequenceDiagram
      participant Client
      participant Server
      Client->>Server: GET /api
      Server->>Client: 200 OK`)
    expect(result.type).toBe("sequence")
    expect(result.nodes.length).toBe(2)
    expect(result.edges.length).toBe(2)
  })

  it("parses class diagram", () => {
    const result = parseMermaid(`classDiagram
      class Animal {
        +String name
        +int age
      }
      Animal <|-- Dog`)
    expect(result.type).toBe("class")
    expect(result.nodes.length).toBe(1)
    expect(result.edges.length).toBe(1)
  })

  it("parses ER diagram", () => {
    const result = parseMermaid(`erDiagram
      USERS {
        string id
        string email
      }
      ORDERS {
        string id
        string user_id
      }
      USERS ||--o{ ORDERS : places`)
    expect(result.type).toBe("er")
    expect(result.nodes.length).toBe(2)
    expect(result.edges.length).toBe(1)
  })

  it("parses state diagram", () => {
    const result = parseMermaid(`stateDiagram-v2
      [*] --> Idle
      Idle --> Processing : submit
      Processing --> Completed : success`)
    expect(result.type).toBe("state")
    expect(result.edges.length).toBe(3)
  })

  it("parses mindmap", () => {
    const result = parseMermaid(`mindmap
  root((Project))
    Frontend
      React
      TypeScript
    Backend
      Node.js`)
    expect(result.type).toBe("mindmap")
    expect(result.nodes.length).toBe(5)
    expect(result.edges.length).toBe(4)
  })

  it("parses Gantt chart", () => {
    const result = parseMermaid(`gantt
    title Project Plan
    section Phase 1
    Task 1 :a1, 2024-01-01, 1d
    Task 2 :a2, after a1, 2d`)
    expect(result.type).toBe("gantt")
    expect(result.nodes.length).toBe(3)
  })

  it("parses C4 context diagram", () => {
    const result = parseMermaid(`C4Context
    title System Context
    Person(user, "User")
    System(app, "Application")
    Rel(user, app, "uses")`)
    expect(result.type).toBe("c4")
    expect(result.nodes.length).toBe(2)
    expect(result.edges.length).toBe(1)
  })
})
