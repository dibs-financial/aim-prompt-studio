interface NoticeProps {
  tone: 'error' | 'warn' | 'ok' | 'info'
  children: React.ReactNode
}

const TONE: Record<NoticeProps['tone'], string> = {
  error: 'border-red-500/50 bg-red-500/10 text-red-200',
  warn: 'border-warn/50 bg-warn/10 text-amber-100',
  ok: 'border-ok/50 bg-ok/10 text-green-100',
  info: 'border-edge bg-panel text-mist',
}

export function Notice({ tone, children }: NoticeProps) {
  return <div className={`rounded-md border px-3 py-2 text-sm ${TONE[tone]}`}>{children}</div>
}
