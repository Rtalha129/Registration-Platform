// TypeScript Database Schema Definitions for Supabase PostgreSQL
// Generated and aligned with 20261026000000_create_event_platform_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PaymentStatus = 'free' | 'pending' | 'paid';
export type UserRole = 'organizer' | 'attendee' | 'admin';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // uuid primary key references auth.users
          email: string;
          name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string; // uuid primary key
          user_id: string; // uuid references users(id)
          title: string;
          description: string | null;
          custom_fields: Json; // array of CustomField objects
          ticket_price: number; // in cents, e.g., 2500 for $25.00
          currency: string; // 'USD', 'EUR', etc.
          email_template: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          custom_fields?: Json;
          ticket_price?: number;
          currency?: string;
          email_template?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          custom_fields?: Json;
          ticket_price?: number;
          currency?: string;
          email_template?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      registrations: {
        Row: {
          id: string; // uuid primary key
          event_id: string; // uuid references events(id)
          attendee_name: string;
          attendee_email: string;
          form_data: Json; // JSON object of custom field responses
          payment_status: PaymentStatus;
          stripe_payment_id: string | null;
          check_in_token: string; // uuid unique check-in identifier
          is_checked_in: boolean;
          checked_in_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          attendee_name: string;
          attendee_email: string;
          form_data?: Json;
          payment_status?: PaymentStatus;
          stripe_payment_id?: string | null;
          check_in_token?: string;
          is_checked_in?: boolean;
          checked_in_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          attendee_name?: string;
          attendee_email?: string;
          form_data?: Json;
          payment_status?: PaymentStatus;
          stripe_payment_id?: string | null;
          check_in_token?: string;
          is_checked_in?: boolean;
          checked_in_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_check_in_timestamp: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      payment_status_enum: PaymentStatus;
      user_role_enum: UserRole;
    };
  };
}
