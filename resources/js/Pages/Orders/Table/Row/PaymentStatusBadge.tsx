export default function PaymentStatusBadge({ status }: { status: string }) {
  const upperStatus = status.toUpperCase();

  const statusColor = {
    "PRE-RETURN": "bg-purple-500",
    PENDING: "bg-yellow-500",
    SHIPPED: "bg-blue-500",
    DELIVERED: "bg-green-500",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-red-500",
  }[upperStatus] || "bg-red-500";

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white uppercase ${statusColor}`}>
      {upperStatus}
    </span>
  );
}
