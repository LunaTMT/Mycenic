import { useRef, useState, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";
import Breadcrumb from "@/Components/Nav/Breadcrumb";
import OrderTable from "./Table/OrderTable";
import OrderRow from "./Table/Row/OrderRow"; // ✅ You need this!
import { OrderProvider, useOrderContext } from "@/Contexts/OrdersContext";
import type { Order } from "@/Contexts/OrdersContext";

type CustomerOrdersProps = {
  orders: Order[];
};

export default function CustomerOrders({ orders }: CustomerOrdersProps) {
  const { props } = usePage();
  const auth = props.auth;
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [searchId, setSearchId] = useState("");

  return (
    <OrderProvider initialOrders={orders}>
      <Layout
        header={
          <div className="h-[5vh] z-10 w-full overflow-visible flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="w-1/3 h-full flex justify-start">
              <Breadcrumb items={[{ label: "ACCOUNT" }, { label: "ORDERS" }]} />
            </div>

            <div className="w-2/3 h-full flex gap-4 justify-end">
              <div className="flex items-center gap-4 h-full"></div>
              {auth?.user?.role === "admin" && (
                <input
                  type="text"
                  placeholder="Search by Order ID"
                  className="pl-2 max-w-64 w-full h-[80%] rounded border border-gray-400 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              )}
            </div>
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
        </video>

        <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 flex justify-center items-start font-Poppins">
          <OrderContent searchId={searchId} />
        </div>
      </Layout>
    </OrderProvider>
  );
}

function OrderContent({ searchId }: { searchId: string }) {
  const { orders, loading } = useOrderContext();
  console.log(orders);
  const filteredOrders = useMemo(() => {
    if (!searchId.trim()) return orders;
    return orders.filter((order) =>
      order.id.toString().toLowerCase().includes(searchId.toLowerCase())
    );
  }, [orders, searchId]);

  if (loading) {
    return (
      <p className="w-full h-full p-5 overflow-hidden rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg">
        Loading orders...
      </p>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <p className="w-full h-full p-5 overflow-hidden rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg">
        No orders found.
      </p>
    );
  }

  return (
    <div className="w-full h-[85vh] rounded-lg flex flex-col gap-4">
      {filteredOrders.map((order) => (
        <OrderRow key={order.id} orderId={order.id} />
      ))}
    </div>
  );
}
