import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { ToastContainer } from "react-toastify";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";
import Breadcrumb from "@/Components/Nav/Breadcrumb";
import ImageGallery from "./Left/ImageGallery";
import OptionsSelector from "./Right/OptionsSelector";
import AddToCartSection from "./Right/AddToCartSection";
import { ItemProvider } from "@/Contexts/Shop/ItemContext";
import { AnimatePresence, motion } from "framer-motion";
import TabNavigation from "../../TabNavigation";

export type TabKey = "Item" | "Guides" | "Reviews";

interface ItemProps {
  auth: { user: any } | null;
  item: {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
    images: string;
    image_sources?: string;
    description: string;
    isPsyilocybinSpores: boolean;
    options?: string;
  };
}

const Item: React.FC<ItemProps> = ({ auth, item }) => {
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  const { getStock } = useCart();
  const descriptionParagraphs = item.description.split("\n\n");

  const [activeTab, setActiveTab] = useState<TabKey>("Item");

  return (
    <Layout
      header={
        <div className="h-[5vh] w-full flex justify-between items-center">
          <Breadcrumb
            items={[
              { label: "SHOP", link: route("shop") },
              { label: item.category, link: route("shop", { category: item.category }) },
              { label: item.name },
            ]}
          />
        </div>
      }
    >
      <Head title={`${item.category}/${item.name}`} />

      <ItemProvider item={item} getStock={getStock}>
        <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 flex justify-center items-start font-Poppins">
          <div className="w-full bg-white dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-[77vh] text-gray-700 dark:text-gray-300"
              >
                {activeTab === "Item" && (
                  <div className="flex h-full gap-6 px-4 py-6">
                    {/* LEFT */}
                    <div className="w-1/2 h-full overflow-hidden">
                      <ImageGallery />
                    </div>

                    {/* RIGHT */}
                    <div className="w-1/2 h-full p-5 flex flex-col bg-white border rounded-lg dark:bg-[#424549]/80 border-black/20 dark:border-white/20 overflow-hidden">
                      <div className="flex-1 flex flex-col overflow-y-auto pr-2">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                          {item.name}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
                          {item.category}
                        </p>

                        {descriptionParagraphs.map((p, i) => (
                          <p key={i} className="whitespace-pre-line mb-2">
                            {p}
                          </p>
                        ))}

                        
                      </div>

                      <OptionsSelector />
                      <AddToCartSection />
                    </div>
                  </div>
                )}

                {activeTab === "Guides" && (
                  <div className="h-full flex items-center justify-center text-lg">
                    No guides available for this item.
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <div className="h-full flex items-center justify-center text-lg">
                    No reviews available for this item.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </ItemProvider>

      <ToastContainer position="bottom-right" />
    </Layout>
  );
};

export default Item;
