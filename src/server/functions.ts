import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { compilePrompt } from '~/lib/aim'
import { aimFieldsSchema, complete, enhance, providerStatus, ProviderError } from './providers'

const providerSchema = z.enum(['grok', 'claude'])

function guardProvider(provider: 'grok' | 'claude') {
  const status = providerStatus()
  if (!status[provider]) {
    const key = provider === 'claude' ? 'ANTHROPIC_API_KEY' : 'XAI_API_KEY'
    throw new Error(`${provider === 'claude' ? 'Claude' : 'Grok'} is not configured: set ${key} on the server.`)
  }
}

function describe(error: unknown): never {
  if (error instanceof ProviderError) throw new Error(error.message)
  if (error instanceof Error) throw new Error(error.message)
  throw new Error('Unknown provider error.')
}

export const getProviderStatus = createServerFn({ method: 'GET' }).handler(async () => providerStatus())

export const enhanceFields = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      provider: providerSchema,
      model: z.string().min(1),
      capture: z.string(),
      current: aimFieldsSchema,
    }),
  )
  .handler(async ({ data }) => {
    guardProvider(data.provider)
    try {
      const fields = await enhance(data.provider, data.model, data.capture, data.current)
      return { fields }
    } catch (error) {
      describe(error)
    }
  })

export const runPrompt = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      provider: providerSchema,
      model: z.string().min(1),
      fields: aimFieldsSchema,
      temperature: z.number().min(0).max(2),
      maxTokens: z.number().int().min(256).max(64000),
    }),
  )
  .handler(async ({ data }) => {
    guardProvider(data.provider)
    const prompt = compilePrompt(data.fields)
    if (!prompt) throw new Error('Nothing to run: every field is empty.')
    try {
      const output = await complete({
        provider: data.provider,
        model: data.model,
        system:
          'Follow the structured prompt exactly. Treat each section heading as an instruction about that aspect of the task.',
        user: prompt,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
      })
      return { prompt, output }
    } catch (error) {
      describe(error)
    }
  })
