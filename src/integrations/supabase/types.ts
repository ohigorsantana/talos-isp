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
      api_keys: {
        Row: {
          active: boolean
          created_at: string
          id: string
          key_hash: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          key_hash: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          key_hash?: string
          name?: string
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          created_at: string
          duration_ms: number
          endpoint: string
          error: string | null
          id: string
          method: string
          request_body: Json | null
          response_body: Json | null
          status_code: number
        }
        Insert: {
          created_at?: string
          duration_ms?: number
          endpoint: string
          error?: string | null
          id?: string
          method: string
          request_body?: Json | null
          response_body?: Json | null
          status_code: number
        }
        Update: {
          created_at?: string
          duration_ms?: number
          endpoint?: string
          error?: string | null
          id?: string
          method?: string
          request_body?: Json | null
          response_body?: Json | null
          status_code?: number
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          client_hash: string
          request_count: number
          window_start: string
        }
        Insert: {
          client_hash: string
          request_count?: number
          window_start: string
        }
        Update: {
          client_hash?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          city: string
          created_at: string
          document: string | null
          id: string
          name: string
          state: string
          status: string
        }
        Insert: {
          city: string
          created_at?: string
          document?: string | null
          id?: string
          name: string
          state: string
          status?: string
        }
        Update: {
          city?: string
          created_at?: string
          document?: string | null
          id?: string
          name?: string
          state?: string
          status?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          created_at: string
          customer_id: string
          due_day: number
          external_id: string
          id: string
          installation_date: string | null
          monthly_price: number
          plan_id: string
          status: Database["public"]["Enums"]["contract_status"]
        }
        Insert: {
          created_at?: string
          customer_id: string
          due_day?: number
          external_id?: string
          id?: string
          installation_date?: string | null
          monthly_price: number
          plan_id: string
          status?: Database["public"]["Enums"]["contract_status"]
        }
        Update: {
          created_at?: string
          customer_id?: string
          due_day?: number
          external_id?: string
          id?: string
          installation_date?: string | null
          monthly_price?: number
          plan_id?: string
          status?: Database["public"]["Enums"]["contract_status"]
        }
        Relationships: [
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      coverage: {
        Row: {
          available_plans: Json
          cep: string
          city: string
          covered: boolean
          created_at: string
          id: string
          neighborhood: string
          state: string
        }
        Insert: {
          available_plans?: Json
          cep: string
          city: string
          covered?: boolean
          created_at?: string
          id?: string
          neighborhood: string
          state: string
        }
        Update: {
          available_plans?: Json
          cep?: string
          city?: string
          covered?: boolean
          created_at?: string
          id?: string
          neighborhood?: string
          state?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          external_id: string
          id: string
          name: string
          neighborhood: string | null
          number: string | null
          phone: string | null
          source: string
          state: string | null
          status: Database["public"]["Enums"]["customer_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          external_id?: string
          id?: string
          name: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          source?: string
          state?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          external_id?: string
          id?: string
          name?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          source?: string
          state?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          boleto_url: string | null
          contract_id: string
          created_at: string
          customer_id: string
          due_date: string
          external_id: string
          id: string
          paid_at: string | null
          pix_code: string | null
          pix_qr_code: string | null
          status: Database["public"]["Enums"]["invoice_status"]
        }
        Insert: {
          amount: number
          boleto_url?: string | null
          contract_id: string
          created_at?: string
          customer_id: string
          due_date: string
          external_id?: string
          id?: string
          paid_at?: string | null
          pix_code?: string | null
          pix_qr_code?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Update: {
          amount?: number
          boleto_url?: string | null
          contract_id?: string
          created_at?: string
          customer_id?: string
          due_date?: string
          external_id?: string
          id?: string
          paid_at?: string | null
          pix_code?: string | null
          pix_qr_code?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_settings: {
        Row: {
          erp_online: boolean
          id: boolean
          updated_at: string
        }
        Insert: {
          erp_online?: boolean
          id?: boolean
          updated_at?: string
        }
        Update: {
          erp_online?: boolean
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          download_mbps: number
          external_id: string
          id: string
          monthly_price: number
          name: string
          upload_mbps: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          download_mbps: number
          external_id: string
          id?: string
          monthly_price: number
          name: string
          upload_mbps: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          download_mbps?: number
          external_id?: string
          id?: string
          monthly_price?: number
          name?: string
          upload_mbps?: number
        }
        Relationships: []
      }
      tickets: {
        Row: {
          category: Database["public"]["Enums"]["ticket_category"]
          created_at: string
          customer_id: string
          description: string
          external_id: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          protocol: string
          status: Database["public"]["Enums"]["ticket_status"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          customer_id: string
          description: string
          external_id?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          protocol?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          customer_id?: string
          description?: string
          external_id?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          protocol?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          result: Json | null
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean
          result?: Json | null
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          result?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_mock_sale: {
        Args: {
          p_cep: string
          p_city: string
          p_cpf: string
          p_idempotency_key?: string
          p_name: string
          p_neighborhood: string
          p_phone: string
          p_plan_external_id: string
          p_source: string
        }
        Returns: Json
      }
    }
    Enums: {
      contract_status: "active" | "pending" | "suspended" | "cancelled"
      customer_status:
        | "active"
        | "inactive"
        | "suspended"
        | "cancelled"
        | "prospect"
      invoice_status: "open" | "paid" | "overdue" | "cancelled"
      ticket_category:
        | "technical"
        | "financial"
        | "commercial"
        | "installation"
        | "cancellation"
        | "other"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      contract_status: ["active", "pending", "suspended", "cancelled"],
      customer_status: [
        "active",
        "inactive",
        "suspended",
        "cancelled",
        "prospect",
      ],
      invoice_status: ["open", "paid", "overdue", "cancelled"],
      ticket_category: [
        "technical",
        "financial",
        "commercial",
        "installation",
        "cancellation",
        "other",
      ],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "cancelled"],
    },
  },
} as const
