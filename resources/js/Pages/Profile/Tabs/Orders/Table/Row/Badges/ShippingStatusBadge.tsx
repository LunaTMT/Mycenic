import { FaCheckCircle, FaTimesCircle, FaTruck, FaExclamationTriangle, FaSpinner, FaUndoAlt } from "react-icons/fa";

export default function ShippingStatusBadge({ status }: { status: string }) {
  const upperStatus = status.toUpperCase();

  // Define color classes and icons for each shipping status
  const statusMap: Record<
    string,
    { bg: string; text: string; icon?: JSX.Element }
  > = {
    "PRE-RETURN": {
      bg: "bg-purple-600",
      text: "text-purple-100",
      icon: <FaUndoAlt className="inline mr-3" size={14} />,
    },
    "DELIVERED": {
      bg: "bg-green-600",
      text: "text-green-100",
      icon: <FaCheckCircle className="inline mr-3" size={14} />,
    },
    "PRE-TRANSIT": {
      bg: "bg-yellow-400",
      text: "text-yellow-900",
      icon: <FaSpinner className="inline mr-3 animate-spin" size={14} />,
    },
    "TRANSIT": {
      bg: "bg-yellow-500",
      text: "text-yellow-900",
      icon: <FaTruck className="inline mr-3" size={14} />,
    },
    "EXCEPTION": {
      bg: "bg-red-600",
      text: "text-red-100",
      icon: <FaExclamationTriangle className="inline mr-3" size={14} />,
    },
    "RETURNED": {
      bg: "bg-blue-600",
      text: "text-blue-100",
      icon: <FaUndoAlt className="inline mr-3" size={14} />,
    },
    "FAILURE": {
      bg: "bg-red-600",
      text: "text-red-100",
      icon: <FaTimesCircle className="inline mr-3" size={14} />,
    },
    "UNKNOWN": {
      bg: "bg-gray-600",
      text: "text-gray-100",
      icon: <FaExclamationTriangle className="inline mr-3" size={14} />,
    },
  };

  const { bg, text, icon } = statusMap[upperStatus] || {
    bg: "bg-gray-600",
    text: "text-gray-100",
  };

  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-md shadow-sm uppercase tracking-wide transition-colors duration-300 ${bg} ${text} select-none`}
      title={upperStatus.replace(/_/g, " ")}
    >
      {icon}
      {upperStatus.replace(/_/g, " ")}
    </span>
  );
}
