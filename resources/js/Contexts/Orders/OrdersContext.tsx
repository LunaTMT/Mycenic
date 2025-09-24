import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../UserContext";
import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { Order } from "@/types/Order";

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  reloadOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);



  const fetchOrders = async () => {
    if (!user || user.isGuest) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching orders for user:", user.id);
      const res = await axios.get(`/orders?user_id=${user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      toast.error("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const reloadOrders = () => fetchOrders();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Memoize provider value to prevent unnecessary remounts
  const value = useMemo(() => ({ orders, loading, fetchOrders, reloadOrders }), [orders, loading]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within an OrderProvider");
  return context;
};
