import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import { AIM_FIELDS, type AimFields } from '~/lib/aim'

export type Provider = 'grok' | 'claude'

export const aimFieldsSchema = z.object({
  actor: z.string(),
  input: z.string(),
  mission: z.string(),
  kiss: z.string(),
  reasoning: z.string(),
  format: z.string(),
  examples: z.string(),
})

export interface ProviderStatus {
  grok: boolean
  claude: boolean
}

export function providerStatus(): ProviderStatus {
  return {
    grok: Boolean(process.env.XAI_API_KEY),
    claude: Boolean(process.env.ANTHROPIC_API_KEY),
  }
}

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

export interface CompletionRequest {
  provider: Provider
  model: string
  system: string
  user: string
  temperature: number
  maxTokens: number
}

const ENHANCE_SYSTEM = `You rebuild messy notes into a structured A.I.M. prompt with seven fields.
Fields and their meaning:
${AIM_FIELDS.map((f) => `- ${f.key}: ${f.hint}`).join('\n')}

Rules:
- Rebuild every field from the capture notes. Existing field values are hints only; the capture wins when they disagree.
- Write each field as text ready to paste into a prompt, in the second person addressed to the model ("You are...", "Produce...").
- Keep fields tight. Leave a field as an empty string only when the notes give nothing for it and nothing sensible can be inferred.
- Never invent facts, figures, names or dates that are not in the notes.`

function enhanceUserMessage(capture: string, current: AimFields): string {
  const existing = AIM_FIELDS.filter((f) => current[f.key].trim())
    .map((f) => `${f.key}: ${current[f.key].trim()}`)
    .join('\n')
  return [
    '# Capture notes',
    capture.trim() || '(empty)',
    '',
    '# Existing field values (hints only)',
    existing || '(none)',
  ].join('\n')
}

// ---------------------------------------------------------------------------
// xAI (Grok)
// ---------------------------------------------------------------------------

interface XaiChatOptions {
  model: string
  system: string
  user: string
  temperature: number
  maxTokens: number
  json?: boolean
}

async function xaiChat(options: XaiChatOptions): Promise<string> {
  const apiKey = process.env.XAI_API_KEY
  if (!apiKey) throw new ProviderError('XAI_API_KEY is not set on the server.')
  const baseUrl = (process.env.XAI_BASE_URL ?? 'https://api.x.ai/v1').replace(/\/$/, '')

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      ...(options.json ? { response_format: { type: 'json_object' } } : {}),
      messages: [
        { role: 'system', content: options.system },
        { role: 'user', content: options.user },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new ProviderError(`xAI request failed (${response.status}): ${body.slice(0, 500)}`, response.status)
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[]
  }
  const content = payload.choices?.[0]?.message?.content
  if (typeof content !== 'string') throw new ProviderError('xAI returned no message content.')
  return content
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : trimmed
  try {
    return JSON.parse(candidate)
  } catch {
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start === -1 || end === -1) throw new ProviderError('Model did not return JSON.')
    return JSON.parse(candidate.slice(start, end + 1))
  }
}

// ---------------------------------------------------------------------------
// Anthropic (Claude)
// ---------------------------------------------------------------------------

function anthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new ProviderError('ANTHROPIC_API_KEY is not set on the server.')
  return new Anthropic()
}

async function claudeComplete(options: Omit<CompletionRequest, 'provider'>): Promise<string> {
  const client = anthropicClient()
  // Streaming keeps long generations clear of HTTP timeouts; finalMessage() collects the result.
  // Server-side fallbacks re-run a refused request on a fallback model inside the same call.
  const message = await client.beta.messages
    .stream({
      model: options.model,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      thinking: { type: 'adaptive' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: options.system,
      messages: [{ role: 'user', content: options.user }],
    })
    .finalMessage()

  if (message.stop_reason === 'refusal') {
    throw new ProviderError('Claude declined this request.')
  }
  return message.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
}

async function claudeEnhance(model: string, capture: string, current: AimFields): Promise<AimFields> {
  const client = anthropicClient()
  const response = await client.messages.parse({
    model,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: ENHANCE_SYSTEM,
    messages: [{ role: 'user', content: enhanceUserMessage(capture, current) }],
    output_config: { format: zodOutputFormat(aimFieldsSchema) },
  })
  if (response.stop_reason === 'refusal') throw new ProviderError('Claude declined this request.')
  if (!response.parsed_output) throw new ProviderError('Claude returned no structured fields.')
  return response.parsed_output
}

// ---------------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------------

export async function complete(request: CompletionRequest): Promise<string> {
  if (request.provider === 'claude') return claudeComplete(request)
  return xaiChat(request)
}

export async function enhance(provider: Provider, model: string, capture: string, current: AimFields): Promise<AimFields> {
  if (provider === 'claude') return claudeEnhance(model, capture, current)
  const raw = await xaiChat({
    model,
    system: `${ENHANCE_SYSTEM}\n\nRespond with a JSON object whose keys are exactly: ${AIM_FIELDS.map((f) => f.key).join(', ')}. Every value is a string.`,
    user: enhanceUserMessage(capture, current),
    temperature: 0.3,
    maxTokens: 4096,
    json: true,
  })
  const parsed = aimFieldsSchema.safeParse(extractJson(raw))
  if (!parsed.success) throw new ProviderError('Grok returned JSON that did not match the seven fields.')
  return parsed.data
}
