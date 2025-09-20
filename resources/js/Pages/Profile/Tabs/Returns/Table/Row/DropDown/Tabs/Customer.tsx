import { FaTruck } from "react-icons/fa";
import ShippingStatusBadge from "@/Pages/Profile/Tabs/Orders/Table/Row/Badges/ShippingStatusBadge";
import { usePage } from '@inertiajs/react';

export default function OrderShipping({ order }: { order: any }) {
  if (!order || order.shipping_status?.toLowerCase() === "unknown") return null;

  // Parse shipping details safely
  const details =
    typeof order.shipping_details === "string"
      ? JSON.parse(order.shipping_details)
      : order.shipping_details || {};

  const addressParts = [details?.address, details?.city, details?.zip, details?.country].filter(Boolean);
  const mapQuery = encodeURIComponent(addressParts.join(", "));

  // Access authenticated user data from page props (if needed)
  const { auth } = usePage().props;


  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left: Shipping Info */}
      <div className="flex-1 bg-white dark:bg-[#1e2124] rounded-lg shadow-md border border-gray-300 dark:border-gray-700 p-6 relative text-gray-800 dark:text-white">
        {/* Truck Icon */}
        <div className="absolute top-4 right-4 flex flex-col items-center p-3 bg-white dark:bg-[#2a2e33] rounded-lg shadow-md border border-gray-300 dark:border-gray-700 w-24">
          <FaTruck className="w-15 h-15 text-black hover:text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500" />
        </div>

        <div className="pr-28">
          <h4 className="text-xl font-semibold mb-4">Shipping Information</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            {details?.name && <p><strong>Name:</strong> {details.name}</p>}
            {details?.phone && <p><strong>Phone:</strong> {details.phone}</p>}
            {details?.email && <p><strong>Email:</strong> {details.email}</p>}
            {details?.address && <p><strong>Address:</strong> {details.address}</p>}
            {details?.city && <p><strong>City:</strong> {details.city}</p>}
            {details?.zip && <p><strong>Postcode:</strong> {details.zip}</p>}
            {details?.country && <p><strong>Country:</strong> {details.country}</p>}

            {order.tracking_number && (
              <p><strong>Tracking Number:</strong> {order.tracking_number}</p>
            )}

            {order.tracking_url && (
              <p>
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                >
                  Track Order
                </a>
              </p>
            )}

            {order.shipping_cost !== undefined &&
              order.shipping_cost !== null &&
              !isNaN(Number(order.shipping_cost)) && (
                <p><strong>Shipping Cost:</strong> £{Number(order.shipping_cost).toFixed(2)}</p>
              )}

            {order.carrier && (
              <p><strong>Carrier:</strong> {order.carrier}</p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-2 right-0 flex items-center gap-2 bg-white dark:bg-[#2a2e33] px-3 py-1 rounded shadow">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <ShippingStatusBadge status={order.shipping_status} />
        </div>
      </div>

      {/* Right: Map (if address exists) */}
      {addressParts.length > 0 && (
        <div className="flex-1 min-h-[250px] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
          <iframe
            title="Shipping Address Map"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
