import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Head } from "@inertiajs/react";
import axios from "axios";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TabNavigation, { TabKey } from "./Components/TabNavigation";
import ProfileTabContent from "./Tabs/Profile/ProfileTabContent";
import UpdateShippingDetailsForm from "./Partials/UpdateShippingDetailsForm";
import CustomerOrders from "./Tabs/Orders/CustomerOrders";

// Placeholder returns component (replace with your actual component)
function ReturnsTabContent() {
  return (
    <div className="text-center text-gray-700 dark:text-gray-300">
      <h2 className="text-2xl font-semibold mb-4">Returns</h2>
      <p>Returns tab content goes here.</p>
    </div>
  );
}

interface Props {
  mustVerifyEmail: boolean;
  status?: string;
}

export default function Edit({ mustVerifyEmail, status }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  // Store orders locally
  const [orders, setOrders] = useState<any[] | null>(null); // Replace any with your order type
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "orders" && orders === null) {
      setLoadingOrders(true);
      setOrdersError(null);

      axios
        .get("/orders") // Change to your actual backend endpoint
        .then((res) => setOrders(res.data.orders || []))
        .catch(() => {
          setOrders([]);
          setOrdersError("Failed to load orders. Please try again later.");
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab, orders]);

  return (
    <AuthenticatedLayout>
      <Head title="Profile" />

      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 flex justify-center items-start font-Poppins">
        <div className="w-full bg-white dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-8 space-y-8 min-h-[400px]"
            >
              {activeTab === "profile" && (
                <ProfileTabContent
                  mustVerifyEmail={mustVerifyEmail}
                  status={status}
                />
              )}

              {activeTab === "orders" && (
                <>
                  {loadingOrders && (
                    <p className="text-center text-gray-600 dark:text-gray-300">
                      Loading orders...
                    </p>
                  )}
                  {ordersError && (
                    <p className="text-center text-red-500">{ordersError}</p>
                  )}
                  {!loadingOrders && !ordersError && (
                    <CustomerOrders orders={orders || []} />
                  )}
                </>
              )}

 

              {activeTab === "returns" && <ReturnsTabContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
