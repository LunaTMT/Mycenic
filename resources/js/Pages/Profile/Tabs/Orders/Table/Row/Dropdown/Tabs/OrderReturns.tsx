import { useEffect, useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";

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
    <div className="w-full flex flex-col md:flex-row gap-6">
      <div className="md:w-2/3 bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Returnable Items</h4>
        {order.returnable_cart?.length > 0 ? (
          order.returnable_cart.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
              <div>
                <p className="text-md font-semibold dark:text-white">{item.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Quantity: {item.quantity}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No returnable items found.</p>
        )}
      </div>

      <div className="md:w-1/3 bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-xl shadow-2xl p-6 flex flex-col justify-start space-y-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Initiate A Return</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You can return eligible items from this order.
        </p>

        <div className="bg-white dark:bg-[#2a2e33] border border-gray-300 dark:border-gray-700 shadow rounded px-4 py-2 text-center text-xs font-semibold">
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

        <PrimaryButton
          className="w-full"
          onClick={() => Inertia.visit(route("orders.return", { order: order.id }))}
        >
          Start
        </PrimaryButton>
      </div>
    </div>
  );
}
