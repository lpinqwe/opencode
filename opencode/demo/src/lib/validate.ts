import type { ValidationResult } from "./types"
import { validateMermaid } from "./mermaid-utils"

export function validate(mermaid: string): ValidationResult {
  return validateMermaid(mermaid)
}

export function isValidMermaid(mermaid: string): boolean {
  return validateMermaid(mermaid).valid
}

export function getValidationErrors(mermaid: string): string[] {
  return validateMermaid(mermaid).errors
}

export function getValidationWarnings(mermaid: string): string[] {
  return validateMermaid(mermaid).warnings
}

export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = []

  if (result.valid) {
    lines.push("✓ Valid Mermaid diagram")
  } else {
    lines.push("✗ Invalid Mermaid diagram")
  }

  if (result.errors.length > 0) {
    lines.push("")
    lines.push("Errors:")
    for (const error of result.errors) {
      lines.push(`  - ${error}`)
    }
  }

  if (result.warnings.length > 0) {
    lines.push("")
    lines.push("Warnings:")
    for (const warning of result.warnings) {
      lines.push(`  - ${warning}`)
    }
  }

  return lines.join("\n")
}
