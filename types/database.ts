// Hand-written to match supabase/schema.sql. Regenerate with the Supabase
// CLI once the project is linked — see supabase/README.md §5.
import type { ExteriorAudit, InteriorAudit, Recommendation, AuditCalculations } from "./audit";

export type UserRole = "admin" | "auditor";
export type AuditStatus = "draft" | "in_progress" | "completed" | "reviewed";
export type PhotoCategory =
  | "front_yard"
  | "backyard"
  | "irrigation_controller"
  | "sprinklers"
  | "leaks"
  | "toilets"
  | "showerheads"
  | "faucets"
  | "misc";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      audits: {
        Row: {
          id: string;
          home_id: string | null;
          address: string;
          homeowner_name: string | null;
          homeowner_email: string | null;
          homeowner_phone: string | null;
          builder: string | null;
          neighborhood: string | null;
          lot_number: string | null;
          auditor_id: string | null;
          audit_date: string;
          status: AuditStatus;
          exterior: ExteriorAudit;
          interior: InteriorAudit;
          recommendations: Recommendation[];
          calculations: AuditCalculations;
          notes: string | null;
          pdf_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audits"]["Row"]> & {
          address: string;
        };
        Update: Partial<Database["public"]["Tables"]["audits"]["Row"]>;
        Relationships: [];
      };
      audit_photos: {
        Row: {
          id: string;
          audit_id: string;
          category: PhotoCategory;
          storage_path: string;
          caption: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_photos"]["Row"]> & {
          audit_id: string;
          category: PhotoCategory;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_photos"]["Row"]>;
        Relationships: [];
      };
      recommendation_templates: {
        Row: {
          id: string;
          title: string;
          category: string;
          description: string | null;
          default_priority: "low" | "medium" | "high";
          estimated_gallons_saved_per_year: number | null;
          estimated_cost: number | null;
          rebate_amount: number | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["recommendation_templates"]["Row"]
        > & { title: string; category: string };
        Update: Partial<
          Database["public"]["Tables"]["recommendation_templates"]["Row"]
        >;
        Relationships: [];
      };
      settings: {
        Row: {
          id: boolean;
          water_cost_per_gallon: number;
          energy_cost_per_kwh: number;
          rebate_toilet: number;
          rebate_showerhead: number;
          rebate_smart_controller: number;
          rebate_faucet_aerator: number;
          company_logo_url: string | null;
          report_branding: Record<string, unknown>;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
