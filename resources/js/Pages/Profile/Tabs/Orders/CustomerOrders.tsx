import { useState, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";
import OrderRow from "./Table/Row/OrderRow";
import { OrderProvider } from "@/Contexts/Orders/OrdersContext";
import type { Order } from "@/Contexts/Orders/OrdersContext";

type CustomerOrdersProps = {
  orders: Order[];
};

export default function CustomerOrders({ orders }: CustomerOrdersProps) {
  const { props } = usePage();
  const auth = props.auth;
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);

  // We assume orders are passed in and set loading false outside in Edit.tsx

  const filteredOrders = useMemo(() => {
    if (!searchId.trim()) return orders;
    return orders.filter((order) =>
      order.id.toString().toLowerCase().includes(searchId.toLowerCase())
    );
  }, [orders, searchId]);

  if (loading) {
    return (
      <p className="w-full h-full p-5 rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg">
        Loading orders...
      </p>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <p className="w-full h-full p-5 rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg">
        No orders found.
      </p>
    );
  }

  return (
    <OrderProvider initialOrders={orders}>
      <div className="w-full h-[85vh] rounded-lg flex flex-col gap-4 overflow-auto">
        {filteredOrders.map((order) => (
          <OrderRow key={order.id} orderId={order.id} />
        ))}
      </div>
    </OrderProvider>
  );

}
