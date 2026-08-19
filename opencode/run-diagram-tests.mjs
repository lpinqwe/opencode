import { run } from "node:test"
import { spec as SpecReporter } from "node:test/reporters"
import { pathToFileURL } from "node:url"
import { glob } from "node:fs/promises"

const testFiles = [
  "packages/app/src/lib/diagram/mermaid-utils.test.ts",
  "packages/app/src/lib/diagram/mermaid-parser.test.ts",
  "packages/app/src/lib/diagram/mermaid-to-flow.test.ts",
  "packages/app/src/lib/diagram/validate.test.ts",
  "packages/app/src/lib/diagram/tui-renderer.test.ts",
  "packages/app/src/lib/diagram/editor.test.ts",
  "packages/app/src/lib/diagram/export.test.ts",
  "packages/app/src/lib/diagram/ai-features.test.ts",
  "packages/app/src/lib/diagram/templates.test.ts",
  "packages/opencode/src/tool/diagram-tool.test.ts",
]

console.log("Running diagram tests...\n")

const stream = run(
  testFiles.map((file) => pathToFileURL(file).href),
  {
    concurrency: 1,
    setup: (test) => {
      // Additional setup if needed
    },
  }
)

stream.compose(new SpecReporter()).pipe(process.stdout)

stream.on("test:pass", (data) => {
  console.log(`✓ ${data.name}`)
})

stream.on("test:fail", (data) => {
  console.log(`✗ ${data.name}`)
  if (data.details?.error) {
    console.log(`  Error: ${data.details.error.message}`)
  }
})

stream.on("test:complete", (data) => {
  const passed = data.passed || 0
  const failed = data.failed || 0
  const total = passed + failed
  console.log(`\n${passed}/${total} tests passed`)
  process.exit(failed > 0 ? 1 : 0)
})
