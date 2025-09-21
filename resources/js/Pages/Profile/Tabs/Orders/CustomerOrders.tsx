import { useEffect, useState } from "react";
import OrderRow from "./Table/Row/OrderRow";
import { OrderProvider } from "@/Contexts/Orders/OrdersContext";
import { Order } from "@/types/Order";

interface CustomerOrdersProps {
  orders: Order[];
}

export default function CustomerOrders({ orders: initialOrders }: CustomerOrdersProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  console.log(orders);


  if (!orders || orders.length === 0) {
    return (
      <p className="w-full h-full p-5 rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg">
        No orders found.
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
