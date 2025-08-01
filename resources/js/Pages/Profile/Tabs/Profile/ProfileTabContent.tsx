import React, { useState } from "react";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateShippingDetailsForm from "./Partials/UpdateShippingDetailsForm";
import DeleteUserForm from "./Partials/DeleteUserForm";
import ProfileCard from "./ProfileCard";
import SubContent from "@/Components/Tabs/SubTab/SubContent";
import SubNavigation from "@/Components/Tabs/SubTab/SubNavigation";

type TabKey = "credentials" | "shipping" | "reviews" | "delete";

interface ProfileTabContentProps {
  mustVerifyEmail: boolean;
  status?: string;
}

const leftTabs: { key: TabKey; label: string }[] = [
  { key: "credentials", label: "Credentials" },
  { key: "shipping", label: "Shipping" },
  { key: "reviews", label: "Reviews" },
];

const rightTabs: { key: TabKey; label: string }[] = [
  { key: "delete", label: "Delete Account" },
];

// Placeholder Reviews component, replace with your actual one
function Reviews() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Reviews</h2>
      <p>No reviews yet.</p>
    </div>
  );
}

export default function ProfileTabContent({ mustVerifyEmail, status }: ProfileTabContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("credentials");

  return (
    <div className="flex flex-col gap-4 w-full min-h-full">
      {/* Profile card always on top */}
      <div className="w-full h-full">
        <ProfileCard />
      </div>

      {/* Tab navigation with left and right tabs */}
      <SubNavigation
        leftTabs={leftTabs}
        rightTabs={rightTabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      {/* Tab content with fade transition */}
      <div className="w-full h-full space-y-4">
        <SubContent activeKey={activeTab} tabKey="credentials">
          
          <div className="flex flex-row gap-4">
            <UpdateProfileInformationForm
              mustVerifyEmail={mustVerifyEmail}
              status={status}
              className="w-1/2"
            />
            <UpdatePasswordForm className="w-1/2" />
          </div>
        </SubContent>

        <SubContent activeKey={activeTab} tabKey="shipping">
          <UpdateShippingDetailsForm />
        </SubContent>

        <SubContent activeKey={activeTab} tabKey="reviews">
          <Reviews />
        </SubContent>

        <SubContent activeKey={activeTab} tabKey="delete">
          <DeleteUserForm />
        </SubContent>
      </div>
    </div>
  );
}
