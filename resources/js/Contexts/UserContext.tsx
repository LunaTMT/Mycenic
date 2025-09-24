// ---------------- UserContext.tsx ----------------
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { UserOrGuest, User } from "@/types/User";

interface UserContextType {
  user: UserOrGuest;
  setUser: (user: UserOrGuest) => void;
  fetchUser: (userId: number) => Promise<void>;
  onSelectUser: (selectedUserId: number) => void;
  updateAvatar: (file: File) => Promise<UserOrGuest>;
  logout: () => Promise<void>;
  setUserEmail: (email: string) => void;
  setUserPhone: (phone: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

const guestUser: UserOrGuest = {
  isGuest: true,
  id: 0,
  name: "Guest",
  email: "",
  role: "guest",
  is_admin: false,
  phone: null,
  provider: null,
  provider_id: null,
  avatar: null,
  shippingDetails: [],
};

const LOCAL_STORAGE_KEY = "app_user";

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<UserOrGuest>(guestUser);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage or server
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser) as UserOrGuest);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    } else {
      axios
        .get("/user")
        .then(res => {
          const loggedInUser: User | null = res.data.user;
          if (loggedInUser) {
            setUserState(loggedInUser);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loggedInUser));
          } else {
            setUserState(guestUser);
          }
        })
        .catch(() => {
          setUserState(guestUser);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const setUser = (user: UserOrGuest) => {
    console.log("User is being set/updated:", user); // <-- Log here
    setUserState(user);

    if (!user.isGuest) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const setUserEmail = (email: string) => {
    setUserState(prev => {
      const updated = { ...prev, email };
      if (updated.isGuest) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setUserPhone = (phone: string) => {
    setUserState(prev => {
      const updated = { ...prev, phone };
      if (updated.isGuest) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const fetchUser = async (userId: number) => {
    try {
      const res = await axios.get("/user", { params: { user_id: userId } });
      const fetchedUser: User = res.data.user;
      setUser(fetchedUser || guestUser);
    } catch {
      setUser(guestUser);
    }
  };

  const onSelectUser = (selectedUserId: number) => fetchUser(selectedUserId);

  const updateAvatar = async (file: File): Promise<UserOrGuest> => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axios.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const refreshedUser: UserOrGuest = res.data.user || guestUser;
      setUser(refreshedUser);
      return refreshedUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Upload failed");
    }
  };

  const logout = async () => {
    try {
      await axios.post("/logout");
      setUser(guestUser);
    } catch {}
  };

  if (loading) return <div>Loading user...</div>;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        onSelectUser,
        updateAvatar,
        logout,
        setUserEmail,
        setUserPhone,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
