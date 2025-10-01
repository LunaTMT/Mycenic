export interface Timestamps {
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  expires_at?: string | null;
}
