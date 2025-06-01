export default function ShippingStatusBadge({ status }: { status: string }) {
  const upperStatus = status.toUpperCase();

  const statusColor = {
    "PRE-RETURN": "bg-purple-500",
    "DELIVERED": "bg-green-500",
    "PRE-TRANSIT": "bg-yellow-400",
    "TRANSIT": "bg-yellow-500",
    "EXCEPTION": "bg-red-500",
    "UNKNOWN": "bg-gray-600",
    "RETURNED": "bg-blue-500",
    "FAILURE": "bg-red-500",
  }[upperStatus] || "bg-gray-600";

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white uppercase ${statusColor}`}>
      {upperStatus}
    </span>
  );
}


