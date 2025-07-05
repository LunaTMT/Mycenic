import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Head } from "@inertiajs/react";
import axios from "axios";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TabNavigation, { TabKey } from "./Components/TabNavigation";
import ProfileTabContent from "./Tabs/Profile/ProfileTabContent";
import CustomerOrders from "./Tabs/Orders/CustomerOrders";

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
  initialTab?: TabKey; // optional initial tab prop
}

export default function Edit({ mustVerifyEmail, status, initialTab }: Props) {
  // Default to 'profile' if initialTab is not provided
  console.log(initialTab);
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? "profile");

  const [orders, setOrders] = useState<any[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "orders" && orders === null) {
      setLoadingOrders(true);
      setOrdersError(null);

      axios
        .get("/orders")
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


      <div className="relative z-10 w-full h-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 flex justify-center items-start font-Poppins">
        <div className="w-full h-[88vh]  dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-8 h-full "
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
