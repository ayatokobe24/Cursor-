import { supabase } from './supabaseClient'

/**
 * id を受け取り、todos テーブルの該当行を削除する
 * 成功すると true、失敗すると false を返す
 */
export const deleteTodo = async (id) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('TODO の削除に失敗しました:', error.message)
    return false
  }

  return true
}
