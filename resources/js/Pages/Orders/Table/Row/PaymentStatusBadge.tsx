export default function PaymentStatusBadge({ status, toTitleCase }: { status: string, toTitleCase: (s: string) => string }) {
  const statusColor = {
    Pending: "bg-yellow-500",
    Shipped: "bg-blue-500",
    Delivered: "bg-green-500",
    Completed: "bg-green-500",
    Cancelled: "bg-red-500",
  }[status] || "bg-red-500";

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${statusColor}`}>
      {toTitleCase(status)}
    </span>
  );
}
