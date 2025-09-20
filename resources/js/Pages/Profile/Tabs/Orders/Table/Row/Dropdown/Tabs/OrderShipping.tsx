import { FaTruck } from "react-icons/fa";
import ShippingStatusBadge from "../../Badges/ShippingStatusBadge";

export default function OrderShipping({ order }: { order: any }) {
  if (order.shipping_status?.toLowerCase() === "unknown") return null;

  const details =
    typeof order.shipping_details === "string"
      ? JSON.parse(order.shipping_details)
      : order.shipping_details;

  const addressParts = [details?.address, details?.city, details?.zip, details?.country].filter(Boolean);
  const mapQuery = encodeURIComponent(addressParts.join(", "));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Shipping Info */}
        <div className="flex-1 bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl p-6 relative text-gray-800 dark:text-white">
          <div className="absolute top-4 right-4 flex flex-col items-center p-3 bg-white dark:bg-[#2a2e33] rounded-lg shadow-md border border-gray-300 dark:border-gray-700 w-24">
            <FaTruck className="w-15 h-15 text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500" />
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
              {order.tracking_number && <p><strong>Tracking Number:</strong> {order.tracking_number}</p>}
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
              {order.shipping_cost !== undefined && (
                <p><strong>Shipping Cost:</strong> £{Number(order.shipping_cost).toFixed(2)}</p>
              )}
              {order.carrier && <p><strong>Carrier:</strong> {order.carrier}</p>}
            </div>
          </div>

          <div className="absolute bottom-2 right-0 flex items-center gap-2 bg-white dark:bg-[#2a2e33] px-3 py-1 rounded shadow">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <ShippingStatusBadge status={order.shipping_status} />
          </div>
        </div>

        {/* Right: Tracking History */}
        <div className="flex-1 bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl p-6 text-gray-800 dark:text-white max-h-[300px] overflow-y-auto">
          <h4 className="text-xl font-semibold mb-4">Tracking Information</h4>
          {order.tracking_history?.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {order.tracking_history.map((event: any, index: number) => (
                <li key={index} className="border-l-4 border-blue-500 pl-3">
                  <p>
                    <strong>{new Date(event.status_date).toLocaleDateString("en-GB")}</strong> – {event.status_details}
                    {event.location && ` @ ${event.location}`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No tracking history available.</p>
          )}
        </div>
      </div>

      {addressParts.length > 0 && (
        <div className="w-full min-h-[300px] rounded-xl overflow-hidden border border-black/20 dark:border-white/20 shadow">
          <iframe
            title="Shipping Address Map"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="300"
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
