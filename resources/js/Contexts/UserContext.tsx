import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { UserOrGuest, User } from "@/types/User";

interface UserContextType {
  user: UserOrGuest;
  setUser: (user: UserOrGuest) => void;
  fetchUser: (userId: number) => Promise<void>;
  onSelectUser: (selectedUserId: number) => void;
  updateAvatar: (file: File) => Promise<UserOrGuest>;
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
  avatar: "",
  role: "guest",
  is_admin: false,
  phone: null,
  provider: null,
  provider_id: null,
  shippingDetails: [],
};

const LOCAL_STORAGE_KEY = "app_user";

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<UserOrGuest>(guestUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as UserOrGuest;
        setUserState(parsedUser);
        setLoading(false);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setLoading(false);
      }
    } else {
      axios
        .get("/user")
        .then((response) => {
          const loggedInUser: User | null = response.data.user;
          if (loggedInUser) {
            const loggedIn: UserOrGuest = { ...loggedInUser, isGuest: false };
            setUserState(loggedIn);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loggedIn));
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
    setUserState(user);
    if (!user.isGuest) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const fetchUser = async (userId: number) => {
    try {
      const response = await axios.get("/user", { params: { user_id: userId } });
      const fetchedUser: User = response.data.user;
      if (fetchedUser) {
        setUser({ ...fetchedUser, isGuest: false });
      }
    } catch {
      setUser(guestUser);
    }
  };

  const onSelectUser = (selectedUserId: number) => {
    fetchUser(selectedUserId);
  };

  // New function to update avatar and update user state
  const updateAvatar = async (file: File): Promise<UserOrGuest> => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await axios.post("/profile/update", formData);
      // After upload, explicitly refetch user data:
      const response = await axios.get("/user");
      const refreshedUser: UserOrGuest = { ...response.data.user, isGuest: false };
      setUser(refreshedUser);
      return refreshedUser;
    } catch (error) {
      console.error("Failed to update avatar", error);
      throw error;
    }
  };

  if (loading) {
    return <div>Loading user...</div>;
  }

  return (
    <UserContext.Provider
      value={{ user, setUser, fetchUser, onSelectUser, updateAvatar }}
    >
      {children}
    </UserContext.Provider>
  );
}
