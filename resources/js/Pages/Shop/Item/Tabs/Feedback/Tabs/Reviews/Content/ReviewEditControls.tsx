import React from "react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";

interface Props {
  onSave: () => void;
  onCancel: () => void;
}

export default function ReviewEditControls({ onSave, onCancel }: Props) {
  return (
    <div className="flex gap-2 mt-2">
      <PrimaryButton onClick={onSave} className="text-[13px] font-semibold px-3 py-1">Save</PrimaryButton>
      <SecondaryButton onClick={onCancel} className="text-[13px] font-semibold px-3 py-1">Cancel</SecondaryButton>
    </div>
  );
}
