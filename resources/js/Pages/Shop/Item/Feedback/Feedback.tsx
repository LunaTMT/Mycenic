import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";

import SubNavigation from "@/Components/Tabs/SubTab/SubNavigation";
import SubContent from "@/Components/Tabs/SubTab/SubContent";

import Reviews from "./Tabs/Reviews/Reviews";


import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";
import { ReviewsProvider } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";


import { Tab } from "@/types/Tabs";


type TabKey = "reviews" | "questions";

const tabs: Tab<TabKey>[] = [
  { key: "reviews", label: "Reviews" },
  { key: "questions", label: "Questions" },
];

export default function Feedback() {
  
  const { item } = useItemContext();

  
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window === "undefined") return "reviews";
    const saved = localStorage.getItem("feedbackActiveTab");
    return saved === "reviews" || saved === "questions" ? saved : "reviews";
  });

  useEffect(() => {
    localStorage.setItem("feedbackActiveTab", activeTab);
  }, [activeTab]);


  return (
    <div className="space-y-3">
     
        
        <SubNavigation
          leftTabs={tabs}
          activeKey={activeTab}
          onChange={setActiveTab}
          
        />


        <ReviewsProvider initialReviews={item.reviews} itemId={item.id}>
          <SubContent activeKey={activeTab} tabKey="reviews">
            <Reviews />
          </SubContent>
        </ReviewsProvider>



    </div>
  );
}
