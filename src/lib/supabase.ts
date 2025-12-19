import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Contact, Task, VoiceLog, Note } from './database.types'

let supabaseInstance: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export { getSupabase }

// Legacy export for compatibility - lazily initialized
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop]
  }
})

// Helper functions for contacts
export async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Contact[]
}

export async function createContact(contact: Partial<Contact>): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)
    .select()
    .single()

  if (error) throw error
  return data as Contact
}

export async function updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .update(contact)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Contact
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Helper functions for tasks
export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data as Task[]
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function completeTask(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ is_completed: true, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Helper functions for voice logs
export async function fetchVoiceLogs(limit = 50): Promise<VoiceLog[]> {
  const { data, error } = await supabase
    .from('voice_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as VoiceLog[]
}

// Helper functions for notes
export async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as Note[]
}

export async function createNote(note: Partial<Note>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single()

  if (error) throw error
  return data as Note
}

export async function updateNote(id: string, note: Partial<Note>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...note, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Note
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function toggleNotePin(id: string, isPinned: boolean): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Note
}

// Dashboard stats
export async function fetchDashboardStats() {
  const [contactsResult, tasksResult, voiceLogsResult] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*'),
    supabase.from('voice_logs').select('*', { count: 'exact', head: true }),
  ])

  const tasks = (tasksResult.data || []) as Task[]
  const pendingTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)
  const overdueTasks = pendingTasks.filter(t => t.due_date && new Date(t.due_date) < new Date())

  return {
    totalContacts: contactsResult.count || 0,
    totalTasks: tasks.length,
    pendingTasks: pendingTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    totalVoiceInteractions: voiceLogsResult.count || 0,
  }
}
