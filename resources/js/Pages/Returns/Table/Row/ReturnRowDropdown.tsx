import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@inertiajs/react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";

type ReturnRowDropdownProps = {
  returnData: any;
  isExpanded: boolean;
};

export default function ReturnRowDropdown({ returnData, isExpanded }: ReturnRowDropdownProps) {
  if (!isExpanded || !returnData) return null;

  const returnDetails = returnData;

  // Ensure items is an array and fallback safely
  const items: any[] = Array.isArray(returnDetails.items) ? returnDetails.items : [];

  return (
    <AnimatePresence>
      <motion.tr
        key={`dropdown-${returnData.id}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <td colSpan={6} className="bg-white w-full dark:bg-[#1e2124]">
          <div className="p-4 flex gap-10">
            <div className="w-full">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
                Return Items
              </h2>

              {items.map((item: any) => {
                const price = item.price ?? 0;
                const quantity = item.quantity ?? 0;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between gap-4 pb-2"
                  >
                    <Link href={`/item/${item.id}`} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-md object-cover cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-md font-semibold dark:text-white">{item.name}</p>
                        <p className="text-sm">
                          {quantity} × £{price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                    <p className="text-md font-semibold dark:text-white">
                      £{(quantity * price).toFixed(2)}
                    </p>
                  </motion.div>
                );
              })}

              <div className="mt-4 pt-2 border-t border-black/30 dark:border-white/40 flex justify-between text-md dark:text-white font-semibold">
                <span>Return Status:</span>
                <span>{returnDetails.status}</span>
              </div>

              <div className="mt-2 flex justify-between text-md dark:text-white">
                <span>Approved:</span>
                <span>{returnDetails.approved ? "Yes" : "No"}</span>
              </div>

              {returnDetails.completed_at && (
                <div className="mt-2 flex justify-between text-md dark:text-white">
                  <span>Completed At:</span>
                  <span>{new Date(returnDetails.completed_at).toLocaleDateString()}</span>
                </div>
              )}

              {returnDetails.shipping_label_url && (
                <div className="mt-4">
                  <a
                    href={returnDetails.shipping_label_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                  >
                    Download Shipping Label
                  </a>
                </div>
              )}
            </div>
          </div>
        </td>
      </motion.tr>
    </AnimatePresence>
  );
}
