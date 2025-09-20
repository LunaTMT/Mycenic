export default function TrackingStatusBadge({ status, toTitleCase }: { status: string, toTitleCase: (s: string) => string }) {
  const statusColor = {
    Pre_transit: "bg-gray-400",
    Transit: "bg-yellow-500",
    Delivered: "bg-green-500",
    Returned: "bg-blue-500",
    Failure: "bg-red-500",
    Unknown: "bg-gray-600",
  }[status] || "bg-gray-600";

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${statusColor}`}>
      {toTitleCase(status)}
    </span>
  );
}
