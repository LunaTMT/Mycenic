import { Address } from "./Address";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  is_admin: boolean;
  phone?: string | null;
  provider?: string | null;
  provider_id?: string | null;
  addresses?: Address[];
}
