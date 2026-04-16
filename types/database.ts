export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "sudo" | "admin" | "editor" | "licenciatario" | "customer";
export type LicenseStatus = "active" | "inactive" | "pending" | "expired";
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
      customer_tax_profiles: {
        Row: {
          user_id: string;
          legal_name: string | null;
          tax_id: string | null;
          tax_condition: string | null;
          billing_address: string | null;
          city: string | null;
          country: string | null;
          postal_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          legal_name?: string | null;
          tax_id?: string | null;
          tax_condition?: string | null;
          billing_address?: string | null;
          city?: string | null;
          country?: string | null;
          postal_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          legal_name?: string | null;
          tax_id?: string | null;
          tax_condition?: string | null;
          billing_address?: string | null;
          city?: string | null;
          country?: string | null;
          postal_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          provider: string;
          amount: number;
          currency: string;
          status: "pending" | "approved" | "rejected" | "refunded";
          external_reference: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id?: string | null;
          provider?: string;
          amount: number;
          currency?: string;
          status?: "pending" | "approved" | "rejected" | "refunded";
          external_reference?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string | null;
          provider?: string;
          amount?: number;
          currency?: string;
          status?: "pending" | "approved" | "rejected" | "refunded";
          external_reference?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      licenciatario_documents: {
        Row: {
          id: string;
          licenciatario_id: string;
          title: string;
          doc_type: string;
          url: string;
          status: "draft" | "published" | "archived";
          notes: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          licenciatario_id: string;
          title: string;
          doc_type?: string;
          url: string;
          status?: "draft" | "published" | "archived";
          notes?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          licenciatario_id?: string;
          title?: string;
          doc_type?: string;
          url?: string;
          status?: "draft" | "published" | "archived";
          notes?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      entity_types: {
        Row: {
          id: string;
          name: string;
          slug: string;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      licenciatarios: {
        Row: {
          id: string;
          user_id: string | null;
          razon_social: string;
          rut_cuit: string;
          domicilio: string;
          tipo_entidad: string;
          regimen_tributario: string;
          numero_inscripcion: string | null;
          actividad_principal: string;
          status: "active" | "inactive" | "pending";
          archived: boolean;
          created_by: string | null;
          last_modified_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          razon_social: string;
          rut_cuit: string;
          domicilio: string;
          tipo_entidad: string;
          regimen_tributario: string;
          numero_inscripcion?: string | null;
          actividad_principal: string;
          status?: "active" | "inactive" | "pending";
          archived?: boolean;
          created_by?: string | null;
          last_modified_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          razon_social?: string;
          rut_cuit?: string;
          domicilio?: string;
          tipo_entidad?: string;
          regimen_tributario?: string;
          numero_inscripcion?: string | null;
          actividad_principal?: string;
          status?: "active" | "inactive" | "pending";
          archived?: boolean;
          created_by?: string | null;
          last_modified_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Relationships: [];
      };
      licenciatario_contacts: {
        Row: {
          id: string;
          licenciatario_id: string;
          contact_type: "primary" | "secondary";
          name: string;
          email: string;
          phone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          licenciatario_id: string;
          contact_type: "primary" | "secondary";
          name: string;
          email: string;
          phone: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          licenciatario_id?: string;
          contact_type?: "primary" | "secondary";
          name?: string;
          email?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      licenciatario_licenses: {
        Row: {
          id: string;
          licenciatario_id: string | null;
          category: string;
          category_id: string | null;
          tier_id: string | null;
          exclusive: boolean;
          exclusive_scope: "none" | "production" | "import" | "both";
          agreed_price: number | null;
          status: LicenseStatus;
          issue_date: string;
          expiration_date: string;
          renewal_date: string | null;
          terms_accepted: boolean;
          notes: string | null;
          description: string | null;
          legal_counsel_name: string | null;
          legal_counsel_email: string | null;
          legal_counsel_phone: string | null;
          patent_registration: string | null;
          created_by: string | null;
          last_modified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          licenciatario_id?: string | null;
          category: string;
          category_id?: string | null;
          tier_id?: string | null;
          exclusive?: boolean;
          exclusive_scope?: "none" | "production" | "import" | "both";
          agreed_price?: number | null;
          status?: LicenseStatus;
          issue_date: string;
          expiration_date: string;
          renewal_date?: string | null;
          terms_accepted?: boolean;
          notes?: string | null;
          description?: string | null;
          legal_counsel_name?: string | null;
          legal_counsel_email?: string | null;
          legal_counsel_phone?: string | null;
          patent_registration?: string | null;
          created_by?: string | null;
          last_modified_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          licenciatario_id?: string | null;
          category?: string;
          category_id?: string | null;
          tier_id?: string | null;
          exclusive?: boolean;
          exclusive_scope?: "none" | "production" | "import" | "both";
          agreed_price?: number | null;
          status?: LicenseStatus;
          issue_date?: string;
          expiration_date?: string;
          renewal_date?: string | null;
          terms_accepted?: boolean;
          notes?: string | null;
          description?: string | null;
          legal_counsel_name?: string | null;
          legal_counsel_email?: string | null;
          legal_counsel_phone?: string | null;
          patent_registration?: string | null;
          created_by?: string | null;
          last_modified_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      license_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          active: boolean;
          sort_order: number;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          active?: boolean;
          sort_order?: number;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          active?: boolean;
          sort_order?: number;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      license_tiers: {
        Row: {
          id: string;
          name: string;
          code: string;
          base_price: number;
          exclusive_price_multiplier: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          base_price?: number;
          exclusive_price_multiplier?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          base_price?: number;
          exclusive_price_multiplier?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      licenciatario_change_history: {
        Row: {
          id: string;
          licenciatario_id: string;
          admin_user_id: string | null;
          field_name: string;
          old_value: string | null;
          new_value: string | null;
          change_type: "create" | "update" | "delete";
          created_at: string;
        };
        Insert: {
          id?: string;
          licenciatario_id: string;
          admin_user_id?: string | null;
          field_name: string;
          old_value?: string | null;
          new_value?: string | null;
          change_type: "create" | "update" | "delete";
          created_at?: string;
        };
        Update: {
          id?: string;
          licenciatario_id?: string;
          admin_user_id?: string | null;
          field_name?: string;
          old_value?: string | null;
          new_value?: string | null;
          change_type?: "create" | "update" | "delete";
          created_at?: string;
        };
        Relationships: [];
      };
      licenciatario_access_logs: {
        Row: {
          id: string;
          licenciatario_id: string | null;
          access_type: "login_attempt" | "portal_access" | "data_view" | "download";
          result: "success" | "denied" | "error";
          denial_reason:
            | "license_expired"
            | "license_inactive"
            | "license_not_found"
            | "account_deactivated"
            | "ip_blocked"
            | "other"
            | null;
          ip_address: string | null;
          user_agent: string | null;
          admin_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          licenciatario_id?: string | null;
          access_type: "login_attempt" | "portal_access" | "data_view" | "download";
          result: "success" | "denied" | "error";
          denial_reason?:
            | "license_expired"
            | "license_inactive"
            | "license_not_found"
            | "account_deactivated"
            | "ip_blocked"
            | "other"
            | null;
          ip_address?: string | null;
          user_agent?: string | null;
          admin_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          licenciatario_id?: string | null;
          access_type?: "login_attempt" | "portal_access" | "data_view" | "download";
          result?: "success" | "denied" | "error";
          denial_reason?:
            | "license_expired"
            | "license_inactive"
            | "license_not_found"
            | "account_deactivated"
            | "ip_blocked"
            | "other"
            | null;
          ip_address?: string | null;
          user_agent?: string | null;
          admin_notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      access_ip_blocks: {
        Row: {
          id: string;
          licenciatario_id: string | null;
          ip_address: string;
          reason: string | null;
          active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          licenciatario_id?: string | null;
          ip_address: string;
          reason?: string | null;
          active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          licenciatario_id?: string | null;
          ip_address?: string;
          reason?: string | null;
          active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      licenciatario_commercial_terms: {
        Row: {
          id: string;
          licenciatario_id: string;
          payment_model: "monthly" | "annual" | "per_container" | "per_quantity" | "custom";
          contract_type: "one_time" | "installments";
          billing_frequency: "monthly" | "quarterly" | "semiannual" | "annual" | null;
          base_tariff_amount: number;
          currency: "ARS" | "USD" | "EUR";
          usd_ars_exchange_rate: number | null;
          installments_count: number | null;
          effective_date: string;
          end_date: string | null;
          payment_due_day: number | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          licenciatario_id: string;
          payment_model: "monthly" | "annual" | "per_container" | "per_quantity" | "custom";
          contract_type?: "one_time" | "installments";
          billing_frequency?: "monthly" | "quarterly" | "semiannual" | "annual" | null;
          base_tariff_amount: number;
          currency: "ARS" | "USD" | "EUR";
          usd_ars_exchange_rate?: number | null;
          installments_count?: number | null;
          effective_date: string;
          end_date?: string | null;
          payment_due_day?: number | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          licenciatario_id?: string;
          payment_model?: "monthly" | "annual" | "per_container" | "per_quantity" | "custom";
          contract_type?: "one_time" | "installments";
          billing_frequency?: "monthly" | "quarterly" | "semiannual" | "annual" | null;
          base_tariff_amount?: number;
          currency?: "ARS" | "USD" | "EUR";
          usd_ars_exchange_rate?: number | null;
          installments_count?: number | null;
          effective_date?: string;
          end_date?: string | null;
          payment_due_day?: number | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      licenciatario_tariff_tiers: {
        Row: {
          id: string;
          commercial_terms_id: string;
          quantity_from: number;
          quantity_to: number | null;
          price_per_unit: number;
        };
        Insert: {
          id?: string;
          commercial_terms_id: string;
          quantity_from: number;
          quantity_to?: number | null;
          price_per_unit: number;
        };
        Update: {
          id?: string;
          commercial_terms_id?: string;
          quantity_from?: number;
          quantity_to?: number | null;
          price_per_unit?: number;
        };
        Relationships: [];
      };
      licenciatario_payments: {
        Row: {
          id: string;
          licenciatario_id: string;
          payment_date: string;
          amount: number;
          currency: "ARS" | "USD" | "EUR";
          payment_method: "bank_transfer" | "credit_card" | "check" | "other";
          reference: string | null;
          status: "received" | "pending" | "overdue";
          notes: string | null;
          recorded_by: string | null;
          recorded_at: string;
          fx_rate_used: number | null;
          fx_date: string | null;
          fx_reference_note: string | null;
          amount_ars_equivalent: number | null;
        };
        Insert: {
          id?: string;
          licenciatario_id: string;
          payment_date: string;
          amount: number;
          currency?: "ARS" | "USD" | "EUR";
          payment_method: "bank_transfer" | "credit_card" | "check" | "other";
          reference?: string | null;
          status?: "received" | "pending" | "overdue";
          notes?: string | null;
          recorded_by?: string | null;
          recorded_at?: string;
          fx_rate_used?: number | null;
          fx_date?: string | null;
          fx_reference_note?: string | null;
          amount_ars_equivalent?: number | null;
        };
        Update: {
          id?: string;
          licenciatario_id?: string;
          payment_date?: string;
          amount?: number;
          currency?: "ARS" | "USD" | "EUR";
          payment_method?: "bank_transfer" | "credit_card" | "check" | "other";
          reference?: string | null;
          status?: "received" | "pending" | "overdue";
          notes?: string | null;
          recorded_by?: string | null;
          recorded_at?: string;
          fx_rate_used?: number | null;
          fx_date?: string | null;
          fx_reference_note?: string | null;
          amount_ars_equivalent?: number | null;
        };
        Relationships: [];
      };
      licenciatario_documents_v2: {
        Row: {
          id: string;
          licenciatario_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          document_type: "contract" | "terms" | "compliance" | "other";
          description: string | null;
          version: number;
          is_current: boolean;
          uploaded_by: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          licenciatario_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          document_type: "contract" | "terms" | "compliance" | "other";
          description?: string | null;
          version?: number;
          is_current?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          licenciatario_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          document_type?: "contract" | "terms" | "compliance" | "other";
          description?: string | null;
          version?: number;
          is_current?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
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
