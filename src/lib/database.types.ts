export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          first_name: string
          last_name: string
          company: string | null
          role: string | null
          email: string | null
          phone: string | null
          linkedin: string | null
          notes: string | null
          tags: string[]
          avatar_color: string
          last_contact_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          company?: string | null
          role?: string | null
          email?: string | null
          phone?: string | null
          linkedin?: string | null
          notes?: string | null
          tags?: string[]
          avatar_color?: string
          last_contact_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          company?: string | null
          role?: string | null
          email?: string | null
          phone?: string | null
          linkedin?: string | null
          notes?: string | null
          tags?: string[]
          avatar_color?: string
          last_contact_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          due_date: string | null
          priority: string
          category: string
          is_completed: boolean
          related_contact_id: string | null
          related_contact_name: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          due_date?: string | null
          priority?: string
          category?: string
          is_completed?: boolean
          related_contact_id?: string | null
          related_contact_name?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: string
          category?: string
          is_completed?: boolean
          related_contact_id?: string | null
          related_contact_name?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      voice_logs: {
        Row: {
          id: string
          transcription: string
          intent: string
          ai_response: string
          created_at: string
        }
        Insert: {
          id?: string
          transcription: string
          intent: string
          ai_response: string
          created_at?: string
        }
        Update: {
          id?: string
          transcription?: string
          intent?: string
          ai_response?: string
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string
          color: string
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          color?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          color?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Convenience types
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type VoiceLog = Database['public']['Tables']['voice_logs']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
