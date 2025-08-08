import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { UserOrGuest, User } from "@/types/User";

interface UserContextType {
  user: UserOrGuest;
  setUser: (user: UserOrGuest) => void;
  fetchUser: (userId: number) => Promise<void>;
  onSelectUser: (selectedUserId: number) => void;
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

// Define guest user default
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
  console.log(user);

  // Load user from localStorage or fetch from backend
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
      // No saved user, fetch logged-in user
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
        .catch((error) => {
          console.error("Failed to load logged-in user", error);
          setUserState(guestUser);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // Wrap setUser to sync localStorage
  const setUser = (user: UserOrGuest) => {
    setUserState(user);
    if (!user.isGuest) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Fetch arbitrary user by ID and update state + localStorage
  const fetchUser = async (userId: number) => {
    try {
      const response = await axios.get("/user", { params: { user_id: userId } });
      const fetchedUser: User = response.data.user;
      if (fetchedUser) {
        setUser({ ...fetchedUser, isGuest: false });
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
      setUser(guestUser);
    }
  };

  const onSelectUser = (selectedUserId: number) => {
    fetchUser(selectedUserId);
  };

  if (loading) {
    return <div>Loading user...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser, onSelectUser }}>
      {children}
    </UserContext.Provider>
  );
}
