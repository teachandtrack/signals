export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changed_at: string
          changed_by: number | null
          details: string | null
          id: number
          record_id: number
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: number | null
          details?: string | null
          id?: number
          record_id: number
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: number | null
          details?: string | null
          id?: number
          record_id?: number
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          sector: string | null
          sub_sector: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          sector?: string | null
          sub_sector?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          sector?: string | null
          sub_sector?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      paper_trades: {
        Row: {
          closed_at: string | null
          created_at: string
          direction: string
          entry_price: number | null
          exit_price: number | null
          id: number
          is_open: boolean | null
          outcome_pct: number | null
          position_size_pct: number | null
          review_id: number
          ticker_symbol: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          direction: string
          entry_price?: number | null
          exit_price?: number | null
          id?: number
          is_open?: boolean | null
          outcome_pct?: number | null
          position_size_pct?: number | null
          review_id: number
          ticker_symbol: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          direction?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: number
          is_open?: boolean | null
          outcome_pct?: number | null
          position_size_pct?: number | null
          review_id?: number
          ticker_symbol?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paper_trades_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_documents: {
        Row: {
          compliance_status:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          content: string | null
          content_hash: string
          created_at: string
          id: number
          published_at: string | null
          source_id: number
          title: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          content?: string | null
          content_hash: string
          created_at?: string
          id?: number
          published_at?: string | null
          source_id: number
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          content?: string | null
          content_hash?: string
          created_at?: string
          id?: number
          published_at?: string | null
          source_id?: number
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_documents_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          decision: string | null
          id: number
          notes: string | null
          reviewer_id: number
          signal_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision?: string | null
          id?: number
          notes?: string | null
          reviewer_id: number
          signal_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision?: string | null
          id?: number
          notes?: string | null
          reviewer_id?: number
          signal_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_sources: {
        Row: {
          document_id: number
          id: number
          signal_id: number
        }
        Insert: {
          document_id: number
          id?: number
          signal_id: number
        }
        Update: {
          document_id?: number
          id?: number
          signal_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "signal_sources_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "raw_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_sources_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_tickers: {
        Row: {
          company_id: number
          direction: string | null
          id: number
          signal_id: number
        }
        Insert: {
          company_id: number
          direction?: string | null
          id?: number
          signal_id: number
        }
        Update: {
          company_id?: number
          direction?: string | null
          id?: number
          signal_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "signal_tickers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_tickers_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          compliance_status:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at: string
          expires_at: string | null
          id: number
          llm_bear_case: string | null
          llm_bull_case: string | null
          score_evidence: number | null
          score_novelty: number | null
          score_relevance: number | null
          score_safety: number | null
          score_timing: number | null
          score_total: number | null
          score_tradability: number | null
          sentiment: string | null
          status: Database["public"]["Enums"]["signal_status"] | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at?: string
          expires_at?: string | null
          id?: number
          llm_bear_case?: string | null
          llm_bull_case?: string | null
          score_evidence?: number | null
          score_novelty?: number | null
          score_relevance?: number | null
          score_safety?: number | null
          score_timing?: number | null
          score_total?: number | null
          score_tradability?: number | null
          sentiment?: string | null
          status?: Database["public"]["Enums"]["signal_status"] | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          compliance_status?:
            | Database["public"]["Enums"]["compliance_status"]
            | null
          created_at?: string
          expires_at?: string | null
          id?: number
          llm_bear_case?: string | null
          llm_bull_case?: string | null
          score_evidence?: number | null
          score_novelty?: number | null
          score_relevance?: number | null
          score_safety?: number | null
          score_timing?: number | null
          score_total?: number | null
          score_tradability?: number | null
          sentiment?: string | null
          status?: Database["public"]["Enums"]["signal_status"] | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string
          credibility_score: number | null
          id: number
          is_active: boolean | null
          name: string
          source_type: Database["public"]["Enums"]["source_type"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          credibility_score?: number | null
          id?: number
          is_active?: boolean | null
          name: string
          source_type: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          credibility_score?: number | null
          id?: number
          is_active?: boolean | null
          name?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      tickers: {
        Row: {
          company_id: number
          created_at: string
          exchange: string | null
          id: number
          symbol: string
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          exchange?: string | null
          id?: number
          symbol: string
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          exchange?: string | null
          id?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          hashed_password: string
          id: number
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          hashed_password: string
          id?: number
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          hashed_password?: string
          id?: number
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      compliance_status: "green" | "amber" | "red"
      signal_status:
        | "pending"
        | "reviewed"
        | "actioned"
        | "dismissed"
        | "expired"
      source_type:
        | "rss"
        | "sec_filing"
        | "press_release"
        | "regulatory"
        | "news"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      compliance_status: ["green", "amber", "red"],
      signal_status: [
        "pending",
        "reviewed",
        "actioned",
        "dismissed",
        "expired",
      ],
      source_type: ["rss", "sec_filing", "press_release", "regulatory", "news"],
    },
  },
} as const
