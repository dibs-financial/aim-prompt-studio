import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { KnowledgeDoc } from '~/lib/rag'

interface KnowledgeState {
  docs: KnowledgeDoc[]
  add: (title: string, content: string) => KnowledgeDoc
  update: (id: string, patch: Partial<Pick<KnowledgeDoc, 'title' | 'content'>>) => void
  remove: (id: string) => void
  clear: () => void
}

export const useKnowledge = create<KnowledgeState>()(
  persist(
    (set) => ({
      docs: [],
      add: (title, content) => {
        const doc: KnowledgeDoc = {
          id: crypto.randomUUID(),
          title: title.trim() || 'Untitled',
          content,
          createdAt: Date.now(),
        }
        set((state) => ({ docs: [doc, ...state.docs] }))
        return doc
      },
      update: (id, patch) =>
        set((state) => ({ docs: state.docs.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)) })),
      remove: (id) => set((state) => ({ docs: state.docs.filter((doc) => doc.id !== id) })),
      clear: () => set({ docs: [] }),
    }),
    { name: 'aim-knowledge' },
  ),
)
