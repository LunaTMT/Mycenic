import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import { useEffect, useState } from "react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import { useOrderContext } from "@/Contexts/OrdersContext";

export default function OrderRowDropdown({
  order,
  auth,
  isExpanded,
}: {
  order: any;
  auth: any;
  isExpanded: boolean;
}) {
  const { hasReturnStatus } = useOrderContext();
  const [isReturnable, setIsReturnable] = useState(false);
  const discountAmount =
    order.discount > 0 ? ((order.discount / 100) * order.subtotal).toFixed(2) : "0.00";

  useEffect(() => {
    if (!isExpanded) return;

    const source = axios.CancelToken.source();

    async function fetchReturnable() {
      try {
        const { data } = await axios.get(`/orders/${order.id}/is-returnable`, {
          cancelToken: source.token,
        });
        console.log(data.is_returnable)
        setIsReturnable(data.is_returnable);
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching returnable status:", error);
          setIsReturnable(false);
        }
      }
    }

    fetchReturnable();

    return () => {
      source.cancel("Request canceled due to component unmounting or dependency change.");
    };
  }, [isExpanded, order.id]);

  if (!isExpanded) return null;

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.tr
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <td
            colSpan={
              6 + (auth?.user?.role === "admin" ? 1 : 0) + (hasReturnStatus ? 1 : 0)
            }
            className="bg-white w-full dark:bg-[#1e2124]"
          >
            <div className="p-4 flex gap-10">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-black dark:text-white">
                    Order Details
                  </h2>
                </div>

                <div>
                  {order.cart.map((item: any) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between gap-4 pb-2"
                    >
                      <Link
                        href={`/item/${item.id}`}
                        className="flex items-center gap-4"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-md object-cover cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-md font-semibold dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm">
                            {item.quantity} × £{item.price.toFixed(2)}
                          </p>
                        </div>
                      </Link>
                      <p className="text-md font-semibold dark:text-white">
                        £{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Discount and Total */}
                {order.cart.length > 0 && (
                  <>
                    {order.discount > 0 && (
                      <div className="mt-2 pt-2 border-t border-black/30 flex justify-between text-md dark:border-white/40 dark:text-white font-semibold">
                        <span>Discount ({order.discount}%)</span>
                        <span>-£{discountAmount}</span>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-black/30 flex justify-between text-md dark:border-white/40 dark:text-white font-semibold">
                      <span>Grand Total:</span>
                      <span>£{order.total}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-around mt-6">
                  {/* Tracking Info LEFT */}
                  {order.shipping_status !== "Unknown" && (
                    <div className="w-full rounded-lg">
                      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Tracking Information
                      </h4>

                      {order.tracking_number && order.tracking_url && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Tracking Number:</strong> {order.tracking_number}
                          </p>
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                          >
                            Track Order
                          </a>
                        </div>
                      )}

                      {/* Tracking History */}
                      {order.tracking_history && order.tracking_history.length > 0 && (
                        <div className="mt-6">
                          <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Tracking History
                          </h5>
                          {order.tracking_history.map((event: any, index: number) => (
                            <div key={index} className="mt-3">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong>
                                  {new Date(event.status_date).toLocaleDateString("en-GB")}
                                </strong>
                                : {event.status_details} {event.location}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Customer Info RIGHT */}
                  <div className="w-full text-right flex flex-col items-end gap-5 rounded-lg">
                    <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Customer Details
                    </h4>
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 text-right">
                      <p>{order.customer_name}</p>
                      <p>{order.address}</p>
                      <p>{order.city}</p>
                      <p>{order.zip}</p>
                      <p>{order.country}</p>
                      <p>{order.phone}</p>
                      <p>{order.email}</p>
                    </div>

                    {/* Show return button only if returnable AND delivered */}
                    {isReturnable &&  (
                      <PrimaryButton
                        className="ml-auto w-1/2"
                        onClick={() =>
                          Inertia.visit(route("orders.return", { order: order.id }))
                        }
                      >
                        Start Return Process
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </motion.tr>
      )}
    </AnimatePresence>
  );
}
