import { Fragment, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { usePage } from "@inertiajs/react";
import ShippingStatusBadge from "@/Pages/Orders/Table/Row/Badges/ShippingStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import ReturnStatusBadge from "@/Pages/Orders/Table/Row/Badges/ReturnStatusBadge";
import ReturnRowDropdown from "./ReturnRowDropdown";

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
  const { props } = usePage<any>();
  const auth = props.auth;
  const isAdmin = auth?.user?.role === "admin";

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Fragment key={returnData.id}>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className={`cursor-pointer rounded-full ${
          returnData.approved && isAdmin
            ? "bg-green-400 dark:bg-green-900"
            : "bg-white/70 dark:bg-[#424549]/10"
        }`}
      >
        <td className="px-6 py-4 text-center h-16">{returnData.id}</td>
        <td className="px-6 py-4 text-center h-16">
          <ReturnStatusBadge status={returnData.status} />
        </td>
        <td className="px-6 py-4 text-center h-16">
          <ShippingStatusBadge status={returnData.shipping_status ?? "UNKNOWN"} />
        </td>
        <td className="px-6 py-4 text-center h-16">
          <PaymentStatusBadge status={returnData.payment_status ?? "UNKNOWN"} />
        </td>
        <td className="px-6 py-4 text-center h-16">
          {returnData.completed_at
            ? new Date(returnData.completed_at).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—"}
        </td>
        <td className="p-3 mx-auto h-16">
          <FaChevronRight
            className={`dark:text-white transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </td>
      </tr>

      <ReturnRowDropdown
        returnData={returnData}

        isExpanded={isExpanded}
      />
    </Fragment>
  );
}
