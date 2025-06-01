import { motion } from "framer-motion";
import { usePage } from "@inertiajs/react";
import OrderRow from "./Row/OrderRow";

import type { Order } from "@/Contexts/OrdersContext";

type OrderTableProps = {
  orders: Order[];
};

export default function OrderTable({ orders }: OrderTableProps) {
  const { props } = usePage();
  const auth = props.auth;

  // Check if at least one order has return_status other than "UNKNOWN"
  const hasReturnStatus = orders.some(order => order.return_status !== "UNKNOWN");

  return (
    <motion.div className="w-full h-full overflow-hidden rounded-xl shadow-lg border border-black/20 dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200">
      <table className="w-full">
        <thead className="text-black bg-white dark:bg-[#1e2124] dark:text-white">
          <tr>
            <th className="py-3">ID</th>
            <th className="py-3">Total</th>
            <th className="py-3">Shipping status</th>
            <th className="py-3">Payment status</th>
            {hasReturnStatus && <th className="py-3">Return status</th>}
            <th className="py-3">Date</th>
            {auth?.user?.role === "admin" && <th className="py-3">Completed</th>}
            <th className="py-3 text-center align-middle"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-black/20 dark:divide-white/20">
          {orders.map((order) => (
            <OrderRow key={order.id} orderId={order.id} />
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

