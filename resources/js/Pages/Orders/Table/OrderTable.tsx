import { motion } from "framer-motion";
import OrderRow from "./Row/OrderRow";
import type { Order } from "@/types";

export default function OrderTable({
  orders,
  auth,
  expandedOrderId,
  toggleExpandedOrder,
  toTitleCase,
  handleToggleCompleted,
  trackingInfo,
  fetchTrackingInfo,
}: {
  orders: Order[];
  auth: any;
  expandedOrderId: number | null;
  toggleExpandedOrder: (id: number) => void;
  toTitleCase: (s: string) => string;
  handleToggleCompleted: (id: number) => void;
  trackingInfo: any;
  fetchTrackingInfo: (id: number, carrier: string, trackingNumber: string) => void;
}) {
  return (
    <motion.div className="w-full h-full overflow-hidden rounded-xl shadow-lg border border-black/20 dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200">
      <table className="w-full ">
          <thead className="text-black bg-white dark:bg-[#1e2124] dark:text-white">
            <tr>
              <th className="py-3">ID</th>
              <th className="py-3">Total</th>
              <th className="py-3">Shipping status</th>
              <th className="py-3">Payment status</th>
              <th className="py-3">Date</th>
              {auth?.user?.role === 'admin' && <th className="py-3">Completed</th>}
              <th className="py-3 text-center align-middle"></th>
            </tr>
          </thead>
        
        <tbody className="divide-y divide-black/20 dark:divide-white/20">
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={auth?.user?.role === "admin" ? 7 : 6}
                className="text-center py-8 text-gray-500 italic"
              >
                No orders found.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                auth={auth}
                expandedOrderId={expandedOrderId}
                toggleExpandedOrder={toggleExpandedOrder}
                toTitleCase={toTitleCase}
                handleToggleCompleted={handleToggleCompleted}
                trackingInfo={trackingInfo}
                fetchTrackingInfo={fetchTrackingInfo}
              />
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
}
