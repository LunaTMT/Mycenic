import React, { useState, useEffect } from "react";
import ProfileInformationForm from "./Partials/ProfileInformationForm";
import PasswordForm from "./Partials/PasswordForm";
import ShippingDetails from "./Shipping/ShippingDetails";
import DeleteUserForm from "./Partials/DeleteUserForm";
import ProfileCard from "./ProfileCard";
import SubContent from "@/Components/Tabs/SubTab/SubContent";
import SubNavigation from "@/Components/Tabs/SubTab/SubNavigation";

import UserReviews from "./UserReviews";


type TabKey = "credentials" | "shipping" | "reviews" | "delete";

const leftTabs: { key: TabKey; label: string }[] = [
  { key: "credentials", label: "Credentials" },
  { key: "shipping", label: "Shipping" },
  { key: "reviews", label: "Reviews" },
];

const rightTabs: { key: TabKey; label: string }[] = [
  { key: "delete", label: "Delete Account" },
];


export default function ProfileTabContent() {

  const validTabs: TabKey[] = ["credentials", "shipping", "reviews", "delete"];

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const stored = localStorage.getItem("profileSubTab") as TabKey | null;
    return stored && validTabs.includes(stored) ? stored : "credentials";
  });

  useEffect(() => {
    localStorage.setItem("profileSubTab", activeTab);
  }, [activeTab]);
  
  return (
    <div className="flex flex-col gap-4 w-full min-h-full">
      <div className="w-full h-full">
        <ProfileCard />
      </div>

      <SubNavigation
        leftTabs={leftTabs}
        rightTabs={rightTabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      <div className="w-full h-full space-y-4">
        <SubContent activeKey={activeTab} tabKey="credentials">
          <div className="flex flex-row gap-4">
            <ProfileInformationForm className="w-1/2" />
            <PasswordForm className="w-1/2" />
          </div>
        </SubContent>

        <SubContent activeKey={activeTab} tabKey="shipping">
            <ShippingDetails />
        </SubContent>

        <SubContent activeKey={activeTab} tabKey="reviews">
          <UserReviews />
        </SubContent>

        <SubContent activeKey={activeTab} tabKey="delete">
          <DeleteUserForm />
        </SubContent>
      </div>
    </div>
  );
}
