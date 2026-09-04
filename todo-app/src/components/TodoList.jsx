'use client'

import { useEffect, useState } from 'react'
import { fetchTodos } from '@/lib/fetchTodos'
import { sortTodosByPriority } from '@/lib/priority'
import TodoFilter from '@/components/TodoFilter'
import TodoItem from '@/components/TodoItem'

function isComplete(todo) {
  return Boolean(todo.is_complete)
}

/**
 * 一覧取得と再取得ロジックをカプセル化
 */
export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [prioritySort, setPrioritySort] = useState('high')

  const loadTodos = async () => {
    const data = await fetchTodos()
    setTodos(data)
  }

  useEffect(() => {
    loadTodos()
  }, [])

  const visible = sortTodosByPriority(
    todos.filter((todo) => {
      if (filter === 'active') return !isComplete(todo)
      if (filter === 'completed') return isComplete(todo)
      return true
    }),
    prioritySort,
  )
  const remaining = todos.filter((todo) => !isComplete(todo)).length

  return (
    <>
      <div className="toolbar">
        <span>未完了 {remaining}</span>
        <div className="toolbar-controls">
          <label className="sort-field">
            優先度順
            <select
              value={prioritySort}
              onChange={(event) => setPrioritySort(event.target.value)}
              aria-label="優先度でソート"
            >
              <option value="high">高い順</option>
              <option value="low">低い順</option>
            </select>
          </label>
          <TodoFilter value={filter} onChange={setFilter} />
        </div>
      </div>
      <ul className="list">
        {visible.length === 0 ? (
          <li className="empty">ToDoはありません。</li>
        ) : (
          visible.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onRefresh={loadTodos} />
          ))
        )}
      </ul>
    </>
  )
}
