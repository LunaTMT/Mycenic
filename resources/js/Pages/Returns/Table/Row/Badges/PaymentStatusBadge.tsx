export default function PaymentStatusBadge({ status }: { status: string | null | undefined }) {
  const upperStatus = (status ?? "").toUpperCase();

  if (upperStatus === "" || upperStatus === "UNKNOWN") {
    return <span>-</span>;
  }

  const statusColor = {
    "PRE-RETURN": "bg-purple-500",
    "PAID": "bg-green-500",
    "PENDING": "bg-yellow-500",
    "FAILED": "bg-red-500",
    "REFUNDED": "bg-blue-500",
    "DECLINED": "bg-red-600",
  }[upperStatus] || "bg-gray-500";

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white uppercase ${statusColor}`}>
      {upperStatus}
    </span>
  );
}
