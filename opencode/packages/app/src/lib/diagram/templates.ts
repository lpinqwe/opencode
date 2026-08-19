export interface DiagramTemplate {
  id: string
  name: string
  description: string
  category: "architecture" | "data" | "process" | "devops"
  mermaid: string
  type: "graph" | "sequence" | "class" | "er" | "state" | "mindmap" | "c4"
}

export const diagramTemplates: DiagramTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "A typical microservices architecture with API gateway, services, and databases",
    category: "architecture",
    mermaid: `graph TD
    Client[Client App] --> Gateway[API Gateway]
    Gateway --> UserService[User Service]
    Gateway --> OrderService[Order Service]
    Gateway --> ProductService[Product Service]
    UserService --> UserDB[(User DB)]
    OrderService --> OrderDB[(Order DB)]
    ProductService --> ProductDB[(Product DB)]
    OrderService --> UserService
    OrderService --> ProductService`,
    type: "graph",
  },
  {
    id: "mvc",
    name: "MVC Pattern",
    description: "Model-View-Controller architectural pattern",
    category: "architecture",
    mermaid: `graph TD
    Client[Client] --> Controller[Controller]
    Controller --> Model[Model]
    Controller --> View[View]
    Model --> Database[(Database)]
    View --> Client
    Model --> View`,
    type: "graph",
  },
  {
    id: "ci-cd",
    name: "CI/CD Pipeline",
    description: "Continuous Integration and Deployment pipeline",
    category: "devops",
    mermaid: `graph LR
    Code[Code Commit] --> Build[Build]
    Build --> Test[Unit Tests]
    Test --> Lint[Linting]
    Lint --> Security[Security Scan]
    Security --> Staging[Deploy to Staging]
    Staging --> Integration[Integration Tests]
    Integration --> Approval[Manual Approval]
    Approval --> Production[Deploy to Production]`,
    type: "graph",
  },
  {
    id: "er-basic",
    name: "ER Diagram - E-Commerce",
    description: "Entity-Relationship diagram for an e-commerce system",
    category: "data",
    mermaid: `erDiagram
    USER {
        string id
        string name
        string email
    }
    ORDER {
        string id
        string userId
        datetime createdAt
        float total
    }
    PRODUCT {
        string id
        string name
        float price
        int stock
    }
    ORDER_ITEM {
        string orderId
        string productId
        int quantity
        float price
    }
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "included in"`,
    type: "er",
  },
  {
    id: "auth-sequence",
    name: "Authentication Flow",
    description: "User authentication sequence diagram with JWT tokens",
    category: "process",
    mermaid: `sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant D as Database

    U->>C: Enter credentials
    C->>S: POST /auth/login
    S->>D: Validate credentials
    D-->>S: User data
    S-->>C: JWT Token
    C-->>U: Redirect to dashboard

    Note over C,S: Token-based authentication
    C->>S: GET /api/data (with token)
    S->>S: Validate token
    S-->>C: Protected data`,
    type: "sequence",
  },
  {
    id: "state-machine",
    name: "Order State Machine",
    description: "State diagram for order processing",
    category: "process",
    mermaid: `stateDiagram-v2
    [*] --> Pending
    Pending --> Processing : Payment received
    Processing --> Shipped : Items packed
    Shipped --> Delivered : Delivery confirmed
    Delivered --> Closed : Returns window closed
    Pending --> Cancelled : Customer cancels
    Processing --> Cancelled : Payment failed
    Cancelled --> [*]
    Closed --> [*]`,
    type: "state",
  },
  {
    id: "brainstorm",
    name: "Project Brainstorm",
    description: "Mind map for project planning and brainstorming",
    category: "process",
    mermaid: `mindmap
  root((Project))
    Features
      Authentication
      Dashboard
      Reports
    Tech Stack
      Frontend
      Backend
      Database
    Timeline
      Phase 1
      Phase 2
      Phase 3
    Resources
      Team
      Budget
      Tools`,
    type: "mindmap",
  },
  {
    id: "c4-context",
    name: "C4 System Context",
    description: "C4 model system context diagram",
    category: "architecture",
    mermaid: `C4Context
    title E-Commerce System Context

    Person(customer, "Customer", "Buys products online")
    Person(admin, "Admin", "Manages the system")

    System(ecommerce, "E-Commerce System", "Allows customers to buy products")

    System_Ext(email, "Email System", "Sends notifications")
    System_Ext(payment, "Payment Gateway", "Processes payments")
    System_Ext(delivery, "Delivery Service", "Ships orders")

    Rel(customer, ecommerce, "Uses")
    Rel(admin, ecommerce, "Manages")
    Rel(ecommerce, email, "Sends emails via")
    Rel(ecommerce, payment, "Processes payments via")
    Rel(ecommerce, delivery, "Ships orders via")`,
    type: "c4",
  },
  {
    id: "class-inheritance",
    name: "Class Hierarchy",
    description: "Inheritance pattern with abstract classes and interfaces",
    category: "data",
    mermaid: `classDiagram
    class Animal {
        +String name
        +int age
        +void speak()
    }
    class Dog {
        +void speak()
        +void fetch()
    }
    class Cat {
        +void speak()
        +void purr()
    }
    class Pet {
        +void play()
    }
    Animal <|-- Dog
    Animal <|-- Cat
    Pet <|-- Dog
    Pet <|-- Cat`,
    type: "class",
  },
  {
    id: "api-gateway",
    name: "API Gateway Pattern",
    description: "API Gateway with service mesh architecture",
    category: "architecture",
    mermaid: `graph TD
    Client[Client Apps] --> Gateway[API Gateway]
    Gateway --> Auth[Auth Service]
    Gateway --> RateLimit[Rate Limiter]
    Gateway --> LoadBalancer[Load Balancer]
    LoadBalancer --> Service1[Service A]
    LoadBalancer --> Service2[Service B]
    LoadBalancer --> Service3[Service C]
    Service1 --> Cache[(Cache)]
    Service2 --> Queue[Message Queue]
    Service3 --> DB[(Database)]`,
    type: "graph",
  },
]

export function getTemplatesByCategory(category: DiagramTemplate["category"]): DiagramTemplate[] {
  return diagramTemplates.filter((t) => t.category === category)
}

export function getTemplateById(id: string): DiagramTemplate | undefined {
  return diagramTemplates.find((t) => t.id === id)
}

export function searchTemplates(query: string): DiagramTemplate[] {
  const lower = query.toLowerCase()
  return diagramTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.mermaid.toLowerCase().includes(lower)
  )
}

export const templateCategories = [
  { id: "architecture", name: "Architecture", icon: "🏗️" },
  { id: "data", name: "Data Models", icon: "📊" },
  { id: "process", name: "Processes", icon: "⚙️" },
  { id: "devops", name: "DevOps", icon: "🚀" },
] as const
