import React, { useState } from "react";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateShippingDetailsForm from "./Partials/UpdateShippingDetailsForm";
import DeleteUserForm from "./Partials/DeleteUserForm";
import ProfileCard from "./ProfileCard";

// Placeholder Reviews component, replace with your actual one
function Reviews() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Reviews</h2>
      <p>No reviews yet.</p>
    </div>
  );
}

type TabKey = "credentials" | "shipping" | "reviews" | "delete";

interface ProfileTabContentProps {
  mustVerifyEmail: boolean;
  status?: string;
}

export default function ProfileTabContent({ mustVerifyEmail, status }: ProfileTabContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("credentials");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "credentials", label: "Credentials" },
    { key: "shipping", label: "Shipping" },
    { key: "reviews", label: "Reviews" },
    { key: "delete", label: "Delete Account" },
  ];

  const tabClass = (key: TabKey) =>
    `px-4 py-2 font-semibold transition-transform duration-300 border-b-2 border-transparent
     ${
       activeTab === key
         ? "text-yellow-500 dark:text-[#7289da] border-yellow-500 dark:border-[#7289da]"
         : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"
     }
     hover:scale-[1.03]`;

  return (
    <div className="flex flex-col gap-4 w-full min-h-full">
      {/* Profile card always on top */}
      <div className="w-full h-full">
        <ProfileCard />
      </div>

      {/* Tab selector */}
      <div className="flex justify-between border-b border-black/20 dark:border-white/20 mb-2">
        {/* Left group: Credentials, Shipping & Reviews */}
        <div className="flex gap-4">
          {tabs
            .filter(({ key }) => key !== "delete")
            .map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={tabClass(key)}
              >
                {label}
              </button>
            ))}
        </div>

        {/* Right group: Delete Account */}
        <div className="flex  gap-4">
          <button
            onClick={() => setActiveTab("delete")}
            className={tabClass("delete")}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="w-full h-full space-y-4">
        {activeTab === "credentials" && (
          <div className="flex flex-row gap-4">
            <UpdateProfileInformationForm
              mustVerifyEmail={mustVerifyEmail}
              status={status}
              className="w-1/2"
            />
            <UpdatePasswordForm className="w-1/2" />
          </div>
        )}
        {activeTab === "shipping" && <UpdateShippingDetailsForm />}
        {activeTab === "reviews" && <Reviews />}
        {activeTab === "delete" && <DeleteUserForm />}
      </div>
    </div>
  );
}
