'use client'

import { useState } from 'react'
import { insertTodo } from '@/lib/insertTodo'
import { PRIORITY_OPTIONS } from '@/lib/priority'

export default function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState(1)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    try {
      const created = await insertTodo(trimmed, priority)
      if (created) {
        onAdd?.(created)
        setTitle('')
        setPriority(1)
      }
    } catch (error) {
      console.error(error.message)
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="新しいToDoを入力"
        aria-label="新しいToDo"
      />
      <label className="priority-field">
        <span className="sr-only">優先度</span>
        <select
          name="priority"
          value={priority}
          onChange={(event) => setPriority(Number(event.target.value))}
          aria-label="優先度"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">追加</button>
    </form>
  )
}
