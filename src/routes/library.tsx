import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { LIBRARY, LIBRARY_CATEGORIES, type LibraryCategory } from '~/data/library'
import { useStudio } from '~/store/studio'

export const Route = createFileRoute('/library')({
  ssr: false,
  component: LibraryPage,
})

function LibraryPage() {
  const [category, setCategory] = useState<LibraryCategory>('role')
  const setFields = useStudio((state) => state.setFields)
  const navigate = useNavigate()
  const active = LIBRARY_CATEGORIES.find((c) => c.key === category)
  const prompts = LIBRARY.filter((prompt) => prompt.category === category)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LIBRARY_CATEGORIES.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`btn ${item.key === category ? 'btn-primary' : ''}`}
            onClick={() => setCategory(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {active && <p className="text-sm text-mist">{active.blurb}</p>}
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {prompts.map((prompt) => (
          <li key={prompt.id} className="card flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-semibold">{prompt.title}</h3>
              <p className="text-xs text-mist">{prompt.summary}</p>
            </div>
            <dl className="space-y-1 text-xs">
              {Object.entries(prompt.fields).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-semibold uppercase tracking-wide text-mist">{key}</dt>
                  <dd className="whitespace-pre-wrap text-slate-300">{value}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              className="btn btn-primary mt-auto self-start"
              onClick={() => {
                setFields(prompt.fields)
                navigate({ to: '/' })
              }}
            >
              Load into Studio
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
