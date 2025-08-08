import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { User } from "@/types/User";

interface ProfileContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  fetchUser: (userId: number) => Promise<void>;
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
  initialUser?: User | null;
  children: ReactNode;
}

export function ProfileProvider({ initialUser = null, children }: ProfileProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);

  // Fetch user by ID and update state
  const fetchUser = async (userId: number) => {
    try {
      const response = await axios.get(`/profile`, {
        params: { user_id: userId },
      });
      console.log(response.data);
      const fetchedUser = response.data.props?.user || response.data.user;
      setUser(fetchedUser);
    } catch (error) {
      setUser(null);
      console.error("Failed to fetch user", error);
    }
  };

  // On user select, fetch and set user immediately (no reload)
  const onSelectUser = (selectedUserId: number) => {
    fetchUser(selectedUserId);
  };

  return (
    <ProfileContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        onSelectUser,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
