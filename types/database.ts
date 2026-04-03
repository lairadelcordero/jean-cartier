export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "admin" | "licensee" | "customer";
export type LicenseStatus = "active" | "pending" | "suspended";
export type ProductStatus = "active" | "inactive";
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          created_at?: string;
        };
      };
      licenses: {
        Row: {
          id: string;
          licensee_id: string;
          category: string;
          status: LicenseStatus;
          fee_amount: number | null;
          commission_pct: number | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          licensee_id: string;
          category: string;
          status?: LicenseStatus;
          fee_amount?: number | null;
          commission_pct?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          licensee_id?: string;
          category?: string;
          status?: LicenseStatus;
          fee_amount?: number | null;
          commission_pct?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          license_id: string;
          name: string;
          description: string | null;
          price_retail: number | null;
          price_wholesale: number | null;
          stock: number;
          category: string | null;
          images: string[] | null;
          status: ProductStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          license_id: string;
          name: string;
          description?: string | null;
          price_retail?: number | null;
          price_wholesale?: number | null;
          stock?: number;
          category?: string | null;
          images?: string[] | null;
          status?: ProductStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          license_id?: string;
          name?: string;
          description?: string | null;
          price_retail?: number | null;
          price_wholesale?: number | null;
          stock?: number;
          category?: string | null;
          images?: string[] | null;
          status?: ProductStatus;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          status: OrderStatus;
          total_amount: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          status?: OrderStatus;
          total_amount?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          status?: OrderStatus;
          total_amount?: number | null;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price?: number | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      license_status: LicenseStatus;
      product_status: ProductStatus;
      order_status: OrderStatus;
    };
  };
}
