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
      category_trends: {
        Row: {
          category: string
          demand: string | null
          hot_items: string | null
          id: string
          region: string | null
          trend_score: number | null
          updated_at: string
        }
        Insert: {
          category: string
          demand?: string | null
          hot_items?: string | null
          id?: string
          region?: string | null
          trend_score?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          demand?: string | null
          hot_items?: string | null
          id?: string
          region?: string | null
          trend_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          currency: string | null
          display_name: string | null
          id: string
          region: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          display_name?: string | null
          id: string
          region?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          display_name?: string | null
          id?: string
          region?: string | null
        }
        Relationships: []
      }
      scans: {
        Row: {
          best_for_fast_sale: string | null
          best_for_highest_price: string | null
          brand: string | null
          category: string | null
          condition_note: string | null
          confidence: number | null
          created_at: string
          currency: string | null
          demand: string | null
          est_fees: number | null
          est_profit: number | null
          explanation: string | null
          id: string
          image_url: string | null
          item_name: string | null
          notes: string | null
          price_high: number | null
          price_low: number | null
          recommendation: string | null
          recommended_marketplace: string | null
          region: string | null
          saved: boolean | null
          scam_risk: string | null
          sold: boolean | null
          sold_at: string | null
          sold_price: number | null
          time_to_sell: string | null
          underpriced_alert: boolean | null
          user_cost: number | null
          user_id: string
          watchlisted: boolean | null
        }
        Insert: {
          best_for_fast_sale?: string | null
          best_for_highest_price?: string | null
          brand?: string | null
          category?: string | null
          condition_note?: string | null
          confidence?: number | null
          created_at?: string
          currency?: string | null
          demand?: string | null
          est_fees?: number | null
          est_profit?: number | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          item_name?: string | null
          notes?: string | null
          price_high?: number | null
          price_low?: number | null
          recommendation?: string | null
          recommended_marketplace?: string | null
          region?: string | null
          saved?: boolean | null
          scam_risk?: string | null
          sold?: boolean | null
          sold_at?: string | null
          sold_price?: number | null
          time_to_sell?: string | null
          underpriced_alert?: boolean | null
          user_cost?: number | null
          user_id: string
          watchlisted?: boolean | null
        }
        Update: {
          best_for_fast_sale?: string | null
          best_for_highest_price?: string | null
          brand?: string | null
          category?: string | null
          condition_note?: string | null
          confidence?: number | null
          created_at?: string
          currency?: string | null
          demand?: string | null
          est_fees?: number | null
          est_profit?: number | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          item_name?: string | null
          notes?: string | null
          price_high?: number | null
          price_low?: number | null
          recommendation?: string | null
          recommended_marketplace?: string | null
          region?: string | null
          saved?: boolean | null
          scam_risk?: string | null
          sold?: boolean | null
          sold_at?: string | null
          sold_price?: number | null
          time_to_sell?: string | null
          underpriced_alert?: boolean | null
          user_cost?: number | null
          user_id?: string
          watchlisted?: boolean | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
