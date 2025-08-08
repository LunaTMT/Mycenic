import { useEffect, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import OrderRow from "./Table/Row/OrderRow";
import { OrderProvider } from "@/Contexts/Orders/OrdersContext";
import { Order } from "@/types/Order";
import { useUser } from "@/Contexts/UserContext";

export default function CustomerOrders() {
  const { props } = usePage();
  const auth = props.auth;

  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const res = await axios.get("/orders/fetch", {
          params: { user_id: user.id },
          headers: {
            Accept: "application/json",
          },
        });
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <p className="w-full h-full p-5 rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg">
        Loading orders...
      </p>
    );
  }

  return (
    <OrderProvider initialOrders={orders}>
      <div className="w-full h-[85vh] rounded-lg flex flex-col gap-4 overflow-auto">
        {orders.map((order) => (
          <OrderRow key={order.id} orderId={order.id} />
        ))}
      </div>
    </OrderProvider>
  );
}
