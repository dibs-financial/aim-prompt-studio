import type { AimFieldMeta } from '~/lib/aim'

interface FieldProps {
  meta: AimFieldMeta
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function Field({ meta, value, onChange, disabled }: FieldProps) {
  return (
    <div>
      <label htmlFor={`field-${meta.key}`} className="label">
        {meta.label}
      </label>
      <textarea
        id={`field-${meta.key}`}
        rows={meta.rows}
        value={value}
        placeholder={meta.hint}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
