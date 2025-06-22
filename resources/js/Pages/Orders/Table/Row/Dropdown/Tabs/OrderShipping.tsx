import { FaTruck } from "react-icons/fa";
import ShippingStatusBadge from "../../Badges/ShippingStatusBadge";

export default function OrderShipping({ order }: { order: any }) {
  if (order.shipping_status?.toLowerCase() === "unknown") return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4">
      {/* Left: Shipping Status */}
      <div className="relative flex-1 bg-white dark:bg-[#1e2124] border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow">
        {/* Top-right box */}
        <div className="absolute top-4 right-4 flex flex-col items-center p-3 bg-white dark:bg-[#2a2e33] rounded-lg shadow-md border border-gray-300 dark:border-gray-700 w-24">
          <FaTruck className="w-15 h-15 text-black hover:text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500" />
        </div>

        <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Shipping Information
        </h5>

        {/* Status badge positioned bottom right */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-[#2a2e33] px-3 py-1 rounded shadow border border-gray-300 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status:
          </span>
          <ShippingStatusBadge status={order.shipping_status} />
        </div>

        {order.tracking_number && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <strong>Tracking Number:</strong> {order.tracking_number}
          </p>
        )}

        {order.tracking_url && (
          <a
            href={order.tracking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 text-sm"
          >
            Track Order
          </a>
        )}

        {/* Shipping Cost (safe check with toFixed) */}
        {order.shipping_cost !== undefined &&
         order.shipping_cost !== null &&
         !isNaN(Number(order.shipping_cost)) && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            <strong>Shipping Cost:</strong> £{Number(order.shipping_cost).toFixed(2)}
          </p>
        )}

        {/* Carrier info if available */}
        {order.carrier && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Carrier:</strong> {order.carrier}
          </p>
        )}
      </div>

      {/* Right: Tracking History */}
      <div className="flex-1 bg-white dark:bg-[#1e2124] border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow">
        {order.tracking_history?.length > 0 ? (
          <>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Tracking History
            </h5>
            <div className="space-y-3">
              {order.tracking_history.map((event: any, index: number) => (
                <div key={index}>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>
                      {new Date(event.status_date).toLocaleDateString("en-GB")}
                    </strong>
                    : {event.status_details} {event.location}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tracking history available.
          </p>
        )}
      </div>
    </div>
  );
}
