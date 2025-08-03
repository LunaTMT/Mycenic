import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { User } from "@/types/types";

interface ProfileContextType {
  user: User;
  setUser: (user: User) => void;
  orders: any[] | null;
  loadingOrders: boolean;
  ordersError: string | null;
  onSelectUser: (selectedUserId: number) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

interface ProfileProviderProps {
  initialUser: User;
  children: ReactNode;
}

export function ProfileProvider({ initialUser, children }: ProfileProviderProps) {
  const [user, setUser] = useState<User>(initialUser);

  const [orders, setOrders] = useState<any[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingOrders(true);
    setOrdersError(null);

    axios
      .get("/orders")
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => {
        setOrders([]);
        setOrdersError("Failed to load orders. Please try again later.");
      })
      .finally(() => setLoadingOrders(false));
  }, []);

  const onSelectUser = (selectedUserId: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("user_id", selectedUserId.toString());
    window.location.href = url.toString();
  };

  return (
    <ProfileContext.Provider
      value={{
        user,
        setUser,
        orders,
        loadingOrders,
        ordersError,
        onSelectUser,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
