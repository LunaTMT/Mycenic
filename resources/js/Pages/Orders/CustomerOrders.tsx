// Keep all existing imports
import { useEffect, useRef, useState } from "react"; // For React hooks
import { usePage } from "@inertiajs/react"; // For Inertia.js page props
import Swal from "sweetalert2"; // For modal alerts
import { router } from "@inertiajs/react"; // For Inertia.js router
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"; // Assuming layout path
import GuestLayout from "@/Layouts/GuestLayout"; // Assuming layout path
import Breadcrumb from "@/Components/Nav/Breadcrumb";
import type { Order, PageProps } from "@/types"; // Assuming you have types defined here

import OrderTable from "./Table/OrderTable";

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
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, is_completed: !order.is_completed } : order
          )
        );
      },
      onError: () => {
        Swal.fire("Error", "Failed to update order status.", "error");
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
      <video ref={videoRef} className="fixed top-0 left-0 w-full h-screen object-cover z-0" autoPlay muted loop playsInline>
        <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
      </video>
       <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 dark:text-gray-300 flex gap-5 justify-center items-start font-Poppins">
        {loading ? (
          <p className="w-full h-full overflow-hidden rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg ">Loading orders...</p>
        ) : (
          <OrderTable
            orders={orders}
            auth={auth}
            expandedOrderId={expandedOrderId}
            toggleExpandedOrder={toggleExpandedOrder}
            toTitleCase={toTitleCase}
            handleToggleCompleted={handleToggleCompleted}
            trackingInfo={trackingInfo}
            fetchTrackingInfo={fetchTrackingInfo}
          />
        )}
      </div>
    </Layout>
  );
}
