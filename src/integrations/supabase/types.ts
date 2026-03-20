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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_history: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          file_size_bytes: number | null
          id: string
          record_count: number
          status: string
          tables_included: string[]
          type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          record_count?: number
          status?: string
          tables_included?: string[]
          type?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          record_count?: number
          status?: string
          tables_included?: string[]
          type?: string
        }
        Relationships: []
      }
      bar_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      bar_drink_measures: {
        Row: {
          created_at: string
          drink_id: string
          id: string
          measure_ml: number | null
          measure_name: string
          price: number
          sort_order: number
          stock_deduction: number
        }
        Insert: {
          created_at?: string
          drink_id: string
          id?: string
          measure_ml?: number | null
          measure_name: string
          price: number
          sort_order?: number
          stock_deduction?: number
        }
        Update: {
          created_at?: string
          drink_id?: string
          id?: string
          measure_ml?: number | null
          measure_name?: string
          price?: number
          sort_order?: number
          stock_deduction?: number
        }
        Relationships: [
          {
            foreignKeyName: "bar_drink_measures_drink_id_fkey"
            columns: ["drink_id"]
            isOneToOne: false
            referencedRelation: "bar_drinks"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_drinks: {
        Row: {
          available: boolean
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          reorder_point: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          reorder_point?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          reorder_point?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bar_drinks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "bar_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_inventory: {
        Row: {
          created_at: string
          current_stock: number
          drink_id: string
          id: string
          last_restock_at: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stock?: number
          drink_id: string
          id?: string
          last_restock_at?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stock?: number
          drink_id?: string
          id?: string
          last_restock_at?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bar_inventory_drink_id_fkey"
            columns: ["drink_id"]
            isOneToOne: true
            referencedRelation: "bar_drinks"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_inventory_transactions: {
        Row: {
          created_at: string
          drink_id: string
          id: string
          notes: string | null
          quantity: number
          reference_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          drink_id: string
          id?: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          drink_id?: string
          id?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bar_inventory_transactions_drink_id_fkey"
            columns: ["drink_id"]
            isOneToOne: false
            referencedRelation: "bar_drinks"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_order_items: {
        Row: {
          created_at: string
          drink_id: string
          id: string
          measure_id: string
          order_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          drink_id: string
          id?: string
          measure_id: string
          order_id: string
          quantity?: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          drink_id?: string
          id?: string
          measure_id?: string
          order_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bar_order_items_drink_id_fkey"
            columns: ["drink_id"]
            isOneToOne: false
            referencedRelation: "bar_drinks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bar_order_items_measure_id_fkey"
            columns: ["measure_id"]
            isOneToOne: false
            referencedRelation: "bar_drink_measures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bar_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "bar_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_orders: {
        Row: {
          bartender_id: string | null
          created_at: string
          guest_id: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          room_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          bartender_id?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          room_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          bartender_id?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          room_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bar_orders_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bar_orders_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_audience: string | null
          type: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          id_number: string | null
          id_type: string | null
          last_name: string
          nationality: string | null
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
          vip: boolean | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          last_name: string
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
          vip?: boolean | null
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          last_name?: string
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
          vip?: boolean | null
        }
        Relationships: []
      }
      housekeeping_staff: {
        Row: {
          average_time: number | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          rating: number | null
          shift: string
          staff_id: string | null
          status: string
          tasks_completed: number | null
          updated_at: string
        }
        Insert: {
          average_time?: number | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          rating?: number | null
          shift: string
          staff_id?: string | null
          status?: string
          tasks_completed?: number | null
          updated_at?: string
        }
        Update: {
          average_time?: number | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          rating?: number | null
          shift?: string
          staff_id?: string | null
          status?: string
          tasks_completed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      housekeeping_tasks: {
        Row: {
          actual_duration: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          estimated_duration: number | null
          id: string
          notes: string | null
          priority: string
          room_id: string | null
          scheduled_for: string
          started_at: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          priority?: string
          room_id?: string | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          priority?: string
          room_id?: string | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "housekeeping_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          description: string
          id: string
          invoice_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total: number
          unit_price: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          discount: number
          due_date: string | null
          guest_id: string
          id: string
          invoice_number: string
          notes: string | null
          reservation_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: number
          due_date?: string | null
          guest_id: string
          id?: string
          invoice_number: string
          notes?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: number
          due_date?: string | null
          guest_id?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean | null
          category: string
          created_at: string
          description: string | null
          dietary: string[] | null
          id: string
          image_url: string | null
          name: string
          preparation_time: number | null
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          dietary?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          preparation_time?: number | null
          price: number
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          dietary?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          preparation_time?: number | null
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      mobile_app_settings: {
        Row: {
          auto_sync: boolean | null
          biometric_auth: boolean | null
          created_at: string
          dark_mode: boolean | null
          email_notifications: boolean | null
          id: string
          language: string | null
          offline_mode: boolean | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auto_sync?: boolean | null
          biometric_auth?: boolean | null
          created_at?: string
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          offline_mode?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auto_sync?: boolean | null
          biometric_auth?: boolean | null
          created_at?: string
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          offline_mode?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          backup_enabled: boolean
          check_in_enabled: boolean
          check_out_enabled: boolean
          created_at: string
          email_digest_enabled: boolean
          housekeeping_enabled: boolean
          id: string
          push_enabled: boolean
          reservation_enabled: boolean
          sound_enabled: boolean
          system_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_enabled?: boolean
          check_in_enabled?: boolean
          check_out_enabled?: boolean
          created_at?: string
          email_digest_enabled?: boolean
          housekeeping_enabled?: boolean
          id?: string
          push_enabled?: boolean
          reservation_enabled?: boolean
          sound_enabled?: boolean
          system_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_enabled?: boolean
          check_in_enabled?: boolean
          check_out_enabled?: boolean
          created_at?: string
          email_digest_enabled?: boolean
          housekeeping_enabled?: boolean
          id?: string
          push_enabled?: boolean
          reservation_enabled?: boolean
          sound_enabled?: boolean
          system_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          end_date: string
          id: string
          max_uses: number | null
          min_stay: number | null
          name: string
          room_types: Database["public"]["Enums"]["room_type"][] | null
          start_date: string
          updated_at: string
          used_count: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          end_date: string
          id?: string
          max_uses?: number | null
          min_stay?: number | null
          name: string
          room_types?: Database["public"]["Enums"]["room_type"][] | null
          start_date: string
          updated_at?: string
          used_count?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          end_date?: string
          id?: string
          max_uses?: number | null
          min_stay?: number | null
          name?: string
          room_types?: Database["public"]["Enums"]["room_type"][] | null
          start_date?: string
          updated_at?: string
          used_count?: number | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          drink_id: string
          id: string
          po_id: string
          quantity: number
          received_quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          drink_id: string
          id?: string
          po_id: string
          quantity?: number
          received_quantity?: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          drink_id?: string
          id?: string
          po_id?: string
          quantity?: number
          received_quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_drink_id_fkey"
            columns: ["drink_id"]
            isOneToOne: false
            referencedRelation: "bar_drinks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery: string | null
          created_at: string
          created_by: string | null
          expected_delivery: string | null
          id: string
          notes: string | null
          po_number: string
          status: string
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          po_number: string
          status?: string
          total_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          po_number?: string
          status?: string
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          adults: number
          check_in: string
          check_out: string
          children: number
          confirmation_code: string | null
          created_at: string
          guest_id: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          room_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          adults?: number
          check_in: string
          check_out: string
          children?: number
          confirmation_code?: string | null
          created_at?: string
          guest_id: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          room_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          adults?: number
          check_in?: string
          check_out?: string
          children?: number
          confirmation_code?: string | null
          created_at?: string
          guest_id?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          room_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_service_order_items: {
        Row: {
          id: string
          menu_item_id: string | null
          order_id: string
          quantity: number
          special_instructions: string | null
          subtotal: number
        }
        Insert: {
          id?: string
          menu_item_id?: string | null
          order_id: string
          quantity?: number
          special_instructions?: string | null
          subtotal?: number
        }
        Update: {
          id?: string
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          special_instructions?: string | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "room_service_order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_service_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "room_service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      room_service_orders: {
        Row: {
          created_at: string
          delivery_fee: number | null
          estimated_delivery: string | null
          guest_id: string | null
          id: string
          room_id: string | null
          special_instructions: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_fee?: number | null
          estimated_delivery?: string | null
          guest_id?: string | null
          id?: string
          room_id?: string | null
          special_instructions?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_fee?: number | null
          estimated_delivery?: string | null
          guest_id?: string | null
          id?: string
          room_id?: string | null
          special_instructions?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_service_orders_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_service_orders_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          created_at: string
          description: string | null
          floor: number
          id: string
          max_occupancy: number
          number: string
          price_per_night: number
          status: Database["public"]["Enums"]["room_status"]
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          floor: number
          id?: string
          max_occupancy?: number
          number: string
          price_per_night: number
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          created_at?: string
          description?: string | null
          floor?: number
          id?: string
          max_occupancy?: number
          number?: string
          price_per_night?: number
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      staff: {
        Row: {
          address: string | null
          created_at: string
          department: string | null
          email: string
          emergency_contact: string | null
          first_name: string
          hire_date: string | null
          id: string
          last_name: string
          performance_score: number | null
          phone: string | null
          role: Database["public"]["Enums"]["staff_role"]
          salary: number | null
          shift: string | null
          status: Database["public"]["Enums"]["staff_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          department?: string | null
          email: string
          emergency_contact?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          last_name: string
          performance_score?: number | null
          phone?: string | null
          role: Database["public"]["Enums"]["staff_role"]
          salary?: number | null
          shift?: string | null
          status?: Database["public"]["Enums"]["staff_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          department?: string | null
          email?: string
          emergency_contact?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          last_name?: string
          performance_score?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          salary?: number | null
          shift?: string | null
          status?: Database["public"]["Enums"]["staff_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          po_id: string | null
          reference: string | null
          vendor_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          po_id?: string | null
          reference?: string | null
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          po_id?: string | null
          reference?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payments_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          products_supplied: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          products_supplied?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          products_supplied?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      campaign_status: "draft" | "active" | "paused" | "completed" | "cancelled"
      discount_type: "percentage" | "fixed"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      payment_status: "pending" | "partial" | "paid" | "refunded"
      reservation_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
      room_status: "available" | "occupied" | "maintenance" | "cleaning"
      room_type: "single" | "double" | "suite" | "deluxe" | "presidential"
      staff_role:
        | "manager"
        | "receptionist"
        | "housekeeping"
        | "maintenance"
        | "security"
        | "restaurant"
        | "chef"
        | "accountant"
      staff_status: "active" | "on_leave" | "inactive"
      user_app_role: "admin" | "manager" | "staff" | "guest"
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
      campaign_status: ["draft", "active", "paused", "completed", "cancelled"],
      discount_type: ["percentage", "fixed"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      payment_status: ["pending", "partial", "paid", "refunded"],
      reservation_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
      ],
      room_status: ["available", "occupied", "maintenance", "cleaning"],
      room_type: ["single", "double", "suite", "deluxe", "presidential"],
      staff_role: [
        "manager",
        "receptionist",
        "housekeeping",
        "maintenance",
        "security",
        "restaurant",
        "chef",
        "accountant",
      ],
      staff_status: ["active", "on_leave", "inactive"],
      user_app_role: ["admin", "manager", "staff", "guest"],
    },
  },
} as const
