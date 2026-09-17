import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Notice } from '~/components/Notice'
import { chunkDocument, formatContext, hybridSearch, type RetrievalHit } from '~/lib/rag'
import { useKnowledge } from '~/store/knowledge'
import { useStudio } from '~/store/studio'

export const Route = createFileRoute('/knowledge')({
  ssr: false,
  component: KnowledgePage,
})

function KnowledgePage() {
  const { docs, add, remove, clear } = useKnowledge()
  const appendToInput = useStudio((state) => state.appendToInput)
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(4)
  const [fuzzyWeight, setFuzzyWeight] = useState(0.5)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const chunks = useMemo(() => docs.flatMap((doc) => chunkDocument(doc)), [docs])
  const hits = useMemo<RetrievalHit[]>(
    () => (query.trim() ? hybridSearch(query, chunks, { topK, fuzzyWeight }) : []),
    [query, chunks, topK, fuzzyWeight],
  )

  function handleAdd() {
    if (!content.trim()) return
    add(title, content)
    setTitle('')
    setContent('')
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function sendToStudio() {
    const chosen = hits.filter((hit) => selected.size === 0 || selected.has(hit.chunk.id))
    if (chosen.length === 0) return
    appendToInput(formatContext(chosen))
    navigate({ to: '/' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <section className="space-y-4">
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold">Add a document</h2>
          <input value={title} placeholder="Title" onChange={(event) => setTitle(event.target.value)} />
          <textarea
            rows={8}
            value={content}
            placeholder="Paste notes, rules, transcripts. Blank lines separate chunks."
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={!content.trim()}>
              Add to knowledge base
            </button>
            {docs.length > 0 && (
              <button type="button" className="btn" onClick={clear}>
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="card space-y-2">
          <h2 className="text-sm font-semibold">
            Documents <span className="text-mist">({docs.length} docs · {chunks.length} chunks)</span>
          </h2>
          {docs.length === 0 && <p className="text-sm text-mist">Nothing filed yet. Documents stay in this browser.</p>}
          <ul className="divide-y divide-edge">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-start justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <p className="truncate text-xs text-mist">{doc.content.slice(0, 120)}</p>
                </div>
                <button type="button" className="btn" onClick={() => remove(doc.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold">Hybrid retrieval</h2>
          <p className="text-xs text-mist">
            BM25 keyword ranking fused with trigram TF-IDF similarity via reciprocal rank fusion. Runs locally; no
            embeddings API needed.
          </p>
          <input value={query} placeholder="Ask the knowledge base…" onChange={(event) => setQuery(event.target.value)} />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label>
              <span className="label">Top K: {topK}</span>
              <input type="range" min={1} max={10} value={topK} onChange={(event) => setTopK(Number(event.target.value))} />
            </label>
            <label>
              <span className="label">Fuzzy weight: {fuzzyWeight.toFixed(2)}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={fuzzyWeight}
                onChange={(event) => setFuzzyWeight(Number(event.target.value))}
              />
            </label>
          </div>
          <button type="button" className="btn btn-primary" onClick={sendToStudio} disabled={hits.length === 0}>
            Send {selected.size > 0 ? `${selected.size} selected` : 'all results'} to Studio Input
          </button>
        </div>

        {query.trim() && hits.length === 0 && <Notice tone="info">No chunks matched. Try fewer or different words.</Notice>}

        <ul className="space-y-2">
          {hits.map((hit, i) => (
            <li key={hit.chunk.id} className="card space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs text-mist">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-auto"
                    checked={selected.has(hit.chunk.id)}
                    onChange={() => toggle(hit.chunk.id)}
                  />
                  <span className="font-semibold text-slate-100">
                    #{i + 1} {hit.chunk.title}
                  </span>
                </label>
                <span>
                  score {hit.score.toFixed(4)} · lexical {hit.lexicalRank ?? '–'} · fuzzy {hit.fuzzyRank ?? '–'}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-200">{hit.chunk.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
