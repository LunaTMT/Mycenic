import { FaTruck } from "react-icons/fa";
import ShippingStatusBadge from "@/Pages/Orders/Table/Row/Badges/ShippingStatusBadge";

type ShippingProps = { returnData: any };

export default function Shipping({ returnData }: ShippingProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4 w-full">
      <div
        className="
          relative
          flex flex-col
          flex-1 bg-white dark:bg-[#1e2124]
          border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow min-h-45
        "
      >
        {/* Truck icon absolute top-right */}
        <div className="absolute top-4 right-4 flex flex-col items-center p-3 bg-white dark:bg-[#2a2e33] rounded-lg shadow-md border border-gray-300 dark:border-gray-700 w-24">
          <FaTruck className="w-15 h-15 hover:scale-110 text-black dark:text-slate-300 transition-transform duration-500" />
        </div>

        {/* Text content container */}
        <div className="flex-grow">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Shipping Information
          </h5>

          {returnData.tracking_number && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>Tracking Number:</strong> {returnData.tracking_number}
            </p>
          )}
          {returnData.tracking_url && (
            <a
              href={returnData.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 text-sm"
            >
              Track Order
            </a>
          )}
          {returnData.shipping_cost != null &&
            !isNaN(Number(returnData.shipping_cost)) && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <strong>Shipping Cost:</strong> £
                {Number(returnData.shipping_cost).toFixed(2)}
              </p>
            )}
          {returnData.carrier && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Carrier:</strong> {returnData.carrier}
            </p>
          )}
        </div>

        {/* Badge at bottom right */}
        <div className="flex justify-end pt-4">
          <ShippingStatusBadge status={returnData.shipping_status} />
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-[#1e2124] border rounded-lg p-4 shadow">
        {returnData.tracking_history?.length > 0 ? (
          <>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Tracking History
            </h5>
            <div className="space-y-3">
              {returnData.tracking_history.map((event: any, idx: number) => (
                <p
                  key={idx}
                  className="text-sm text-gray-600 dark:text-gray-300"
                >
                  <strong>
                    {new Date(event.status_date).toLocaleDateString("en-GB")}
                  </strong>
                  : {event.status_details} {event.location}
                </p>
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
