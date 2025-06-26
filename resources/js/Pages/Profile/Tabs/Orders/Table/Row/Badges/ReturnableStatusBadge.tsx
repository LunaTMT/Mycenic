import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ReturnableStatusBadge({ returnable }: { returnable: boolean }) {
  return returnable ? (
    <span
      className="inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-md shadow-sm uppercase tracking-wide transition-colors duration-300 bg-green-600 text-green-100 select-none"
      title="Returnable"
    >
      <FaCheckCircle className="inline mr-2" size={14} />
      Returnable
    </span>
  ) : (
    <span
      className="inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-md shadow-sm uppercase tracking-wide transition-colors duration-300 bg-red-600 text-red-100 select-none"
      title="Not Returnable"
    >
      <FaTimesCircle className="inline mr-2" size={14} />
      Not Returnable
    </span>
  );
}
