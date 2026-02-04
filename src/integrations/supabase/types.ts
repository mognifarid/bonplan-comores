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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          boost: string | null
          boost_expires_at: string | null
          category: string
          city: string | null
          created_at: string
          description: string
          id: string
          images: string[] | null
          is_premium: boolean
          island: string
          phone_number: string | null
          price: number
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          room_count: string | null
          status: string
          subcategory: string | null
          title: string
          updated_at: string
          user_id: string
          vehicle_brand: string | null
          vehicle_mileage: string | null
          vehicle_year: string | null
          views: number
        }
        Insert: {
          boost?: string | null
          boost_expires_at?: string | null
          category: string
          city?: string | null
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          is_premium?: boolean
          island: string
          phone_number?: string | null
          price?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room_count?: string | null
          status?: string
          subcategory?: string | null
          title: string
          updated_at?: string
          user_id: string
          vehicle_brand?: string | null
          vehicle_mileage?: string | null
          vehicle_year?: string | null
          views?: number
        }
        Update: {
          boost?: string | null
          boost_expires_at?: string | null
          category?: string
          city?: string | null
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          is_premium?: boolean
          island?: string
          phone_number?: string | null
          price?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room_count?: string | null
          status?: string
          subcategory?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          vehicle_brand?: string | null
          vehicle_mileage?: string | null
          vehicle_year?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "ads_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ads_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          ad_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          user_id: string | null
        }
        Insert: {
          ad_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          user_id?: string | null
        }
        Update: {
          ad_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads_public"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_ads: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_ads_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_ads_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ads_public: {
        Row: {
          boost: string | null
          boost_expires_at: string | null
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          id: string | null
          images: string[] | null
          is_premium: boolean | null
          island: string | null
          price: number | null
          room_count: string | null
          status: string | null
          subcategory: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_brand: string | null
          vehicle_mileage: string | null
          vehicle_year: string | null
          views: number | null
        }
        Insert: {
          boost?: string | null
          boost_expires_at?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          is_premium?: boolean | null
          island?: string | null
          price?: number | null
          room_count?: string | null
          status?: string | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_brand?: string | null
          vehicle_mileage?: string | null
          vehicle_year?: string | null
          views?: number | null
        }
        Update: {
          boost?: string | null
          boost_expires_at?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          is_premium?: boolean | null
          island?: string | null
          price?: number | null
          room_count?: string | null
          status?: string | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_brand?: string | null
          vehicle_mileage?: string | null
          vehicle_year?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ads_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_set_boost: {
        Args: { p_ad_id: string; p_boost: string; p_expires_at: string }
        Returns: undefined
      }
      get_ad_phone_number: { Args: { ad_id: string }; Returns: string }
      get_admin_stats: { Args: never; Returns: Json }
      get_public_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_has_approved_ads: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
