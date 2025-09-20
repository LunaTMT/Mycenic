import { useEffect, useState } from "react";
import { MdAccountBox } from "react-icons/md";

export default function CustomerInfo({ order }: { order: any }) {
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    if (order.customer_id) {
      fetch(`/customers/${order.customer_id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => setCustomer(data))
        .catch((err) => console.error("Failed to fetch customer", err));
    }
  }, [order.customer_id]);

  if (!customer) {
    return <p className="text-gray-600 dark:text-gray-300">Loading customer info...</p>;
  }

  const accountCreated = customer.created_at
    ? new Date(customer.created_at).toLocaleDateString("en-GB")
    : null;

  const emailVerified = customer.email_verified_at
    ? new Date(customer.email_verified_at).toLocaleDateString("en-GB")
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Basic Info */}
        <div className="flex-1 bg-white dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl p-6 relative text-gray-800 dark:text-white">
          <div className="absolute top-4 right-4 flex flex-col items-center p-3 bg-white dark:bg-[#2a2e33] rounded-lg shadow-md border border-gray-300 dark:border-gray-700 w-24">
            <MdAccountBox className="w-15 h-15 text-black hover:text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500" />
            <p className="text-sm font-semibold text-center truncate mt-1">{customer.name}</p>
          </div>

          <h4 className="text-xl font-semibold mb-4">Customer Details</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            {customer.phone && <p><strong>Phone:</strong> {customer.phone}</p>}
            {customer.email && <p><strong>Email:</strong> {customer.email}</p>}
            {emailVerified && <p><strong>Email Verified:</strong> {emailVerified}</p>}
            {customer.role && <p><strong>Role:</strong> {customer.role}</p>}
            {accountCreated && <p><strong>Account Created:</strong> {accountCreated}</p>}
          </div>
        </div>

        {/* Middle: Addresses */}
        <div className="flex-1 bg-white dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl p-6 relative text-gray-800 dark:text-white">
          <h4 className="text-xl font-semibold mb-4">Address Information</h4>
          {customer.addresses && customer.addresses.length > 0 ? (
            <div className="space-y-4">
              {customer.addresses.map((addr: any, i: number) => (
                <div key={i} className="border p-3 rounded-md bg-gray-50 dark:bg-[#2a2e33]">
                  {addr.address && <p><strong>Address:</strong> {addr.address}</p>}
                  {addr.city && <p><strong>City:</strong> {addr.city}</p>}
                  {addr.zip && <p><strong>Postcode:</strong> {addr.zip}</p>}
                  {addr.country && <p><strong>Country:</strong> {addr.country}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No saved addresses.</p>
          )}
        </div>

        {/* Right: Account & Activity */}
        <div className="flex-1 bg-white dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl p-6 relative text-gray-800 dark:text-white">
          <h4 className="text-xl font-semibold mb-4">Account & Activity</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            {customer.last_login && (
              <p><strong>Last Login:</strong> {new Date(customer.last_login).toLocaleString("en-GB")}</p>
            )}
            {customer.is_active !== undefined && (
              <p><strong>Account Status:</strong> {customer.is_active ? "Active" : "Disabled"}</p>
            )}
            {customer.orders_count !== undefined && (
              <p><strong>Total Orders:</strong> {customer.orders_count}</p>
            )}
            {customer.loyalty_points !== undefined && (
              <p><strong>Loyalty Points:</strong> {customer.loyalty_points}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
