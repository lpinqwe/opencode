import { describe, it, expect } from "bun:test"
import { validate, isValidMermaid, getValidationErrors, getValidationWarnings, formatValidationResult } from "./validate"

describe("validate", () => {
  it("validates empty diagram", () => {
    const result = validate("")
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it("validates simple graph", () => {
    const result = validate("graph TD\n  A --> B")
    expect(result.valid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it("validates complex graph", () => {
    const result = validate(`graph TD
      subgraph Frontend
        A[React App]
      end
      subgraph Backend
        B[API Server]
      end
      A --> B`)
    expect(result.valid).toBe(true)
  })
})

describe("isValidMermaid", () => {
  it("returns true for valid mermaid", () => {
    expect(isValidMermaid("graph TD\n  A --> B")).toBe(true)
  })

  it("returns false for invalid mermaid", () => {
    expect(isValidMermaid("")).toBe(false)
  })
})

describe("getValidationErrors", () => {
  it("returns errors for empty diagram", () => {
    const errors = getValidationErrors("")
    expect(errors.length).toBeGreaterThan(0)
  })

  it("returns no errors for valid diagram", () => {
    const errors = getValidationErrors("graph TD\n  A --> B")
    expect(errors.length).toBe(0)
  })
})

describe("getValidationWarnings", () => {
  it("returns warnings for graph without direction", () => {
    const warnings = getValidationWarnings("graph\n  A --> B")
    expect(warnings.length).toBeGreaterThan(0)
  })

  it("returns no warnings for valid graph", () => {
    const warnings = getValidationWarnings("graph TD\n  A --> B")
    expect(warnings.length).toBe(0)
  })
})

describe("formatValidationResult", () => {
  it("formats valid result", () => {
    const result = validate("graph TD\n  A --> B")
    const formatted = formatValidationResult(result)
    expect(formatted).toContain("Valid")
  })

  it("formats invalid result", () => {
    const result = validate("")
    const formatted = formatValidationResult(result)
    expect(formatted).toContain("Invalid")
    expect(formatted).toContain("Errors:")
  })

  it("formats warnings", () => {
    const result = validate("graph\n  A --> B")
    const formatted = formatValidationResult(result)
    expect(formatted).toContain("Warnings:")
  })
})
