import { FaChevronRight } from "react-icons/fa";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
import ReturnRowDropdown from "./DropDown/ReturnRowDropdown";

type ReturnRowProps = {
  returnData: {
    id: number;
    status: string;
    approved: boolean;
    completed_at: string | null;
    order_id: number;
    shipping_label_url: string | null;
    shipping_status: string | null;
    payment_status: string | null;
    created_at: string;
    updated_at: string;
  };
};

export default function ReturnRow({ returnData }: ReturnRowProps) {
  const { props } = usePage<any>();
  const auth = props.auth;

  const [isExpanded, setIsExpanded] = useState(false);

  const returnDate = new Date(returnData.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="pb-2">
      {/* Bubble container - click toggles dropdown */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full h-15 bg-white dark:bg-[#24272a] shadow-md border border-gray-300 dark:border-gray-700 p-4 flex items-center transition hover:shadow-lg cursor-pointer ${
          isExpanded ? "rounded-t-lg" : "rounded-lg"
        }`}
      >
        {/* Return ID */}
        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Return #{returnData.id}
        </div>

        {/* Chevron */}
        <FaChevronRight
          className={`mx-4 text-gray-600 dark:text-gray-300 transform transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />

        {/* Return Date aligned right */}
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {returnDate}
        </div>
      </div>

      {/* Dropdown shown when expanded */}
      <ReturnRowDropdown returnData={returnData} isExpanded={isExpanded} />
    </div>
  );
}
