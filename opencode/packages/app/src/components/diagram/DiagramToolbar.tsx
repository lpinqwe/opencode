interface DiagramToolbarProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitToView?: () => void
  onAutoLayout?: () => void
  onExportSVG?: () => void
  onSave?: () => void
  onToggleSidebar?: () => void
  hasSidebar?: boolean
}

export function DiagramToolbar(props: DiagramToolbarProps) {
  return (
    <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div class="flex items-center gap-2">
        <button
          class="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={props.onToggleSidebar}
        >
          {props.hasSidebar ? "Hide Sidebar" : "Show Sidebar"}
        </button>

        <div class="h-4 w-px bg-gray-300 dark:bg-gray-600" />

        <button
          class="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={props.onZoomIn}
        >
          Zoom In
        </button>
        <button
          class="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={props.onZoomOut}
        >
          Zoom Out
        </button>
        <button
          class="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={props.onFitToView}
        >
          Fit to View
        </button>
        <button
          class="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={props.onAutoLayout}
        >
          Auto Layout
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={props.onExportSVG}
        >
          Export SVG
        </button>
        <button
          class="px-2 py-1 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700"
          onClick={props.onSave}
        >
          Save
        </button>
      </div>
    </div>
  )
}
