import { Link, usePage } from "@inertiajs/react";
import ShippingStatusBadge from "@/Pages/Orders/Table/Row/ShippingStatusBadge";

import PaymentStatusBadge from "./PaymentStatusBadge";
import ReturnStatusBadge from "@/Pages/Orders/Table/Row/ReturnStatusBadge";

type ReturnRowProps = {
  returnData: {
    id: number;
    status: string;
    approved: boolean;
    completed_at: string | null;
    order_id: number;
    shipping_label_url: string | null;
    shipping_status: string | null;
    payment_status: string | null;
    created_at: string;
    updated_at: string;
  };
};

export default function ReturnRow({ returnData }: ReturnRowProps) {
  const { props } = usePage();
  const auth = props.auth;
  const isAdmin = auth?.user?.role === "admin";

  const {
    id,
    status,
    approved,
    completed_at,
    order_id,
    shipping_label_url,
    shipping_status,
    payment_status,
  } = returnData;

  return (
    <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition">
      <td className="py-3 px-2 text-center">{id}</td>
      <td className="py-3 px-2 text-center">
        <ReturnStatusBadge status={status} />
      </td>
      <td className="py-3 px-2 text-center">
        <ShippingStatusBadge status={shipping_status ?? "UNKNOWN"} />
      </td>
      <td className="py-3 px-2 text-center">
        <PaymentStatusBadge status={payment_status} />
      </td>
      <td className="py-3 px-2 text-center">
        {completed_at ? new Date(completed_at).toLocaleDateString() : "—"}
      </td>
      <td className="py-3 px-2 text-center">
        {shipping_label_url ? (
          <a
            href={shipping_label_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Label
          </a>
        ) : (
          "—"
        )}
      </td>
      {isAdmin && (
        <td className="py-3 px-2 text-center">
          {/* Admin-only info can go here */}
        </td>
      )}
      <td className="py-3 px-2 text-center">
        <Link href={`/returns/${id}`} className="text-blue-500 hover:underline">
          View
        </Link>
      </td>
    </tr>
  );
}
