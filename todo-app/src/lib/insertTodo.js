import { supabase } from './supabaseClient'
import { normalizePriority } from './priority'

export const insertTodo = async (title, priority = 1) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('ログインしていません')
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([
      {
        title,
        user_id: user.id,
        is_complete: false,
        priority: normalizePriority(priority),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('TODO 追加失敗:', error.message)
    return null
  }

  return data
}
