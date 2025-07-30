import React, { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";

import TabNavigation from "@/Components/Tabs/TabNavigation";
import TabContent from "@/Components/Tabs/TabContent";
import SubNavigation from "@/Components/Tabs/SubTab/SubNavigation";

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
  key: string; // for SubNavigation key
  title: string;
  Component: React.FC;
};

export default function About() {
  const { auth } = usePage().props as { auth: { user?: any } };
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

  const [activeTab, setActiveTab] = useState<AboutTabKey>("Help");
  const [selectedSubTabKey, setSelectedSubTabKey] = useState<string | null>(null);

  const tabs: TabItem<AboutTabKey>[] = [
    { key: "Help", label: "Help" },
    { key: "Information", label: "Information" },
    { key: "Legal", label: "Legal" },
  ];

  const helpItems: SectionItem[] = [
    { key: "guides", title: "Guides", Component: Guides },
    { key: "faq", title: "FAQ", Component: FAQ },
    { key: "aboutUs", title: "About Us", Component: AboutUs },
    { key: "contactUs", title: "Contact Us", Component: ContactUs },
  ];

  const informationItems: SectionItem[] = [
    { key: "paymentPolicy", title: "Payment Policy", Component: PaymentPolicy },
    { key: "shipping", title: "Shipping & Dispatchment", Component: ShippingAndDispatchment },
    { key: "cancellations", title: "Cancellations", Component: Cancellations },
    { key: "refunds", title: "Refunds & Returns", Component: RefundsAndReturns },
  ];

  const legalItems: SectionItem[] = [
    { key: "usePolicy", title: "Use Policy", Component: UsePolicy },
    { key: "lawPolicy", title: "Law Policy", Component: LawPolicy },
    { key: "cookiePolicy", title: "Cookie Policy", Component: CookiePolicy },
    { key: "privacyPolicy", title: "Privacy Policy", Component: PrivacyPolicy },
  ];

  // Determine current sub-tabs based on active main tab
  let currentSubTabs: SectionItem[] = [];
  if (activeTab === "Help") currentSubTabs = helpItems;
  else if (activeTab === "Information") currentSubTabs = informationItems;
  else if (activeTab === "Legal") currentSubTabs = legalItems;

  // Set initial selected sub-tab when main tab changes
  useEffect(() => {
    const firstSubTab = currentSubTabs.length > 0 ? currentSubTabs[0].key : null;
    setSelectedSubTabKey(firstSubTab);
  }, [activeTab]);

  return (
    <Layout>
      <Head title="About" />

      <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 font-Poppins">
        <div className="bg-white dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl overflow-hidden">
          {/* Main Tabs */}
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={(key) => {
              setActiveTab(key);
              // No need to reset selectedSubTabKey here anymore — handled by useEffect
            }}
            tabs={tabs}
          />

          {/* Main tab content */}
          {tabs.map(({ key }) => (
            <TabContent key={key} activeKey={activeTab} tabKey={key}>
              <SubNavigation
                tabs={currentSubTabs.map(({ key, title }) => ({ key, label: title }))}
                activeKey={selectedSubTabKey ?? undefined}
                onChange={setSelectedSubTabKey}
              />

              {/* Subtab content */}
              {currentSubTabs.map(({ key: subKey, Component }) => (
                <TabContent key={subKey} activeKey={selectedSubTabKey ?? ""} tabKey={subKey}>
                  <Component />
                </TabContent>
              ))}
            </TabContent>
          ))}
        </div>
      </div>
    </Layout>
  );
}
