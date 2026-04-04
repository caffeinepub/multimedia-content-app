// This hook is kept for import compatibility but the Web Audio filter chain
// has been bypassed entirely to fix silent audio issues.
// Audio now plays directly via HTMLAudioElement at volume 1.0.

export type FilterMode = "standard" | "clean" | "ultraclean";

export function useWebAudioFilters() {
  return {
    filterMode: "standard" as FilterMode,
    setFilterMode: (_mode: FilterMode) => {
      /* no-op: filter UI removed */
    },
    connectAudioElement: (_element: HTMLAudioElement) => {
      /* no-op: bypassed */
    },
    disconnectAudioElement: () => {
      /* no-op: bypassed */
    },
    isConnected: false,
  };
}
