import { supabase } from './supabaseClient'

/**
 * id と更新後の title を受け取り、todos テーブルの該当行の title を更新する
 * 成功すると更新されたレコード（1 行）を返す
 */
export const updateTodo = async (id, title) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('todos')
    .update({ title })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('TODO の更新に失敗しました:', error.message)
    return null
  }

  return data
}
