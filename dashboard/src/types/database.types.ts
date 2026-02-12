export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      article_images: {
        Row: {
          article_id: number | null;
          caption: string | null;
          id: number;
          image_url: string;
        };
        Insert: {
          article_id?: number | null;
          caption?: string | null;
          id?: number;
          image_url: string;
        };
        Update: {
          article_id?: number | null;
          caption?: string | null;
          id?: number;
          image_url?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          author_id: number | null;
          category: string;
          content: string;
          date_posted: string | null;
          description: string | null;
          id: number;
          read_time: number | null;
          slug: string;
          title: string;
        };
        Insert: {
          author_id?: number | null;
          category: string;
          content: string;
          date_posted?: string | null;
          description?: string | null;
          id?: number;
          read_time?: number | null;
          slug: string;
          title: string;
        };
        Update: {
          author_id?: number | null;
          category?: string;
          content?: string;
          date_posted?: string | null;
          description?: string | null;
          id?: number;
          read_time?: number | null;
          slug?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "authors";
            referencedColumns: ["id"];
          }
        ];
      };
      authors: {
        Row: {
          bio: string | null;
          id: number;
          name: string;
          profile_image: string | null;
        };
        Insert: {
          bio?: string | null;
          id?: number;
          name: string;
          profile_image?: string | null;
        };
        Update: {
          bio?: string | null;
          id?: number;
          name?: string;
          profile_image?: string | null;
        };
        Relationships: [];
      };
      available_dates: {
        Row: {
          created_at: string | null;
          date: string;
          id: number;
          tour_id: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          id?: number;
          tour_id: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          id?: number;
          tour_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "available_dates_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_activity_log: {
        Row: {
          action: string;
          actor_id: number | null;
          actor_type: string;
          booking_id: number;
          created_at: string;
          id: number;
          message: string | null;
        };
        Insert: {
          action: string;
          actor_id?: number | null;
          actor_type: string;
          booking_id: number;
          created_at?: string;
          id?: number;
          message?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: number | null;
          actor_type?: string;
          booking_id?: number;
          created_at?: string;
          id?: number;
          message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "booking_activity_log_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_assignments: {
        Row: {
          assigned_at: string;
          assigned_by: number | null;
          booking_id: number;
          guide_id: number;
          id: number;
          role: string | null;
          status: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: number | null;
          booking_id: number;
          guide_id: number;
          id?: number;
          role?: string | null;
          status?: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: number | null;
          booking_id?: number;
          guide_id?: number;
          id?: number;
          role?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_assignments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_assignments_guide_id_fkey";
            columns: ["guide_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_guest_names: {
        Row: {
          booking_id: number;
          full_name: string;
          id: number;
        };
        Insert: {
          booking_id: number;
          full_name: string;
          id?: number;
        };
        Update: {
          booking_id?: number;
          full_name?: string;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "booking_guest_names_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_guests: {
        Row: {
          adults: number;
          booking_id: number;
          children: number;
          infants: number;
        };
        Insert: {
          adults?: number;
          booking_id: number;
          children?: number;
          infants?: number;
        };
        Update: {
          adults?: number;
          booking_id?: number;
          children?: number;
          infants?: number;
        };
        Relationships: [
          {
            foreignKeyName: "booking_guests_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_payments: {
        Row: {
          amount: number;
          booking_id: number;
          created_at: string | null;
          id: number;
          method: string | null;
          paid_at: string | null;
          status: string;
        };
        Insert: {
          amount: number;
          booking_id: number;
          created_at?: string | null;
          id?: number;
          method?: string | null;
          paid_at?: string | null;
          status: string;
        };
        Update: {
          amount?: number;
          booking_id?: number;
          created_at?: string | null;
          id?: number;
          method?: string | null;
          paid_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      bookings: {
        Row: {
          booking_date: string;
          booking_reference: string | null;
          created_at: string | null;
          end_time: string | null;
          id: number;
          is_custom_tour: boolean | null;
          language: string | null;
          meeting_point: string | null;
          notes: string | null;
          primary_contact_email: string | null;
          primary_contact_name: string;
          primary_contact_phone: string | null;
          source: string;
          start_time: string | null;
          status: string;
          time_slot_id: number | null;
          tour_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          booking_date: string;
          booking_reference?: string | null;
          created_at?: string | null;
          end_time?: string | null;
          id?: number;
          is_custom_tour?: boolean | null;
          language?: string | null;
          meeting_point?: string | null;
          notes?: string | null;
          primary_contact_email?: string | null;
          primary_contact_name: string;
          primary_contact_phone?: string | null;
          source: string;
          start_time?: string | null;
          status: string;
          time_slot_id?: number | null;
          tour_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          booking_date?: string;
          booking_reference?: string | null;
          created_at?: string | null;
          end_time?: string | null;
          id?: number;
          is_custom_tour?: boolean | null;
          language?: string | null;
          meeting_point?: string | null;
          notes?: string | null;
          primary_contact_email?: string | null;
          primary_contact_name?: string;
          primary_contact_phone?: string | null;
          source?: string;
          start_time?: string | null;
          status?: string;
          time_slot_id?: number | null;
          tour_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_time_slot_fkey";
            columns: ["time_slot_id"];
            isOneToOne: false;
            referencedRelation: "tour_time_slots";
            referencedColumns: ["id"];
          }
        ];
      };
      bookings_old: {
        Row: {
          adults: number;
          booking_date: string;
          children: number;
          created_at: string | null;
          id: number;
          infants: number;
          status: Database["public"]["Enums"]["booking_status"] | null;
          time_slot_id: number | null;
          tour_id: number;
          updated_at: string | null;
          user_id: number;
        };
        Insert: {
          adults?: number;
          booking_date: string;
          children?: number;
          created_at?: string | null;
          id?: number;
          infants?: number;
          status?: Database["public"]["Enums"]["booking_status"] | null;
          time_slot_id?: number | null;
          tour_id: number;
          updated_at?: string | null;
          user_id: number;
        };
        Update: {
          adults?: number;
          booking_date?: string;
          children?: number;
          created_at?: string | null;
          id?: number;
          infants?: number;
          status?: Database["public"]["Enums"]["booking_status"] | null;
          time_slot_id?: number | null;
          tour_id?: number;
          updated_at?: string | null;
          user_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_time_slot_id_fkey";
            columns: ["time_slot_id"];
            isOneToOne: false;
            referencedRelation: "tour_time_slots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      employees: {
        Row: {
          email: string | null;
          first_name: string | null;
          id: number;
          join_date: string | null;
          last_activity: string | null;
          last_name: string | null;
          phone: string | null;
          position: string | null;
          profile_image: string | null;
          status: string | null;
          work_email: string | null;
        };
        Insert: {
          email?: string | null;
          first_name?: string | null;
          id?: number;
          join_date?: string | null;
          last_activity?: string | null;
          last_name?: string | null;
          phone?: string | null;
          position?: string | null;
          profile_image?: string | null;
          status?: string | null;
          work_email?: string | null;
        };
        Update: {
          email?: string | null;
          first_name?: string | null;
          id?: number;
          join_date?: string | null;
          last_activity?: string | null;
          last_name?: string | null;
          phone?: string | null;
          position?: string | null;
          profile_image?: string | null;
          status?: string | null;
          work_email?: string | null;
        };
        Relationships: [];
      };
      highlights: {
        Row: {
          created_at: string | null;
          highlight: string;
          id: number;
          tour_id: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          highlight: string;
          id?: number;
          tour_id: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          highlight?: string;
          id?: number;
          tour_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "highlights_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          }
        ];
      };
      images: {
        Row: {
          created_at: string | null;
          id: number;
          image_path: string;
          tour_id: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          image_path: string;
          tour_id: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          image_path?: string;
          tour_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "images_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          }
        ];
      };
      knex_migrations: {
        Row: {
          batch: number | null;
          id: number;
          migration_time: string | null;
          name: string | null;
        };
        Insert: {
          batch?: number | null;
          id?: number;
          migration_time?: string | null;
          name?: string | null;
        };
        Update: {
          batch?: number | null;
          id?: number;
          migration_time?: string | null;
          name?: string | null;
        };
        Relationships: [];
      };
      knex_migrations_lock: {
        Row: {
          index: number;
          is_locked: number | null;
        };
        Insert: {
          index?: number;
          is_locked?: number | null;
        };
        Update: {
          index?: number;
          is_locked?: number | null;
        };
        Relationships: [];
      };
      tour_availabilities: {
        Row: {
          created_at: string | null;
          end_date: string;
          id: number;
          start_date: string;
          tour_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          end_date: string;
          id?: number;
          start_date: string;
          tour_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          end_date?: string;
          id?: number;
          start_date?: string;
          tour_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tour_availabilities_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          }
        ];
      };
      tour_itinerary_coordinates: {
        Row: {
          created_at: string | null;
          id: number;
          latitude: number;
          longitude: number;
          name: string | null;
          order: number;
          tour_id: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          latitude: number;
          longitude: number;
          name?: string | null;
          order: number;
          tour_id: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          latitude?: number;
          longitude?: number;
          name?: string | null;
          order?: number;
          tour_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_tour_itinerary_tour";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          }
        ];
      };
      tour_recurring_unavailabilities: {
        Row: {
          created_at: string | null;
          day_of_week: number | null;
          id: number;
          reason: string | null;
          tour_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          day_of_week?: number | null;
          id?: number;
          reason?: string | null;
          tour_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          day_of_week?: number | null;
          id?: number;
          reason?: string | null;
          tour_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tour_recurring_unavailabilities_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          }
        ];
      };
      tour_time_slots: {
        Row: {
          created_at: string | null;
          end_time: string;
          id: number;
          start_time: string;
          tour_id: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          end_time: string;
          id?: number;
          start_time: string;
          tour_id: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          end_time?: string;
          id?: number;
          start_time?: string;
          tour_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_tour_time_slots_tour";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          }
        ];
      };
      tour_unavailable_dates: {
        Row: {
          created_at: string | null;
          id: number;
          reason: string | null;
          tour_id: number | null;
          unavailable_date: string;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          reason?: string | null;
          tour_id?: number | null;
          unavailable_date: string;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          reason?: string | null;
          tour_id?: number | null;
          unavailable_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tour_unavailable_dates_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          }
        ];
      };
      tours: {
        Row: {
          accessibility: string;
          activity_level: string;
          additional_costs: string;
          best_seller: boolean;
          category: string;
          created_at: string | null;
          duration: string;
          essentials: string;
          featured: boolean | null;
          groups: number;
          id: number;
          includes: string;
          landmarks: string;
          minimum_of_attendees: number;
          overview: string;
          overview_title: string;
          price: number;
          slug: string | null;
          tour_name: string;
          updated_at: string | null;
        };
        Insert: {
          accessibility: string;
          activity_level: string;
          additional_costs: string;
          best_seller?: boolean;
          category: string;
          created_at?: string | null;
          duration: string;
          essentials: string;
          featured?: boolean | null;
          groups: number;
          id?: number;
          includes: string;
          landmarks: string;
          minimum_of_attendees: number;
          overview: string;
          overview_title: string;
          price: number;
          slug?: string | null;
          tour_name: string;
          updated_at?: string | null;
        };
        Update: {
          accessibility?: string;
          activity_level?: string;
          additional_costs?: string;
          best_seller?: boolean;
          category?: string;
          created_at?: string | null;
          duration?: string;
          essentials?: string;
          featured?: boolean | null;
          groups?: number;
          id?: number;
          includes?: string;
          landmarks?: string;
          minimum_of_attendees?: number;
          overview?: string;
          overview_title?: string;
          price?: number;
          slug?: string | null;
          tour_name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: number;
          role: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          role: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          role?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          emergency_contact: string | null;
          first_name: string;
          gift_credit: number | null;
          id: number;
          last_name: string;
          notification_preference: boolean | null;
          password: string;
          phone_number: string;
          preferred_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          emergency_contact?: string | null;
          first_name: string;
          gift_credit?: number | null;
          id?: number;
          last_name: string;
          notification_preference?: boolean | null;
          password: string;
          phone_number: string;
          preferred_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          emergency_contact?: string | null;
          first_name?: string;
          gift_credit?: number | null;
          id?: number;
          last_name?: string;
          notification_preference?: boolean | null;
          password?: string;
          phone_number?: string;
          preferred_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      booking_status:
        | "pending"
        | "requires_action"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
        | "refunded";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "pending",
        "requires_action",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
        "refunded",
      ],
    },
  },
} as const;
