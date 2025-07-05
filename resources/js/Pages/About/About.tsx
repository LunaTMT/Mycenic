import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";
import Breadcrumb from "@/Components/Nav/Breadcrumb";
import TabNavigation, { TabItem } from "./TabNavigation";

import Guides from "@/Pages/About/Section/Help/Guides";
import FAQ from "@/Pages/About/Section/Help/FAQ";
import AboutUs from "@/Pages/About/Section/Help/AboutUs";
import ContactUs from "@/Pages/About/Section/Help/ContactUs";

import PaymentPolicy from "@/Pages/About/Section/Information/PaymentPolicy";
import ShippingAndDispatchment from "@/Pages/About/Section/Information/ShippingDispatch";
import Cancellations from "@/Pages/About/Section/Information/Cancellations";
import RefundsAndReturns from "@/Pages/About/Section/Information/RefundReturn";

import UsePolicy from "@/Pages/About/Section/Legal/UsePolicy";
import LawPolicy from "@/Pages/About/Section/Legal/LawPolicy";
import CookiePolicy from "@/Pages/About/Section/Legal/CookiePolicy";
import PrivacyPolicy from "@/Pages/About/Section/Legal/PrivacyPolicy";

export type AboutTabKey = "Help" | "Information" | "Legal";

type SectionItem = {
  title: string;
  Component: React.FC;
};

export default function About() {
  const { auth } = usePage().props as { auth: { user?: any } };
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

  const [activeTab, setActiveTab] = useState<AboutTabKey>("Help");
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const breadcrumbItems = [
    { label: "Home", link: route("home") },
    { label: "About", link: route("about.index") },
  ];

  const tabs: TabItem<AboutTabKey>[] = [
    { key: "Help", label: "Help" },
    { key: "Information", label: "Information" },
    { key: "Legal", label: "Legal" },
  ];

  // Define the lists of items with titles and components per tab
  const helpItems: SectionItem[] = [
    { title: "Guides", Component: Guides },
    { title: "FAQ", Component: FAQ },
    { title: "About Us", Component: AboutUs },
    { title: "Contact Us", Component: ContactUs },
  ];

  const informationItems: SectionItem[] = [
    { title: "Payment Policy", Component: PaymentPolicy },
    { title: "Shipping & Dispatchment", Component: ShippingAndDispatchment },
    { title: "Cancellations", Component: Cancellations },
    { title: "Refunds & Returns", Component: RefundsAndReturns },
  ];

  const legalItems: SectionItem[] = [
    { title: "Use Policy", Component: UsePolicy },
    { title: "Law Policy", Component: LawPolicy },
    { title: "Cookie Policy", Component: CookiePolicy },
    { title: "Privacy Policy", Component: PrivacyPolicy },
  ];

  // Pick current items list depending on activeTab
  let currentItems: SectionItem[] = [];
  if (activeTab === "Help") currentItems = helpItems;
  else if (activeTab === "Information") currentItems = informationItems;
  else if (activeTab === "Legal") currentItems = legalItems;

  return (
    <Layout
      header={
        <div className="h-[5vh] w-full flex justify-between items-center">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      }
    >
      <Head title="About" />

      <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 font-Poppins">
        <div className="bg-white dark:bg-[#424549]  dark:border-white/20 border border-black/20 rounded-xl shadow-2xl overflow-hidden">
          <TabNavigation activeTab={activeTab} setActiveTab={(key) => { setActiveTab(key); setSelectedItemIndex(null); }} tabs={tabs} />

          <div className="min-h-[77vh] h-full p-6 overflow-y-auto text-gray-700 dark:text-gray-300">
            

              {/* List of clickable titles as tab-like buttons */}
              <div className="flex gap-4 mb-6 border-b border-black/20 dark:border-white/20 ">
                {currentItems.map((item, idx) => {
                  const isActive = selectedItemIndex === idx;
                  return (
                    <button
                      key={item.title}
                      onClick={() => setSelectedItemIndex(idx)}
                      className={`
                        px-4 py-2 font-semibold border-b-2 border-transparent transition-transform duration-300
                        ${isActive
                          ? "text-yellow-500 dark:text-[#7289da] border-yellow-500 dark:border-[#7289da]"
                          : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"
                        }
                        hover:scale-[1.03]
                        focus:outline-none
                      `}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>


            {/* Show the selected component */}
            {selectedItemIndex !== null && (
              <div className="">
                {React.createElement(currentItems[selectedItemIndex].Component)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
