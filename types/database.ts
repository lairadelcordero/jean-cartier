export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "admin" | "licenciatario" | "customer";
export type LicenseStatus = "active" | "inactive" | "pending";
export type ProductStatus = "active" | "inactive";
export type OrderStatus = "pending" | "completed" | "cancelled";

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
        Relationships: [];
      };
      licenses: {
        Row: {
          id: string;
          licenciatario_id: string;
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
          licenciatario_id: string;
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
          licenciatario_id?: string;
          category?: string;
          status?: LicenseStatus;
          fee_amount?: number | null;
          commission_pct?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          license_id: string;
          name: string;
          sku: string;
          description: string | null;
          price: number | null;
          price_retail: number | null;
          price_wholesale: number | null;
          stock: number;
          category: string | null;
          images: string[] | null;
          status: ProductStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          license_id: string;
          name: string;
          sku: string;
          description?: string | null;
          price?: number | null;
          price_retail?: number | null;
          price_wholesale?: number | null;
          stock?: number;
          category?: string | null;
          images?: string[] | null;
          status?: ProductStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          license_id?: string;
          name?: string;
          sku?: string;
          description?: string | null;
          price?: number | null;
          price_retail?: number | null;
          price_wholesale?: number | null;
          stock?: number;
          category?: string | null;
          images?: string[] | null;
          status?: ProductStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          total: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: OrderStatus;
          total?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: OrderStatus;
          total?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      health_check: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      user_role: UserRole;
      license_status: LicenseStatus;
      product_status: ProductStatus;
      order_status: OrderStatus;
    };
  };
}
