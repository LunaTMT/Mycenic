import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { router, usePage } from "@inertiajs/react";
import Swal from "sweetalert2";
import type { PageProps } from "@/types";

export type Order = {
  id: number;
  user_id: number;
  total: number;
  subtotal: number;
  shipping_cost: number;
  weight: number;
  discount: number;
  payment_status: string;
  shipping_status: string;
  carrier: string;
  tracking_number: string;
  tracking_url: string;
  customer_name: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  is_completed: boolean;
  returnable: boolean;
  return_status: string;
  created_at: string;
  updated_at: string;
  cart: any[];
  tracking_history: any[];
};

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  expandedOrderId: number | null;
  toggleExpandedOrder: (id: number) => void;
  toTitleCase: (s: string) => string;
  handleToggleCompleted: (id: number) => void;
  trackingInfo: { [orderId: number]: any };
  fetchTrackingInfo: (id: number, carrier: string, trackingNumber: string) => void;
  hasReturnStatus: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
};

export const OrderProvider = ({
  children,
  initialOrders = [],
}: {
  children: React.ReactNode;
  initialOrders?: Order[];
}) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<{ [orderId: number]: any }>({});
  const { orders: serverOrders } = usePage<PageProps>().props;

  // Sync with server orders on mount or serverOrders change only if no initialOrders passed (optional)
  useEffect(() => {
    if (!initialOrders.length && serverOrders) {
      setOrders(serverOrders);
      setLoading(false);
    } else if (initialOrders.length) {
      setLoading(false);
    }
  }, [serverOrders, initialOrders]);

  const toggleExpandedOrder = (id: number) => {
    setExpandedOrderId((prevId) => (prevId === id ? null : id));
  };

  const fetchTrackingInfo = async (
    orderId: number,
    carrier: string,
    trackingNumber: string
  ) => {
    try {
      const response = await fetch(`/orders/track/${carrier}/${trackingNumber}`);
      const data = await response.json();
      if (response.ok) {
        setTrackingInfo((prev) => ({ ...prev, [orderId]: data }));
      } else {
        Swal.fire("Error", "Unable to fetch tracking information.", "error");
      }
    } catch (error) {
      console.error("Error fetching tracking info:", error);
      Swal.fire("Error", "Something went wrong while fetching tracking info.", "error");
    }
  };

  const toTitleCase = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleToggleCompleted = (orderId: number) => {
    router.post(
      `/orders/${orderId}/toggle-completed`,
      {},
      {
        onSuccess: () => {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === orderId
                ? { ...order, is_completed: !order.is_completed }
                : order
            )
          );
        },
        onError: () => {
          Swal.fire("Error", "Failed to update order status.", "error");
        },
        preserveScroll: true,
        preserveState: true,
      }
    );
  };

  const hasReturnStatus = useMemo(() => {
    return orders.some((order) => order.return_status !== "UNKNOWN");
  }, [orders]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        expandedOrderId,
        toggleExpandedOrder,
        toTitleCase,
        handleToggleCompleted,
        trackingInfo,
        fetchTrackingInfo,
        hasReturnStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
