import { describe, it, expect } from "bun:test"
import {
  diagramTemplates,
  getTemplatesByCategory,
  getTemplateById,
  searchTemplates,
  templateCategories,
} from "./templates"

describe("Templates", () => {
  describe("diagramTemplates", () => {
    it("should have templates defined", () => {
      expect(diagramTemplates).toBeDefined()
      expect(diagramTemplates.length).toBeGreaterThan(0)
    })

    it("should have valid structure", () => {
      for (const template of diagramTemplates) {
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.description).toBeDefined()
        expect(template.category).toBeDefined()
        expect(template.mermaid).toBeDefined()
        expect(template.type).toBeDefined()
      }
    })

    it("should have unique IDs", () => {
      const ids = diagramTemplates.map((t) => t.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })
  })

  describe("getTemplatesByCategory", () => {
    it("should filter templates by category", () => {
      const architecture = getTemplatesByCategory("architecture")
      expect(architecture.length).toBeGreaterThan(0)
      for (const t of architecture) {
        expect(t.category).toBe("architecture")
      }
    })

    it("should return empty array for unknown category", () => {
      const result = getTemplatesByCategory("unknown" as any)
      expect(result.length).toBe(0)
    })

    it("should return all categories", () => {
      const categories = ["architecture", "data", "process", "devops"]
      for (const cat of categories) {
        const templates = getTemplatesByCategory(cat as any)
        expect(templates.length).toBeGreaterThan(0)
      }
    })
  })

  describe("getTemplateById", () => {
    it("should find template by ID", () => {
      const template = getTemplateById("microservices")
      expect(template).toBeDefined()
      expect(template?.name).toBe("Microservices Architecture")
    })

    it("should return undefined for unknown ID", () => {
      const template = getTemplateById("nonexistent")
      expect(template).toBeUndefined()
    })

    it("should find all templates by ID", () => {
      for (const t of diagramTemplates) {
        const found = getTemplateById(t.id)
        expect(found).toBeDefined()
        expect(found?.id).toBe(t.id)
      }
    })
  })

  describe("searchTemplates", () => {
    it("should find templates by name", () => {
      const results = searchTemplates("microservices")
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((t) => t.id === "microservices")).toBe(true)
    })

    it("should find templates by description", () => {
      const results = searchTemplates("authentication")
      expect(results.length).toBeGreaterThan(0)
    })

    it("should find templates by mermaid content", () => {
      const results = searchTemplates("sequenceDiagram")
      expect(results.length).toBeGreaterThan(0)
    })

    it("should be case insensitive", () => {
      const results = searchTemplates("MICROSERVICES")
      expect(results.length).toBeGreaterThan(0)
    })

    it("should return empty for no match", () => {
      const results = searchTemplates("xyz123nonexistent")
      expect(results.length).toBe(0)
    })

    it("should find C4 templates", () => {
      const results = searchTemplates("C4Context")
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe("templateCategories", () => {
    it("should have categories defined", () => {
      expect(templateCategories).toBeDefined()
      expect(templateCategories.length).toBeGreaterThan(0)
    })

    it("should have valid category structure", () => {
      for (const cat of templateCategories) {
        expect(cat.id).toBeDefined()
        expect(cat.name).toBeDefined()
        expect(cat.icon).toBeDefined()
      }
    })

    it("should have matching IDs", () => {
      const categoryIds = templateCategories.map((c) => c.id)
      const templateCategories2 = new Set(diagramTemplates.map((t) => t.category))
      for (const cat of templateCategories2) {
        expect(categoryIds).toContain(cat)
      }
    })
  })
})
