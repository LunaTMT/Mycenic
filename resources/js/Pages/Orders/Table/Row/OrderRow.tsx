import { FaChevronRight } from "react-icons/fa";
import { Fragment } from "react";
import OrderRowDropdown from "./OrderRowDropdown";
import { usePage } from "@inertiajs/react";
import { useOrderContext } from "@/Contexts/OrdersContext";

import PaymentStatusBadge from "./PaymentStatusBadge";
import ShippingStatusBadge from "./ShippingStatusBadge";
import ReturnStatusBadge from "./ReturnStatusBadge";

export default function OrderRow({ orderId }: { orderId: number }) {
  const {
    orders,
    hasReturnStatus,
    expandedOrderId,
    toggleExpandedOrder,
    handleToggleCompleted,
  } = useOrderContext();

  const { props } = usePage();
  const auth = props.auth;

  const order = orders.find((o: any) => o.id === orderId);
  if (!order) return null;

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
          <ShippingStatusBadge status={order.shipping_status} />
        </td>
        <td className="px-6 py-4 text-center h-16">
          <PaymentStatusBadge status={order.payment_status} />
        </td>
        {hasReturnStatus && (
          <td className="px-6 py-4 text-center h-16">
            <ReturnStatusBadge status={order.return_status} />
          </td>
        )}
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
              onClick={(e) => e.stopPropagation()}
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
      <OrderRowDropdown order={order} auth={auth} isExpanded={isExpanded} />
    </Fragment>
  );
}
