import { FaChevronRight } from "react-icons/fa";
import { usePage } from "@inertiajs/react";
import OrderRowDropdown from "./Dropdown/OrderRowDropdown";
import { useOrderContext } from "@/Contexts/Orders/OrdersContext";
import { Order } from "@/types/Order";

interface OrderRowProps {
  orderId: number;
}

export default function OrderRow({ orderId }: OrderRowProps) {
  const {
    orders,
    expandedOrderId,
    toggleExpandedOrder,
  } = useOrderContext();

  const { props } = usePage();
  const auth = props.auth;

  const order = orders.find((o: Order) => o.id === orderId);
  if (!order) return null;

  const isExpanded = expandedOrderId === order.id;

  const orderDate = new Date(order.created_at).toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="pb-2">
      {/* Bubble container - click toggles dropdown */}
      <div
        onClick={() => toggleExpandedOrder(order.id)}
        className={`w-full bg-white dark:bg-[#424549] 
          border border-black/20 dark:border-white/20 
          h-15 p-4 flex items-center 
          transition cursor-pointer
          ${isExpanded ? "rounded-t-xl border-b-0" : "rounded-xl"}
        `}
      >
        {/* Order ID */}
        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Order #{order.id}
        </div>

        {/* Chevron */}
        <FaChevronRight
          className={`mx-4 text-gray-600 dark:text-gray-300 transform transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />

        {/* Order Date aligned right */}
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {orderDate}
        </div>
      </div>

      {/* Dropdown shown when expanded */}
      <OrderRowDropdown order={order} auth={auth} isExpanded={isExpanded} />
    </div>
  );
}
