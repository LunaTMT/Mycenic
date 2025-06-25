import { MdAccountBox } from "react-icons/md";

export default function Customer({ order }: { order: any }) {
  const addressParts = [order.address, order.city, order.zip, order.country].filter(Boolean);
  const addressQuery = encodeURIComponent(addressParts.join(", "));

  const mapSrc = addressParts.length
    ? `https://maps.google.com/maps?q=${addressQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : "";

  const accountCreated = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-GB")
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-white dark:bg-[#1e2124] rounded-lg shadow-md border border-gray-300 dark:border-gray-700 p-6 relative text-gray-800 dark:text-white">
        {/* Customer Icon & Name */}
        <div className="absolute top-4 right-4 flex flex-col items-center p-3 bg-white dark:bg-[#2a2e33] rounded-lg shadow-md border border-gray-300 dark:border-gray-700 w-24">
          <MdAccountBox className="w-15 h-15 text-black hover:text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500" />
          <p className="text-sm font-semibold text-center truncate mt-1">{order.customer_name}</p>
        </div>

        <div className="pr-28">
          <h4 className="text-xl font-semibold mb-4">Customer Details</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
   

            {order.phone && <p><strong>Phone:</strong> {order.phone}</p>}

            {order.email && <p><strong>Email:</strong> {order.email}</p>}

            {accountCreated && <p><strong>Account Created:</strong> {accountCreated}</p>}
          </div>
        </div>
      </div>

      {addressParts.length > 0 && (
        <div className="flex-1 min-h-[250px] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
          <iframe
            title="Customer Address Map"
            src={mapSrc}
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
