import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import { load } from "recaptcha-v3";
import { User } from "@/types/User";

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  fetchCurrentUser: () => Promise<void>;
  fetchUserById: (userId: number) => Promise<void>;
  getRecaptchaToken: (action: string) => Promise<string>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

const LOCAL_STORAGE_KEY = "app_user";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const saveUser = useCallback((user: User | null) => {
    if (user) {
      if (import.meta.env.DEV) console.log("🔐 Saving user:", user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      if (import.meta.env.DEV) console.log("🚪 Clearing user");
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setUserState(user);
  }, []);

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    saveUser({ ...user, ...updates });
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await axios.get("/api/user");
      saveUser(res.data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [saveUser]);

  const fetchUserById = useCallback(
    async (userId: number) => {
      try {
        const res = await axios.get("/api/user", { params: { user_id: userId } });
        saveUser(res.data.user);
      } catch (err) {
        console.error(err);
      }
    },
    [saveUser]
  );

  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser));
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const getRecaptchaToken = async (action: string) => {
    const recaptcha = await load(import.meta.env.VITE_NOCAPTCHA_SITEKEY);
    return recaptcha.execute(action);
  };

  if (loading) return <div>Loading user...</div>;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: saveUser,
        updateUser,
        fetchCurrentUser,
        fetchUserById,
        getRecaptchaToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
