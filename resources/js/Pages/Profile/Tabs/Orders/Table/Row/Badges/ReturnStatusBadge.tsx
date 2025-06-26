export default function ReturnStatusBadge({ status }: { status: string | null | undefined }) {
  // Use optional chaining and default to empty string to avoid error
  const upperStatus = (status ?? "").toUpperCase();

  if (upperStatus === "UNKNOWN" || upperStatus === "") {
    return <span>-</span>;
  }

  const statusColor = {
    "PRE-RETURN": "bg-purple-500",
    REQUESTED: "bg-yellow-500",
    APPROVED: "bg-green-500",
    PROCESSING: "bg-blue-500",
    REFUNDED: "bg-indigo-500",
    DECLINED: "bg-red-500",
    COMPLETED: "bg-green-700",
  }[upperStatus] || "bg-indigo-500";

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white uppercase ${statusColor}`}>
      {upperStatus}
    </span>
  );
}
