import { FaChevronRight } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import { Fragment } from "react";
import OrderRowDropdown from "./OrderRowDropdown";  // Import your dropdown here
import TrackingStatusBadge from "./TrackingStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

export default function OrderRow({
  order,
  auth,
  expandedOrderId,
  toggleExpandedOrder,
  toTitleCase,
  handleToggleCompleted,
}: any) {
  const isExpanded = expandedOrderId === order.id;

  return (
    <Fragment key={order.id}>
      <tr
        onClick={() => toggleExpandedOrder(order.id)}
        className={`cursor-pointer rounded-full ${
          order.is_completed && auth?.user?.role === "admin"
            ? "bg-green-400 dark:bg-green-900"
            : "bg-white/70 dark:bg-[#424549]/10"
        }`}
      >
        <td className="px-6 py-4 text-center h-16">{order.id}</td>
        <td className="px-6 py-4 text-center h-16">£{order.total}</td>
        <td className="px-6 py-4 text-center h-16">
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
              order.shipping_status === "Pre_transit"
                ? "bg-gray-400"
                : order.shipping_status === "Transit"
                ? "bg-yellow-500"
                : order.shipping_status === "Delivered"
                ? "bg-green-500"
                : order.shipping_status === "Returned"
                ? "bg-blue-500"
                : order.shipping_status === "Failure"
                ? "bg-red-500"
                : "bg-gray-600"
            }`}
          >
            {toTitleCase(order.shipping_status)}
          </span>
        </td>
        <td className="px-6 py-4 text-center h-16">
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
              order.payment_status === "Pending"
                ? "bg-yellow-500"
                : order.payment_status === "Shipped"
                ? "bg-blue-500"
                : order.payment_status === "Delivered" || order.payment_status === "Completed"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          >
            {toTitleCase(order.payment_status)}
          </span>
        </td>
        <td className="px-6 py-4 text-center h-16">
          {new Date(order.created_at).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </td>
        {auth?.user?.role === "admin" && (
          <td className="px-6 py-4 text-center flex justify-center items-center h-16">
            <input
              type="checkbox"
              checked={order.is_completed}
              onChange={() => handleToggleCompleted(order.id)}
              className="form-checkbox h-6 w-6 text-green-600"
              onClick={e => e.stopPropagation()} // Prevent toggle on checkbox click
            />
          </td>
        )}
        <td className="p-3 mx-auto h-16">
          <FaChevronRight
            className={`dark:text-white transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </td>
      </tr>

      {/* Replace the previous AnimatePresence content with your dropdown */}
      <OrderRowDropdown order={order} auth={auth} isExpanded={isExpanded} />
    </Fragment>
  );
}
