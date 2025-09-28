export interface PromoCode {
  id: number;
  code: string;
  discount: number;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}
