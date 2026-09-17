import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AimFields } from '~/lib/aim'
import type { Provider } from './settings'

export interface HistoryEntry {
  id: string
  createdAt: number
  provider: Provider
  model: string
  fields: AimFields
  prompt: string
  output: string
}

interface HistoryState {
  entries: HistoryEntry[]
  add: (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => HistoryEntry
  remove: (id: string) => void
  clear: () => void
}

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) => {
        const full: HistoryEntry = {
          ...entry,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        }
        set((state) => ({ entries: [full, ...state.entries].slice(0, 200) }))
        return full
      },
      remove: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      clear: () => set({ entries: [] }),
    }),
    { name: 'aim-history' },
  ),
)
