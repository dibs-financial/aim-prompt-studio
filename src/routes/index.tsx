import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useMemo, useState } from 'react'
import { Field } from '~/components/Field'
import { Notice } from '~/components/Notice'
import { useClipboard } from '~/components/useClipboard'
import { AIM_FIELDS, compilePrompt, isEmpty } from '~/lib/aim'
import { enhanceFields, getProviderStatus, runPrompt } from '~/server/functions'
import { useHistory } from '~/store/history'
import { activeModel, useSettings } from '~/store/settings'
import { useStudio } from '~/store/studio'

export const Route = createFileRoute('/')({
  ssr: false,
  component: StudioPage,
})

function StudioPage() {
  const studio = useStudio()
  const settings = useSettings()
  const addHistory = useHistory((state) => state.add)
  const enhance = useServerFn(enhanceFields)
  const run = useServerFn(runPrompt)
  const status = useServerFn(getProviderStatus)
  const { copied, copy } = useClipboard()
  const [providers, setProviders] = useState<{ grok: boolean; claude: boolean } | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    status()
      .then(setProviders)
      .catch(() => setProviders({ grok: false, claude: false }))
  }, [status])

  const prompt = useMemo(() => compilePrompt(studio.fields), [studio.fields])
  const model = activeModel(settings)
  const providerReady = providers ? providers[settings.provider] : true
  const busy = studio.status !== 'idle'
  const providerLabel = settings.provider === 'claude' ? 'Claude' : 'Grok'

  async function handleEnhance() {
    if (!studio.capture.trim() && isEmpty(studio.fields)) {
      studio.setError('Add some capture notes first.')
      return
    }
    studio.setError(null)
    studio.setStatus('enhancing')
    try {
      const result = await enhance({
        data: { provider: settings.provider, model, capture: studio.capture, current: studio.fields },
      })
      studio.replaceFields(result.fields)
    } catch (error) {
      studio.setError(error instanceof Error ? error.message : 'Enhance failed.')
    } finally {
      studio.setStatus('idle')
    }
  }

  async function handleRun() {
    if (!prompt) {
      studio.setError('Fill at least one field before running.')
      return
    }
    studio.setError(null)
    studio.setStatus('running')
    studio.setOutput('')
    try {
      const result = await run({
        data: {
          provider: settings.provider,
          model,
          fields: studio.fields,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        },
      })
      studio.setOutput(result.output)
    } catch (error) {
      studio.setError(error instanceof Error ? error.message : 'Run failed.')
    } finally {
      studio.setStatus('idle')
    }
  }

  async function handleCopyOutput() {
    if (!studio.output) return
    const ok = await copy(studio.output)
    if (!ok) {
      studio.setError('Clipboard unavailable. Select the output and copy manually.')
      return
    }
    const entry = addHistory({
      provider: settings.provider,
      model,
      fields: studio.fields,
      prompt,
      output: studio.output,
    })
    setLastSaved(entry.id)
    if (settings.clearAfterCopy) studio.clearBoxes()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="space-y-4">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Quick capture</h2>
            <span className="text-xs text-mist">
              {providerLabel} · {model}
            </span>
          </div>
          <textarea
            rows={5}
            value={studio.capture}
            placeholder="Dump messy notes here. Enhance rebuilds the seven fields from this."
            disabled={busy}
            onChange={(event) => studio.setCapture(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={handleEnhance} disabled={busy || !providerReady}>
              {studio.status === 'enhancing' ? 'Enhancing…' : 'AI Enhance'}
            </button>
            <button type="button" className="btn" onClick={() => studio.clearBoxes()} disabled={busy}>
              Clear boxes
            </button>
          </div>
          {providers && !providerReady && (
            <Notice tone="warn">
              {providerLabel} is not configured. Set the API key on the server or switch platform in{' '}
              <Link to="/settings" className="underline">
                Settings
              </Link>
              .
            </Notice>
          )}
        </div>

        <div className="card space-y-3">
          <h2 className="text-sm font-semibold">Seven fields</h2>
          {AIM_FIELDS.map((meta) => (
            <Field
              key={meta.key}
              meta={meta}
              value={studio.fields[meta.key]}
              disabled={busy}
              onChange={(value) => studio.setField(meta.key, value)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Live preview</h2>
            <button type="button" className="btn" onClick={() => copy(prompt)} disabled={!prompt}>
              Copy prompt
            </button>
          </div>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-edge bg-ink p-3 text-xs text-slate-300">
            {prompt || 'The compiled prompt appears here as you fill the fields.'}
          </pre>
          <button type="button" className="btn btn-primary" onClick={handleRun} disabled={busy || !prompt || !providerReady}>
            {studio.status === 'running' ? `Running on ${providerLabel}…` : `Run on ${providerLabel}`}
          </button>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Output</h2>
            <button type="button" className="btn btn-primary" onClick={handleCopyOutput} disabled={!studio.output || busy}>
              {copied ? 'Copied' : settings.clearAfterCopy ? 'Copy → History & clear' : 'Copy → History'}
            </button>
          </div>
          <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-edge bg-ink p-3 text-sm text-slate-100">
            {studio.output || 'Run the prompt to see the model output.'}
          </pre>
          {lastSaved && !studio.output && (
            <Notice tone="ok">
              Saved to{' '}
              <Link to="/history" className="underline">
                History
              </Link>
              .
            </Notice>
          )}
        </div>

        {studio.error && <Notice tone="error">{studio.error}</Notice>}
      </section>
    </div>
  )
}
