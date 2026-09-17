import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import { Notice } from '~/components/Notice'
import { authClient } from '~/lib/auth-client'
import { getProviderStatus } from '~/server/functions'
import { CLAUDE_MODELS, GROK_MODELS, useSettings } from '~/store/settings'

export const Route = createFileRoute('/settings')({
  ssr: false,
  component: SettingsPage,
})

function SettingsPage() {
  const settings = useSettings()
  const status = useServerFn(getProviderStatus)
  const [providers, setProviders] = useState<{ grok: boolean; claude: boolean } | null>(null)

  useEffect(() => {
    status()
      .then(setProviders)
      .catch(() => setProviders({ grok: false, claude: false }))
  }, [status])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card space-y-4">
        <h2 className="text-sm font-semibold">Platform</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`btn ${settings.provider === 'grok' ? 'btn-primary' : ''}`}
            onClick={() => settings.setProvider('grok')}
          >
            Grok (xAI) {providers && (providers.grok ? '· ready' : '· no key')}
          </button>
          <button
            type="button"
            className={`btn ${settings.provider === 'claude' ? 'btn-primary' : ''}`}
            onClick={() => settings.setProvider('claude')}
            disabled={providers ? !providers.claude : false}
          >
            Claude {providers && (providers.claude ? '· ready' : '· no key')}
          </button>
        </div>
        {providers && !providers.claude && (
          <Notice tone="info">Claude unlocks when ANTHROPIC_API_KEY is injected on the server.</Notice>
        )}
        {providers && !providers.grok && (
          <Notice tone="warn">Set XAI_API_KEY in .env to run on Grok.</Notice>
        )}

        <ModelPicker
          label="Grok model"
          value={settings.grokModel}
          options={GROK_MODELS}
          onChange={settings.setGrokModel}
        />
        <ModelPicker
          label="Claude model"
          value={settings.claudeModel}
          options={CLAUDE_MODELS}
          onChange={settings.setClaudeModel}
        />

        <label className="block">
          <span className="label">Temperature: {settings.temperature.toFixed(2)}</span>
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.05}
            value={settings.temperature}
            onChange={(event) => settings.setTemperature(Number(event.target.value))}
          />
        </label>
        <label className="block">
          <span className="label">Max output tokens</span>
          <input
            type="number"
            min={256}
            max={64000}
            step={256}
            value={settings.maxTokens}
            onChange={(event) => settings.setMaxTokens(Number(event.target.value) || 256)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="w-auto"
            checked={settings.clearAfterCopy}
            onChange={(event) => settings.setClearAfterCopy(event.target.checked)}
          />
          Clear the boxes after copying output to History
        </label>
      </section>

      <AccountPanel />
    </div>
  )
}

function ModelPicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const custom = !options.includes(value)
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      <select value={custom ? '__custom' : value} onChange={(event) => onChange(event.target.value === '__custom' ? '' : event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value="__custom">Custom…</option>
      </select>
      {custom && <input value={value} placeholder="model id" onChange={(event) => onChange(event.target.value)} />}
    </div>
  )
}

function AccountPanel() {
  const session = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function signIn() {
    setPending(true)
    setMessage(null)
    const result = await authClient.signIn.email({ email, password })
    setMessage(result.error ? result.error.message ?? 'Sign-in failed.' : null)
    setPending(false)
  }

  async function signUp() {
    setPending(true)
    setMessage(null)
    const result = await authClient.signUp.email({ email, password, name: name || email })
    setMessage(result.error ? result.error.message ?? 'Sign-up failed.' : null)
    setPending(false)
  }

  return (
    <section className="card space-y-3">
      <h2 className="text-sm font-semibold">Account</h2>
      <p className="text-xs text-mist">
        Optional in this preview: models are open. Accounts live in server memory and reset on restart; Stripe comes
        later.
      </p>
      {session.data?.user ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <span>Signed in as {session.data.user.email}</span>
          <button type="button" className="btn" onClick={() => authClient.signOut()}>
            Sign out
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input value={name} placeholder="Name (sign-up only)" onChange={(event) => setName(event.target.value)} />
          <input type="email" value={email} placeholder="Email" onChange={(event) => setEmail(event.target.value)} />
          <input
            type="password"
            value={password}
            placeholder="Password (8+ characters)"
            onChange={(event) => setPassword(event.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={signIn} disabled={pending || !email || !password}>
              Sign in
            </button>
            <button type="button" className="btn" onClick={signUp} disabled={pending || !email || password.length < 8}>
              Create account
            </button>
          </div>
          {message && <Notice tone="error">{message}</Notice>}
        </div>
      )}
    </section>
  )
}
