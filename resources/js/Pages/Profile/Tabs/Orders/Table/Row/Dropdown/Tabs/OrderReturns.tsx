import React, { useEffect, useState } from "react";
import { ReturnInstructionProvider } from "@/Contexts/Orders/ReturnInstructionContext";
import ReturnItemTable from "../../../../Return/StepNavigator/Steps/Table/ReturnItemTable";
import StepNavigator from "../../../../Return/StepNavigator/StepNavigator";

function getTimeRemaining(createdAt: string) {
  const createdDate = new Date(createdAt);
  const returnDeadline = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = returnDeadline.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return { days, hours, minutes };
}

export default function OrderReturns({ order, isReturnable }: { order: any; isReturnable: boolean }) {
  const [remaining, setRemaining] = useState(getTimeRemaining(order.created_at));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(order.created_at));
    }, 60000);

    return () => clearInterval(interval);
  }, [order.created_at]);

  if (!isReturnable) {
    return <p className="text-gray-500 dark:text-gray-400">This order is not eligible for return.</p>;
  }

  return (
    <ReturnInstructionProvider initialItems={order.returnable_cart} orderID={order.id}>
      <div className="w-full h-full flex flex-col gap-6 p-4">
        {/* Top row: ReturnItemTable and Return Window side by side */}
        <div className="w-full flex flex-row gap-6 h-[60%]">
          <div className="w-3/4 h-full flex flex-col">
            <ReturnItemTable />
          </div>

          <div className="w-1/4 h-full bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl p-6 flex flex-col justify-center">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Return Window</h4>
            <div className="bg-white dark:bg-[#2a2e33] border border-gray-300 dark:border-gray-700 shadow rounded px-4 py-2 text-center text-xs font-semibold flex-grow flex items-center justify-center">
              {remaining ? (
                <p className="text-green-700 dark:text-green-400 text-sm">
                  Return ends in:{" "}
                  <strong>
                    {remaining.days}d {remaining.hours}h {remaining.minutes}m
                  </strong>
                </p>
              ) : (
                <p className="text-red-600 dark:text-red-400 text-sm">Return window expired</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row: StepNavigator full width */}
        <div className="w-full h-[40%] overflow-auto">
          <StepNavigator />
        </div>
      </div>
    </ReturnInstructionProvider>
  );
}
