import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";
import { load } from "recaptcha-v3";
import { User } from "@/types/User";

interface UserContextType {
  user: User; // never null
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  fetchCurrentUser: () => Promise<void>;
  fetchUserById: (userId: number) => Promise<void>;
  getRecaptchaToken: (action: string) => Promise<string>;
}

const USER_STORAGE_KEY = "current_user";

const UserContext = createContext<UserContextType | undefined>(undefined);
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const getInitialUser = (): User => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as User;
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    // Default guest user
    return {
      id: 0,
      name: "Loading...",
      email: "",
      role: "guest",
      phone: null,
      addresses: [],
      avatar: null,
      active_cart: null,
      checked_out_carts: [],
      is_admin: false,
      is_guest: true,
    };
  };

  const [user, setUserState] = useState<User>(getInitialUser);

  const saveUser = useCallback((user: User) => {
    console.log("User : ", user);
    setUserState(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }, []);

  const updateUser = (updates: Partial<User>) => {
    setUserState(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await axios.get("/user");
      saveUser(res.data.user);
    } catch (err) {
      console.error("Error fetching user", err);
    }
  }, [saveUser]);

  const fetchUserById = useCallback(async (userId: number) => {
    try {
      const res = await axios.get("/user", { params: { user_id: userId } });
      saveUser(res.data.user);
    } catch (err) {
      console.error("Error fetching user by id", err);
    }
  }, [saveUser]);



  const getRecaptchaToken = async (action: string) => {
    const recaptcha = await load(import.meta.env.VITE_NOCAPTCHA_SITEKEY);
    return recaptcha.execute(action);
  };

  return (
    <UserContext.Provider
      value={{ user, setUser: saveUser, updateUser, fetchCurrentUser, fetchUserById, getRecaptchaToken }}
    >
      {children}
    </UserContext.Provider>
  );
}
