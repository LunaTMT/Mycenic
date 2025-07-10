import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";

import TabNavigation from "./TabNavigation";
import TabContent from "../../TabContent";
import Reviews from "./Tabs/Reviews/Reviews";
import Questions from "./Tabs/Questions/Questions";

export default function Feedback() {
  const { auth } = usePage().props as { auth: { user: any } };

  // Initialize state from localStorage if present, else default to 'reviews'
  const [activeTab, setActiveTab] = useState<"reviews" | "questions">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("feedbackActiveTab");
      if (saved === "reviews" || saved === "questions") {
        return saved;
      }
    }
    return "reviews";
  });

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("feedbackActiveTab", activeTab);
  }, [activeTab]);

  const tabs = [
    { key: "reviews", label: "Reviews" },
    { key: "questions", label: "Questions" },
  ];

  return (
    <div className="space-y-6">
      <TabNavigation
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as "reviews" | "questions")}
      />

      <TabContent activeKey={activeTab} tabKey="reviews">
        <Reviews />
      </TabContent>

      <TabContent activeKey={activeTab} tabKey="questions">
        <Questions />
      </TabContent>
    </div>
  );
}
