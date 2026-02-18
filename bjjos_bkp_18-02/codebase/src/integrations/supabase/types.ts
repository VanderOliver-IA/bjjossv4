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
      attendance_records: {
        Row: {
          class_id: string | null
          created_at: string | null
          created_by: string | null
          ct_id: string
          date: string
          experimental: number | null
          id: string
          notes: string | null
          photo_url: string | null
          visitors: number | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          ct_id: string
          date?: string
          experimental?: number | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          visitors?: number | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          ct_id?: string
          date?: string
          experimental?: number | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "training_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_students: {
        Row: {
          attendance_id: string
          id: string
          recognized: boolean | null
          student_id: string
        }
        Insert: {
          attendance_id: string
          id?: string
          recognized?: boolean | null
          student_id: string
        }
        Update: {
          attendance_id?: string
          id?: string
          recognized?: boolean | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_students_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_transactions: {
        Row: {
          amount: number
          created_at: string | null
          daily_cash_id: string
          description: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          type: Database["public"]["Enums"]["cash_transaction_type"]
        }
        Insert: {
          amount: number
          created_at?: string | null
          daily_cash_id: string
          description: string
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          type: Database["public"]["Enums"]["cash_transaction_type"]
        }
        Update: {
          amount?: number
          created_at?: string | null
          daily_cash_id?: string
          description?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          type?: Database["public"]["Enums"]["cash_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "cash_transactions_daily_cash_id_fkey"
            columns: ["daily_cash_id"]
            isOneToOne: false
            referencedRelation: "daily_cash"
            referencedColumns: ["id"]
          },
        ]
      }
      cts: {
        Row: {
          address: string
          cnpj: string | null
          created_at: string | null
          email: string
          id: string
          logo_url: string | null
          modules: Json
          name: string
          phone: string
          subscription: Database["public"]["Enums"]["subscription_type"]
          subscription_due_day: number | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_value: number | null
          updated_at: string | null
        }
        Insert: {
          address: string
          cnpj?: string | null
          created_at?: string | null
          email: string
          id?: string
          logo_url?: string | null
          modules?: Json
          name: string
          phone: string
          subscription?: Database["public"]["Enums"]["subscription_type"]
          subscription_due_day?: number | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_value?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          cnpj?: string | null
          created_at?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          modules?: Json
          name?: string
          phone?: string
          subscription?: Database["public"]["Enums"]["subscription_type"]
          subscription_due_day?: number | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_cash: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closing_balance: number | null
          created_at: string | null
          ct_id: string
          date: string
          id: string
          opening_balance: number
          status: Database["public"]["Enums"]["cash_status"]
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string | null
          ct_id: string
          date?: string
          id?: string
          opening_balance?: number
          status?: Database["public"]["Enums"]["cash_status"]
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string | null
          ct_id?: string
          date?: string
          id?: string
          opening_balance?: number
          status?: Database["public"]["Enums"]["cash_status"]
        }
        Relationships: [
          {
            foreignKeyName: "daily_cash_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_cash_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_configs: {
        Row: {
          cards: Json | null
          charts: Json | null
          id: string
          layout: Json | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          cards?: Json | null
          charts?: Json | null
          id?: string
          layout?: Json | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          cards?: Json | null
          charts?: Json | null
          id?: string
          layout?: Json | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_configs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          event_id: string
          id: string
          registered_at: string | null
          student_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string | null
          student_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          ct_id: string
          date: string
          description: string | null
          id: string
          location: string | null
          price: number | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ct_id: string
          date: string
          description?: string | null
          id?: string
          location?: string | null
          price?: number | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ct_id?: string
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          price?: number | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          ct_ids: string[] | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ct_ids?: string[] | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ct_ids?: string[] | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          ct_id: string
          description: string
          due_date: string | null
          id: string
          paid_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          product_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          ct_id: string
          description: string
          due_date?: string | null
          id?: string
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          product_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          ct_id?: string
          description?: string
          due_date?: string | null
          id?: string
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          product_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      graduation_records: {
        Row: {
          awarded_by: string | null
          created_at: string | null
          ct_id: string
          date: string
          event_id: string | null
          from_belt: Database["public"]["Enums"]["belt_type"]
          from_stripes: number
          id: string
          notes: string | null
          student_id: string
          to_belt: Database["public"]["Enums"]["belt_type"]
          to_stripes: number
        }
        Insert: {
          awarded_by?: string | null
          created_at?: string | null
          ct_id: string
          date?: string
          event_id?: string | null
          from_belt: Database["public"]["Enums"]["belt_type"]
          from_stripes?: number
          id?: string
          notes?: string | null
          student_id: string
          to_belt: Database["public"]["Enums"]["belt_type"]
          to_stripes?: number
        }
        Update: {
          awarded_by?: string | null
          created_at?: string | null
          ct_id?: string
          date?: string
          event_id?: string | null
          from_belt?: Database["public"]["Enums"]["belt_type"]
          from_stripes?: number
          id?: string
          notes?: string | null
          student_id?: string
          to_belt?: Database["public"]["Enums"]["belt_type"]
          to_stripes?: number
        }
        Relationships: [
          {
            foreignKeyName: "graduation_records_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graduation_records_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graduation_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graduation_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          ct_id: string
          email: string | null
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          phone: string
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          ct_id: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name: string
          notes?: string | null
          phone: string
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          ct_id?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          phone?: string
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          ct_id: string
          from_profile_id: string
          id: string
          read: boolean | null
          read_at: string | null
          subject: string
          to_profile_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          ct_id: string
          from_profile_id: string
          id?: string
          read?: boolean | null
          read_at?: string | null
          subject: string
          to_profile_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          ct_id?: string
          from_profile_id?: string
          id?: string
          read?: boolean | null
          read_at?: string | null
          subject?: string
          to_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_from_profile_id_fkey"
            columns: ["from_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_profile_id_fkey"
            columns: ["to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_notes: {
        Row: {
          color: string | null
          content: string
          created_at: string
          id: string
          pinned: boolean | null
          profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean | null
          profile_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean | null
          profile_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category: Database["public"]["Enums"]["product_category"]
          created_at: string | null
          ct_id: string
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          ct_id: string
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          ct_id?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          ct_id: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          ct_id?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          ct_id?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_expenses: {
        Row: {
          active: boolean | null
          amount: number
          category: string
          created_at: string | null
          ct_id: string
          description: string
          due_day: number
          id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          amount: number
          category: string
          created_at?: string | null
          ct_id: string
          description: string
          due_day: number
          id?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          amount?: number
          category?: string
          created_at?: string | null
          ct_id?: string
          description?: string
          due_day?: number
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          ct_id: string
          id: string
          modules: Json
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ct_id: string
          id?: string
          modules?: Json
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ct_id?: string
          id?: string
          modules?: Json
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
        ]
      }
      student_classes: {
        Row: {
          class_id: string
          enrolled_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "training_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          balance: number
          belt: Database["public"]["Enums"]["belt_type"]
          birth_date: string | null
          created_at: string | null
          ct_id: string
          email: string
          emergency_contact: string | null
          enrollment_date: string
          federated: boolean | null
          id: string
          jj_start_date: string | null
          name: string
          notes: string | null
          pause_periods: Json | null
          phone: string
          photo_front: string | null
          photo_left: string | null
          photo_right: string | null
          previous_ct: string | null
          profile_id: string | null
          responsible_name: string | null
          responsible_phone: string | null
          status: Database["public"]["Enums"]["student_status"]
          stripes: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          balance?: number
          belt?: Database["public"]["Enums"]["belt_type"]
          birth_date?: string | null
          created_at?: string | null
          ct_id: string
          email: string
          emergency_contact?: string | null
          enrollment_date?: string
          federated?: boolean | null
          id?: string
          jj_start_date?: string | null
          name: string
          notes?: string | null
          pause_periods?: Json | null
          phone: string
          photo_front?: string | null
          photo_left?: string | null
          photo_right?: string | null
          previous_ct?: string | null
          profile_id?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          stripes?: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          balance?: number
          belt?: Database["public"]["Enums"]["belt_type"]
          birth_date?: string | null
          created_at?: string | null
          ct_id?: string
          email?: string
          emergency_contact?: string | null
          enrollment_date?: string
          federated?: boolean | null
          id?: string
          jj_start_date?: string | null
          name?: string
          notes?: string | null
          pause_periods?: Json | null
          phone?: string
          photo_front?: string | null
          photo_left?: string | null
          photo_right?: string | null
          previous_ct?: string | null
          profile_id?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          stripes?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_classes: {
        Row: {
          active: boolean | null
          created_at: string | null
          ct_id: string
          days_of_week: string[]
          id: string
          level: Database["public"]["Enums"]["class_level"]
          max_students: number | null
          name: string
          professor_id: string | null
          schedule: string | null
          time_end: string | null
          time_start: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          ct_id: string
          days_of_week?: string[]
          id?: string
          level?: Database["public"]["Enums"]["class_level"]
          max_students?: number | null
          name: string
          professor_id?: string | null
          schedule?: string | null
          time_end?: string | null
          time_start?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          ct_id?: string
          days_of_week?: string[]
          id?: string
          level?: Database["public"]["Enums"]["class_level"]
          max_students?: number | null
          name?: string
          professor_id?: string | null
          schedule?: string | null
          time_end?: string | null
          time_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_classes_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "cts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_classes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          role: Database["public"]["Enums"]["app_role"]
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
      [_ in never]: never
    }
    Functions: {
      can_access_ct: { Args: { _ct_id: string }; Returns: boolean }
      get_user_ct_id: { Args: never; Returns: string }
      get_user_profile: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_class_professor: { Args: { _class_id: string }; Returns: boolean }
      is_ct_admin: { Args: { _ct_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin_ct" | "professor" | "atendente" | "aluno"
      belt_type: "branca" | "azul" | "roxa" | "marrom" | "preta"
      cash_status: "aberto" | "fechado"
      cash_transaction_type: "entrada" | "saida"
      class_level: "iniciante" | "intermediario" | "avancado" | "todos"
      event_type: "graduacao" | "campeonato" | "interno" | "seminario"
      lead_source: "instagram" | "facebook" | "indicacao" | "site" | "outros"
      lead_status:
        | "novo"
        | "contatado"
        | "agendado"
        | "experimental"
        | "matriculado"
        | "perdido"
      payment_method: "pix" | "cartao" | "dinheiro" | "boleto"
      payment_status: "pago" | "pendente" | "atrasado"
      product_category: "cantina" | "loja"
      student_status: "ativo" | "inativo" | "experimental"
      subscription_status: "ativo" | "inativo" | "pendente"
      subscription_type: "trial" | "basic" | "pro" | "enterprise"
      transaction_type: "mensalidade" | "cantina" | "loja" | "evento" | "outros"
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
      app_role: ["super_admin", "admin_ct", "professor", "atendente", "aluno"],
      belt_type: ["branca", "azul", "roxa", "marrom", "preta"],
      cash_status: ["aberto", "fechado"],
      cash_transaction_type: ["entrada", "saida"],
      class_level: ["iniciante", "intermediario", "avancado", "todos"],
      event_type: ["graduacao", "campeonato", "interno", "seminario"],
      lead_source: ["instagram", "facebook", "indicacao", "site", "outros"],
      lead_status: [
        "novo",
        "contatado",
        "agendado",
        "experimental",
        "matriculado",
        "perdido",
      ],
      payment_method: ["pix", "cartao", "dinheiro", "boleto"],
      payment_status: ["pago", "pendente", "atrasado"],
      product_category: ["cantina", "loja"],
      student_status: ["ativo", "inativo", "experimental"],
      subscription_status: ["ativo", "inativo", "pendente"],
      subscription_type: ["trial", "basic", "pro", "enterprise"],
      transaction_type: ["mensalidade", "cantina", "loja", "evento", "outros"],
    },
  },
} as const
