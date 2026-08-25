import { createSignal, createEffect, onMount } from "solid-js"
import { validate } from "../lib/validate"

interface MermaidEditorProps {
  value: string
  onChange?: (value: string) => void
  readonly?: boolean
}

export function MermaidEditor(props: MermaidEditorProps) {
  const [localValue, setLocalValue] = createSignal(props.value)
  const [errors, setErrors] = createSignal<string[]>([])
  const [warnings, setWarnings] = createSignal<string[]>([])

  let textareaRef: HTMLTextAreaElement | undefined

  createEffect(() => {
    setLocalValue(props.value)
  })

  createEffect(() => {
    const value = localValue()
    if (value) {
      const result = validate(value)
      setErrors(result.errors)
      setWarnings(result.warnings)
    } else {
      setErrors([])
      setWarnings([])
    }
  })

  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLTextAreaElement
    setLocalValue(target.value)
    props.onChange?.(target.value)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const value = localValue()
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      setLocalValue(newValue)
      props.onChange?.(newValue)
      target.selectionStart = target.selectionEnd = start + 2
    }
  }

  onMount(() => {
    textareaRef?.focus()
  })

  return (
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Mermaid Code</span>
        <div class="flex items-center gap-2">
          {errors().length > 0 && (
            <span class="text-xs text-red-500">{errors().length} error(s)</span>
          )}
          {warnings().length > 0 && (
            <span class="text-xs text-yellow-500">{warnings().length} warning(s)</span>
          )}
          {errors().length === 0 && warnings().length === 0 && localValue() && (
            <span class="text-xs text-green-500">Valid</span>
          )}
        </div>
      </div>

      <div class="flex-1 relative">
        <textarea
          ref={textareaRef}
          class="w-full h-full p-3 font-mono text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-none resize-none focus:outline-none"
          value={localValue()}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          readonly={props.readonly}
          placeholder="Enter Mermaid diagram code here..."
          spellcheck={false}
        />
      </div>

      {(errors().length > 0 || warnings().length > 0) && (
        <div class="border-t border-gray-200 dark:border-gray-700 p-3 max-h-32 overflow-y-auto">
          {errors().map((error) => (
            <div class="text-xs text-red-500 mb-1">Error: {error}</div>
          ))}
          {warnings().map((warning) => (
            <div class="text-xs text-yellow-500 mb-1">Warning: {warning}</div>
          ))}
        </div>
      )}
    </div>
  )
}
