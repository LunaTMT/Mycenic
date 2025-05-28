import { useEffect, useState, useRef, Fragment } from "react";
import { Link, usePage } from "@inertiajs/react";
import { FaChevronRight } from "react-icons/fa";
import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Breadcrumb from "@/Components/Nav/Breadcrumb";
import { motion, AnimatePresence } from "framer-motion";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";

import { Inertia } from "@inertiajs/inertia";
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image: string;
}

interface TrackingEvent {
  status_date: string;
  status_details: string;
  location?: string | null;
  status: string;
  substatus?: string | null;
}

interface Order {
  id: number;
  user_id: number | null;
  cart: CartItem[];
  total: number;
  subtotal: number;
  delivery_price: number;
  weight: number;
  discount: number;

  payment_status: "Pending" | "Shipped" | "Delivered" | "Cancelled" | "Completed";

  customer_name: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;

  shipping_status: "Pre_transit" | "Transit" | "Delivered" | "Returned" | "Failure" | "Unknown";

  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  tracking_history?: TrackingEvent[] | null;

  created_at: string;
  updated_at: string;

  is_completed: boolean; 
  returnable: boolean;
}

interface PageProps {
  orders: Order[];
  [key: string]: any;
}

export default function CustomerOrders({ auth }: { auth: { user?: any } }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [trackingInfo, setTrackingInfo] = useState<{ [orderId: number]: any }>({});
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  const { orders: serverOrders } = usePage<PageProps>().props;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (serverOrders) {
      console.log(serverOrders);
      setOrders(serverOrders);
      setLoading(false);
    }
  }, [serverOrders]);

  const toggleExpandedOrder = (orderId: number) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };
  


  const fetchTrackingInfo = async (orderId: number, carrier: string, trackingNumber: string) => {
    try {
      const response = await fetch(`/orders/track/${carrier}/${trackingNumber}`);
      const data = await response.json();
      if (response.ok) {
        setTrackingInfo((prev) => ({ ...prev, [orderId]: data }));
      } else {
        Swal.fire("Error", "Unable to fetch tracking information.", "error");
      }
    } catch (error) {
      console.error("Error fetching tracking info:", error);
      Swal.fire("Error", "Something went wrong while fetching tracking info.", "error");
    }
  };

  const toTitleCase = (str: string) => {
    return str
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleToggleCompleted = (orderId: number) => {
    router.post(`/orders/${orderId}/toggle-completed`, {}, {
      onSuccess: () => {
        // Optionally handle local state if you don't want a full reload
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, is_completed: !order.is_completed } : order
          )
        );
      },
      onError: () => {
        Swal.fire("Error", "Failed to update order status.", "error");
      },
      onFinish: () => {
        // Optional cleanup or logging
      },
      preserveScroll: true,
      preserveState: true,
    });
  };


  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full overflow-visible flex justify-between items-center">
          <Breadcrumb items={[{ label: "ACCOUNT" }, { label: "ORDERS" }]} />
        </div>
      }
    >

        <video
          ref={videoRef}
          className="fixed top-0 left-0 w-full h-screen object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
           </video>       Your browser does not support the video tag.


         <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 dark:text-gray-300 flex gap-5 justify-center items-start font-Poppins">
          {loading ? (
            <p className="w-full h-full overflow-hidden rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg ">Loading orders...</p>
            
          ) : (
            <motion.div
              initial={{ height: "auto" }}
              animate={{ height: "auto" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full h-full overflow-hidden rounded-xl shadow-lg border border-black/20 dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200"
            >
              <table className="w-full ">

                <thead className="text-black bg-white dark:bg-[#1e2124] dark:text-white">
                  <tr>
                    <th className="py-3">ID</th>
                    <th className="py-3">Total</th>
                    <th className="py-3">Shipping status</th>
                    <th className="py-3">Payment status</th>
                    <th className="py-3">Date</th>
                    {auth?.user?.role === 'admin' && <th className="py-3">Completed</th>}
                    <th className="py-3 text-center align-middle"></th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-black/20 dark:divide-white/20">

                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className=" py-8 bg-white dark:bg-[#1e2124] text-xl text-center">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <Fragment key={order.id}>
                        <tr
                            onClick={() => toggleExpandedOrder(order.id)}
                            className={`cursor-pointer rounded-full ${
                              order.is_completed && auth?.user?.role === 'admin' 
                                ? "bg-green-400 dark:bg-green-900" // light green bg for completed orders, with a dark mode alternative
                                : "bg-white/70 dark:bg-[#424549]/10"
                            }`}
>

                          <td className="px-6 py-4 text-center h-16">{order.id}</td>
                          <td className="px-6 py-4 text-center h-16">£{order.total}</td>
                          <td className="px-6 py-4 text-center h-16">
                              <span
                                className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                                  order.shipping_status === "Pre_transit"
                                    ? "bg-gray-400"
                                    : order.shipping_status === "Transit"
                                    ? "bg-yellow-500"
                                    : order.shipping_status === "Delivered"
                                    ? "bg-green-500"
                                    : order.shipping_status === "Returned"
                                    ? "bg-blue-500"
                                    : order.shipping_status === "Failure"
                                    ? "bg-red-500"
                                    : "bg-gray-600"
                                }`}
                              >

                              {toTitleCase(order.shipping_status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center h-16">
                            <span
                              className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
                                order.payment_status === "Pending"
                                  ? "bg-yellow-500"
                                  : order.payment_status === "Shipped"
                                  ? "bg-blue-500"
                                  : order.payment_status === "Delivered" || order.payment_status === "Completed"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            >
                              {toTitleCase(order.payment_status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center h-16">
                            {new Date(order.created_at).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </td>
                          {auth?.user?.role === 'admin' && (
                          <td className="px-6 py-4 text-center flex justify-center items-center h-16">
                            <input
                              type="checkbox"
                              checked={order.is_completed}
                              onChange={() => handleToggleCompleted(order.id)}
                              className="form-checkbox h-6 w-6 text-green-600"
                            />
                          </td>
                          )}
                          <td className="p-3 mx-auto h-16  ">
                            <FaChevronRight
                              className={`dark:text-white  transition-transform duration-200 ${
                                expandedOrderId === order.id ? "rotate-90" : ""
                              }`}
                            />
                          </td>
                        </tr>

                        <AnimatePresence>
                          {expandedOrderId === order.id && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                            >
                             <td colSpan={auth?.user?.role === 'admin' ? 7 : 6} className="bg-white w-full dark:bg-[#1e2124]">

                                <div className="p-4 flex gap-10">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h2 className="text-lg font-semibold  text-black dark:text-white">
                                        Order Details
                                      </h2>
                                      


                                    </div>

                                    <div>
                                    {order.cart.map((item) => {
                                      console.log("Item price:", item.price); // Log the price of each item
                                      return (
                                        <motion.div
                                          key={item.id}
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          transition={{ duration: 0.3 }}
                                          className="flex items-center justify-between gap-4 pb-2"
                                        >
                                          <Link href={route("item", { id: item.id })} className="flex items-center gap-4">
                                            <img
                                              src={item.image}
                                              alt={item.name}
                                              className="w-16 h-16 rounded-md object-cover cursor-pointer"
                                            />
                                            <div className="flex-1">
                                              <p className="text-md font-semibold dark:text-white">{item.name}</p>
                                              <p className="text-sm">{item.quantity} × £{item.price.toFixed(2)}</p>
                                            </div>
                                          </Link>
                                          <p className="text-md font-semibold dark:text-white">
                                            £{(item.quantity * item.price).toFixed(2)}
                                          </p>
                                        </motion.div>
                                      );
                                    })}

                                    </div>

                                    {/* Discount and Total */}
                                    {order.cart.length > 0 && (() => {
                                        const discountAmount = order.discount > 0 ? ((order.discount / 100) * order.subtotal).toFixed(2) : "0.00";
                                        return (
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
                                        );
                                      })()}
                                    
                                    <div className="flex justify-around mt-6 ">
                                        {/* Tracking Info LEFT */} 
                                        {order.shipping_status !== "Unknown" && (
                                          <div className="w-full   rounded-lg ">
                                            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Tracking Information</h4>
                                            
                                            {order.tracking_number && order.tracking_url && (
                                              <div className="mb-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                  <strong>Tracking Number:</strong> {order.tracking_number}
                                                </p>
                                                <Link
                                                  href={order.tracking_url}
                                                  target="_blank"
                                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                                                >
                                                  Track Order
                                                </Link>
                                              </div>
                                            )}

                                            {/* Tracking History */}
                                            {order.tracking_history && order.tracking_history.length > 0 && (
                                              <div className="mt-6">
                                                <h5 className="text-lg font-semibold text-gray-800 dark:text-white">Tracking History</h5>
                                                {order.tracking_history.map((event, index) => (
                                                  <div key={index} className="mt-3">
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                      <strong>{new Date(event.status_date).toLocaleDateString("en-GB")}</strong>: {event.status_details}
                                                      {event.location}
                                                    </p>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Customer Info RIGHT*/}
                                        <div className="w-full text-right flex justify-between items-right gap-5 flex-col rounded-lg ">
                                          <div>
                                            <h4 className="text-xl font-semibold text-gray-800 dark:text-white">Customer Details</h4>
                                            <div className="mt-3">
                                              <p className="text-sm text-gray-600 dark:text-gray-300">{order.customer_name}</p>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">{order.address}</p>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">{order.city}</p>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">{order.zip}</p>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">{order.country}</p>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">{order.phone}</p>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">{order.email}</p>
                                            </div>
                                          </div>

                                              {Boolean(Number(order.returnable)) && (
                                                <PrimaryButton
                                                  className="ml-auto w-1/2"
                                                  onClick={() => Inertia.visit(route('orders.return', { order: order.id }))}
                                                >
                                                  Return
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
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </motion.div>
          )}
 
        </div>
    </Layout>
  );
}