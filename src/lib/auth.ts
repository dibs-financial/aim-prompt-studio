import { betterAuth } from 'better-auth'
import { memoryAdapter } from 'better-auth/adapters/memory'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

// Preview wiring: users live in process memory and reset on restart.
// Swap memoryAdapter for a database adapter before enabling paid tiers.
const db: Record<string, unknown[]> = { user: [], session: [], account: [], verification: [] }

export const auth = betterAuth({
  database: memoryAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET || 'aim-prompt-studio-preview-secret-change-me',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  emailAndPassword: { enabled: true },
  plugins: [tanstackStartCookies()],
})
