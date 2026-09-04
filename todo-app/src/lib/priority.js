export const PRIORITY_OPTIONS = [
  { value: 1, label: '低' },
  { value: 2, label: '中' },
  { value: 3, label: '高' },
]

export function normalizePriority(value) {
  const numeric = Number(value)
  if (numeric === 2 || numeric === 3) return numeric
  return 1
}

export function priorityLabel(value) {
  const priority = normalizePriority(value)
  return PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? '低'
}

export function sortTodosByPriority(todos, direction) {
  const sign = direction === 'low' ? 1 : -1
  return [...todos].sort((left, right) => {
    const byPriority =
      (normalizePriority(left.priority) - normalizePriority(right.priority)) * sign
    if (byPriority !== 0) return byPriority
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })
}
