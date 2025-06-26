import React from "react";
import UpdateProfileInformationForm from "../../Partials/UpdateProfileInformationForm";
import UpdatePasswordForm from "../../Partials/UpdatePasswordForm";
import ProfileCard from "./ProfileCard";
import UpdateShippingDetailsForm from "../../Partials/UpdateShippingDetailsForm";
import DeleteUserForm from "../../Partials/DeleteUserForm";

interface ProfileTabContentProps {
  mustVerifyEmail: boolean;
  status?: string;
}

export default function ProfileTabContent({ mustVerifyEmail, status }: ProfileTabContentProps) {
  return (
    <div className="flex flex-col gap-8 min-h-full w-full">
      {/* ProfileCard full width on top */}
      <div className="w-full">
        <ProfileCard />
      </div>

      {/* 2x2 grid for forms */}
      <div className="w-full grid grid-cols-2 gap-8 rounded-lg">

        <div className="w-full space-y-6">
          <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
          <UpdatePasswordForm />
        </div>

        <div className="w-full space-y-6">
          <UpdateShippingDetailsForm />

        </div>
      </div>
    </div>
  );
}
