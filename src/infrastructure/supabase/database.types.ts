export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  api: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      published_product_details: {
        Row: {
          audience: string | null
          brand: string | null
          color: string | null
          condition_notes: string | null
          condition_rating: number | null
          description: string | null
          garment_type: string | null
          material_details: string | null
          measurements: Json | null
          price: string | null
          size_label: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          audience?: string | null
          brand?: string | null
          color?: string | null
          condition_notes?: string | null
          condition_rating?: number | null
          description?: string | null
          garment_type?: string | null
          material_details?: string | null
          measurements?: Json | null
          price?: never
          size_label?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          audience?: string | null
          brand?: string | null
          color?: string | null
          condition_notes?: string | null
          condition_rating?: number | null
          description?: string | null
          garment_type?: string | null
          material_details?: string | null
          measurements?: Json | null
          price?: never
          size_label?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      published_product_images: {
        Row: {
          alt_text: string | null
          height: number | null
          image_id: string | null
          position: number | null
          product_slug: string | null
          width: number | null
        }
        Relationships: []
      }
      published_product_previews: {
        Row: {
          audience: string | null
          brand: string | null
          color: string | null
          condition_rating: number | null
          garment_type: string | null
          price: string | null
          price_cents: number | null
          primary_image_alt_text: string | null
          primary_image_height: number | null
          primary_image_id: string | null
          primary_image_width: number | null
          size_label: string | null
          slug: string | null
          title: string | null
        }
        Relationships: []
      }
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      collection_products: {
        Row: {
          collection_id: string
          position: number
          product_id: string
        }
        Insert: {
          collection_id: string
          position: number
          product_id: string
        }
        Update: {
          collection_id?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string
          id: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      intake_items: {
        Row: {
          acquisition_cost: number | null
          created_at: string
          created_by_profile_id: string
          destination: string | null
          id: string
          received_at: string
          source_profile_id: string | null
          source_type: string
          updated_at: string
        }
        Insert: {
          acquisition_cost?: number | null
          created_at?: string
          created_by_profile_id: string
          destination?: string | null
          id?: string
          received_at: string
          source_profile_id?: string | null
          source_type: string
          updated_at?: string
        }
        Update: {
          acquisition_cost?: number | null
          created_at?: string
          created_by_profile_id?: string
          destination?: string | null
          id?: string
          received_at?: string
          source_profile_id?: string | null
          source_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_items_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_items_source_profile_id_fkey"
            columns: ["source_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_preferences: {
        Row: {
          is_marketing_opted_in: boolean
          profile_id: string
          updated_at: string
        }
        Insert: {
          is_marketing_opted_in?: boolean
          profile_id: string
          updated_at?: string
        }
        Update: {
          is_marketing_opted_in?: boolean
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          height: number
          id: string
          mime_type: string
          position: number
          product_id: string
          storage_key: string
          width: number
        }
        Insert: {
          alt_text: string
          created_at?: string
          height: number
          id?: string
          mime_type: string
          position: number
          product_id: string
          storage_key: string
          width: number
        }
        Update: {
          alt_text?: string
          created_at?: string
          height?: number
          id?: string
          mime_type?: string
          position?: number
          product_id?: string
          storage_key?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          audience: string | null
          brand: string | null
          color: string | null
          condition_notes: string | null
          condition_rating: number | null
          created_at: string
          created_by_profile_id: string
          description: string | null
          garment_type: string | null
          id: string
          intake_item_id: string
          material_details: string | null
          measurements: Json | null
          price: number | null
          public_media_ready_at: string | null
          published_at: string | null
          size_label: string | null
          sku: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string | null
          brand?: string | null
          color?: string | null
          condition_notes?: string | null
          condition_rating?: number | null
          created_at?: string
          created_by_profile_id: string
          description?: string | null
          garment_type?: string | null
          id?: string
          intake_item_id: string
          material_details?: string | null
          measurements?: Json | null
          price?: number | null
          public_media_ready_at?: string | null
          published_at?: string | null
          size_label?: string | null
          sku?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string | null
          brand?: string | null
          color?: string | null
          condition_notes?: string | null
          condition_rating?: number | null
          created_at?: string
          created_by_profile_id?: string
          description?: string | null
          garment_type?: string | null
          id?: string
          intake_item_id?: string
          material_details?: string | null
          measurements?: Json | null
          price?: number | null
          public_media_ready_at?: string | null
          published_at?: string | null
          size_label?: string | null
          sku?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_intake_item_id_fkey"
            columns: ["intake_item_id"]
            isOneToOne: true
            referencedRelation: "intake_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_testimonials: {
        Row: {
          attribution: string
          author_name: string
          created_at: string
          id: string
          is_published: boolean
          position: number
          quote: string
          updated_at: string
        }
        Insert: {
          attribution: string
          author_name: string
          created_at?: string
          id?: string
          is_published?: boolean
          position: number
          quote: string
          updated_at?: string
        }
        Update: {
          attribution?: string
          author_name?: string
          created_at?: string
          id?: string
          is_published?: boolean
          position?: number
          quote?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          is_filter_visible: boolean
          name: string
          position: number
          tag_group: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_filter_visible?: boolean
          name: string
          position: number
          tag_group: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_filter_visible?: boolean
          name?: string
          position?: number
          tag_group?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      begin_product_unpublish: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      complete_product_publication: {
        Args: { p_product_id: string }
        Returns: {
          product_id: string
          slug: string
        }[]
      }
      complete_product_unpublish: {
        Args: { p_product_id: string }
        Returns: {
          product_id: string
          slug: string
        }[]
      }
      create_product_draft_from_intake: {
        Args: {
          p_acquisition_cost: string
          p_audience: string
          p_brand: string
          p_color: string
          p_condition_notes: string
          p_condition_rating: string
          p_description: string
          p_garment_type: string
          p_material_details: string
          p_measurements: Json
          p_price: string
          p_received_at: string
          p_size_label: string
          p_slug: string
          p_source_profile_id: string
          p_source_type: string
          p_title: string
        }
        Returns: {
          intake_item_id: string
          product_id: string
          sku: string
        }[]
      }
      create_product_image_metadata: {
        Args: {
          p_alt_text_prefix: string
          p_height: number
          p_image_id: string
          p_product_id: string
          p_storage_key: string
          p_width: number
        }
        Returns: {
          alt_text: string
          created_at: string
          height: number
          id: string
          image_position: number
          mime_type: string
          product_id: string
          storage_key: string
          width: number
        }[]
      }
      delete_product_image_metadata: {
        Args: { p_product_image_id: string }
        Returns: {
          deleted_position: number
          product_id: string
        }[]
      }
      get_product_manager_draft: {
        Args: { p_product_id: string }
        Returns: {
          acquisition_cost: string
          audience: string
          brand: string
          color: string
          condition_notes: string
          condition_rating: number
          description: string
          garment_type: string
          id: string
          intake_item_id: string
          material_details: string
          measurements: Json
          price: string
          received_at: string
          size_label: string
          sku: string
          source_profile_id: string
          source_type: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_product_manager_product: {
        Args: { p_product_id: string }
        Returns: {
          acquisition_cost: string
          audience: string
          brand: string
          color: string
          condition_notes: string
          condition_rating: number
          description: string
          garment_type: string
          id: string
          intake_item_id: string
          material_details: string
          measurements: Json
          price: string
          received_at: string
          size_label: string
          sku: string
          source_profile_id: string
          source_type: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_product_publication_readiness: {
        Args: { p_product_id: string }
        Returns: {
          missing_requirements: string[]
        }[]
      }
      list_product_manager_drafts: {
        Args: never
        Returns: {
          id: string
          sku: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      list_product_manager_products: {
        Args: { p_limit: number; p_offset: number }
        Returns: {
          id: string
          is_publicly_visible: boolean
          price: string
          published_at: string
          sku: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      prepare_product_publication: {
        Args: { p_product_id: string }
        Returns: {
          product_id: string
          published_at: string
          slug: string
        }[]
      }
      reorder_product_images: {
        Args: { p_ordered_image_ids: string[]; p_product_id: string }
        Returns: undefined
      }
      save_product_draft: {
        Args: {
          p_acquisition_cost: string
          p_audience: string
          p_brand: string
          p_color: string
          p_condition_notes: string
          p_condition_rating: string
          p_description: string
          p_garment_type: string
          p_material_details: string
          p_measurements: Json
          p_price: string
          p_product_id: string
          p_received_at: string
          p_size_label: string
          p_source_profile_id: string
          p_source_type: string
          p_title: string
        }
        Returns: {
          product_id: string
          sku: string
          updated_at: string
        }[]
      }
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
  api: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

