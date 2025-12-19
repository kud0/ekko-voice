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
      contact_enrichments: {
        Row: {
          id: string
          contact_id: string
          linkedin_url: string | null
          linkedin_headline: string | null
          linkedin_summary: string | null
          company_description: string | null
          company_industry: string | null
          company_size: string | null
          company_website: string | null
          company_funding_stage: string | null
          twitter_url: string | null
          github_url: string | null
          recent_news: any | null
          enrichment_status: string
          last_enriched_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          linkedin_url?: string | null
          linkedin_headline?: string | null
          linkedin_summary?: string | null
          company_description?: string | null
          company_industry?: string | null
          company_size?: string | null
          company_website?: string | null
          company_funding_stage?: string | null
          twitter_url?: string | null
          github_url?: string | null
          recent_news?: any | null
          enrichment_status?: string
          last_enriched_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          linkedin_url?: string | null
          linkedin_headline?: string | null
          linkedin_summary?: string | null
          company_description?: string | null
          company_industry?: string | null
          company_size?: string | null
          company_website?: string | null
          company_funding_stage?: string | null
          twitter_url?: string | null
          github_url?: string | null
          recent_news?: any | null
          enrichment_status?: string
          last_enriched_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      smart_actions: {
        Row: {
          id: string
          contact_id: string
          action_type: string
          action_title: string
          action_description: string | null
          priority: string
          status: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          action_type: string
          action_title: string
          action_description?: string | null
          priority?: string
          status?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          action_type?: string
          action_title?: string
          action_description?: string | null
          priority?: string
          status?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_interactions: {
        Row: {
          id: string
          contact_id: string
          interaction_type: string
          interaction_date: string
          description: string | null
          sentiment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          interaction_type: string
          interaction_date: string
          description?: string | null
          sentiment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          interaction_type?: string
          interaction_date?: string
          description?: string | null
          sentiment?: string | null
          created_at?: string
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
export type ContactEnrichment = Database['public']['Tables']['contact_enrichments']['Row']
export type SmartAction = Database['public']['Tables']['smart_actions']['Row']
export type ContactInteraction = Database['public']['Tables']['contact_interactions']['Row']
