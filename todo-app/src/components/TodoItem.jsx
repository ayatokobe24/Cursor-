'use client'

import { useState } from 'react'
import { updateTodo } from '@/lib/updateTodo'
import { updateTodoComplete } from '@/lib/updateTodoComplete'
import { deleteTodo } from '@/lib/deleteTodo'
import ConfirmDialog from '@/components/ConfirmDialog'
import TodoCompleteCheckbox from '@/components/TodoCompleteCheckbox'
import { normalizePriority, priorityLabel } from '@/lib/priority'

export default function TodoItem({ todo, onRefresh }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [loading, setLoading] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const isComplete = Boolean(todo.is_complete)
  const priority = normalizePriority(todo.priority)

  const handleToggleComplete = async (nextComplete) => {
    setLoading(true)
    const updated = await updateTodoComplete(todo.id, nextComplete)
    setLoading(false)
    if (updated) {
      onRefresh()
    }
  }

  const handleUpdate = async () => {
    if (!title.trim()) return
    if (!confirm('この TODO を更新しますか？')) return

    setLoading(true)
    const updated = await updateTodo(todo.id, title.trim())
    setLoading(false)
    if (updated) {
      setEditing(false)
      onRefresh()
    }
  }

  const handleDeleteClick = () => {
    setConfirmingDelete(true)
  }

  const handleDeleteCancel = () => {
    if (loading) return
    setConfirmingDelete(false)
  }

  const handleDeleteConfirm = async () => {
    setLoading(true)
    const deleted = await deleteTodo(todo.id)
    setLoading(false)
    setConfirmingDelete(false)
    if (deleted) {
      onRefresh()
    }
  }

  return (
    <li className={isComplete ? 'quest todo-row is-cleared' : 'quest todo-row'}>
      <TodoCompleteCheckbox
        checked={isComplete}
        disabled={loading}
        onChange={handleToggleComplete}
        label={isComplete ? `${todo.title}を未完了に戻す` : `${todo.title}を完了する`}
      />
      <div className="quest-body">
        {editing ? (
          <input
            className="title-edit"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={loading}
            aria-label="ToDoタイトル"
          />
        ) : (
          <span className="title-row">
            <span className="title">{todo.title}</span>
            <span className={`priority-badge priority-${priority}`}>
              優先度 {priorityLabel(priority)}
            </span>
          </span>
        )}
      </div>
      <div className="todo-actions">
        {editing ? (
          <>
            <button type="button" onClick={handleUpdate} disabled={loading}>
              保存
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={loading}>
              キャンセル
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} disabled={loading}>
              編集
            </button>
            <button type="button" className="abandon" onClick={handleDeleteClick} disabled={loading}>
              削除
            </button>
          </>
        )}
      </div>
      <ConfirmDialog
        open={confirmingDelete}
        message="この TODO を削除しますか？"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={loading}
      />
    </li>
  )
}
