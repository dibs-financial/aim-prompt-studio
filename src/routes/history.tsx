import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useClipboard } from '~/components/useClipboard'
import { useHistory } from '~/store/history'
import { useStudio } from '~/store/studio'

export const Route = createFileRoute('/history')({
  ssr: false,
  component: HistoryPage,
})

function HistoryPage() {
  const { entries, remove, clear } = useHistory()
  const replaceFields = useStudio((state) => state.replaceFields)
  const setOutput = useStudio((state) => state.setOutput)
  const navigate = useNavigate()
  const { copy } = useClipboard()

  if (entries.length === 0) {
    return <p className="text-sm text-mist">No runs saved yet. Copy an output in the Studio to file it here.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{entries.length} saved runs</h2>
        <button type="button" className="btn" onClick={clear}>
          Clear history
        </button>
      </div>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-mist">
              <span>
                {new Date(entry.createdAt).toLocaleString()} · {entry.provider === 'claude' ? 'Claude' : 'Grok'} ·{' '}
                {entry.model}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    replaceFields(entry.fields)
                    setOutput(entry.output)
                    navigate({ to: '/' })
                  }}
                >
                  Reload
                </button>
                <button type="button" className="btn" onClick={() => copy(entry.output)}>
                  Copy output
                </button>
                <button type="button" className="btn" onClick={() => remove(entry.id)}>
                  Delete
                </button>
              </div>
            </div>
            <details>
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-mist">Prompt</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-md border border-edge bg-ink p-3 text-xs text-slate-300">
                {entry.prompt}
              </pre>
            </details>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-edge bg-ink p-3 text-sm">
              {entry.output}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  )
}
