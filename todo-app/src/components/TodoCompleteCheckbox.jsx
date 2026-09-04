'use client'

export default function TodoCompleteCheckbox({ checked, disabled, onChange, label }) {
  return (
    <label className={checked ? 'todo-complete is-checked' : 'todo-complete'}>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
      />
      <span className="todo-complete-box" aria-hidden="true">
        {checked ? '済' : ''}
      </span>
    </label>
  )
}
