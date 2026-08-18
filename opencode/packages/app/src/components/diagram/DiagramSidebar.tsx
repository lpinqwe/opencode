import { For, Show } from "solid-js"

interface DiagramSidebarProps {
  diagrams: Array<{ name: string; type: string }>
  currentDiagram?: string | null
  onSelect?: (name: string) => void
  onDelete?: (name: string) => void
  onToggle?: () => void
}

export function DiagramSidebar(props: DiagramSidebarProps) {
  return (
    <div class="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Diagrams</span>
        <button
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={props.onToggle}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <Show
          when={props.diagrams.length > 0}
          fallback={
            <div class="p-3 text-sm text-gray-500 dark:text-gray-400">
              No diagrams yet. Create one using the diagram tool.
            </div>
          }
        >
          <For each={props.diagrams}>
            {(diagram) => (
              <div
                class={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  props.currentDiagram === diagram.name
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
                    : ""
                }`}
                onClick={() => props.onSelect?.(diagram.name)}
              >
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {diagram.name}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {diagram.type}
                  </div>
                </div>
                <button
                  class="ml-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation()
                    props.onDelete?.(diagram.name)
                  }}
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  )
}
