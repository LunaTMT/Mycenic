import { createContext, useContext, useState, ReactNode } from "react";

export type ReturnStatus = "pending" | "approved" | "rejected" | "completed"; // example statuses

export type Return = {
  id: number;
  status: ReturnStatus;
  updated_at: string; // ISO date string
  productId?: number;
  created_at?: string;
};

// 1. Define context shape
type ReturnContextType = {
  returns: Return[];
  updateReturnStatus: (id: number, status: Return["status"]) => void;
};

// 2. Create the context
export const ReturnContext = createContext<ReturnContextType | undefined>(undefined);

// 3. Hook to access the context
export const useReturnContext = () => {
  const context = useContext(ReturnContext);
  if (!context) throw new Error("useReturnContext must be used within ReturnProvider");
  return context;
};

// 4. Provider props type with initialReturns and children
type ReturnProviderProps = {
  initialReturns: Return[];
  children?: ReactNode;
};

// 5. Provider component
export function ReturnProvider({ initialReturns, children }: ReturnProviderProps) {
  const [returns, setReturns] = useState<Return[]>(initialReturns);

  const updateReturnStatus = (id: number, status: Return["status"]) => {
    setReturns((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r
      )
    );

    // Optional: backend call to persist the status update can go here
  };

  return (
    <ReturnContext.Provider value={{ returns, updateReturnStatus }}>
      {children}
    </ReturnContext.Provider>
  );
}
