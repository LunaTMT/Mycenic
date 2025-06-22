import PaymentStatusBadge from "../../Badges/PaymentStatusBadge";
import ShippingStatusBadge from "../../Badges/ShippingStatusBadge";
import ReturnableStatusBadge from "../../Badges/ReturnableStatusBadge"; // Import your new badge

const statusItems = [
  {
    label: "Payment Status",
    valueKey: "payment_status",
    BadgeComponent: PaymentStatusBadge,
  },
  {
    label: "Shipping Status",
    valueKey: "shipping_status",
    BadgeComponent: ShippingStatusBadge,
  },
  {
    label: "Returnable Status",
    valueKey: "returnable",
    BadgeComponent: ReturnableStatusBadge,
  },
];

export function OrderStatuses({ order }: { order: any }) {
  return (
    <div className="w-full bg-white dark:bg-[#1e2124] border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow space-y-4 text-md text-gray-700 dark:text-gray-300">
      {statusItems.map(({ label, valueKey, BadgeComponent }) => {
        const statusValue = order[valueKey];
        return (
          <div
            key={valueKey}
            className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0"
          >
            <span className="font-semibold">{label}:</span>
            {statusValue !== undefined && statusValue !== null ? (
              <BadgeComponent
                {...(valueKey === "returnable"
                  ? { returnable: statusValue }
                  : { status: statusValue })}
              />
            ) : (
              <span>N/A</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
