import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import TabNavigation from "@/Pages/Profile/Components/TabNavigation";
import { useItemContext } from "@/Contexts/Shop/ItemContext";

interface DescriptionTabsProps {
  descriptionParagraphs: string[];
}

const DescriptionTabs: React.FC<DescriptionTabsProps> = ({ descriptionParagraphs }) => {
  const { activeTab, setActiveTab } = useItemContext();

  return (
    <div className="w-full bg-white dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl mb-4">
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="p-8 space-y-4 min-h-[200px] text-gray-700 dark:text-gray-300"
        >
          {activeTab === "Item" &&
            descriptionParagraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          {activeTab === "Guides" && <p className="text-center">No guides available for this item.</p>}
          {activeTab === "Reviews" && <p className="text-center">No reviews available for this item.</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DescriptionTabs;
