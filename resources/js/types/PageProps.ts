import { User } from "./User";

export interface PageProps {
  auth: {
    user: User | null;
  };
  flash: {
    success?: string;
    error?: string;
    message?: string;
  };
}
