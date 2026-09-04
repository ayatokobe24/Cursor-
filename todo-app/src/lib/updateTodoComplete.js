import { supabase } from './supabaseClient'

/**
 * id と完了状態を受け取り、todos.is_complete を更新する
 */
export const updateTodoComplete = async (id, isComplete) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('todos')
    .update({ is_complete: isComplete })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('TODO の完了状態の更新に失敗しました:', error.message)
    return null
  }

  return data
}
