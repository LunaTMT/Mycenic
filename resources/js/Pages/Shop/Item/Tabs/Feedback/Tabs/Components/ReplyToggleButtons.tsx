import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";

interface Props {
  showReplyForm: boolean;
  toggleReplyForm: () => void;
  expanded: boolean;
  toggleExpanded: () => void;
  repliesCount: number;
}

export default function ReplyToggleButtons({
  showReplyForm,
  toggleReplyForm,
  expanded,
  toggleExpanded,
  repliesCount,
}: Props) {
  return (
    <div className="flex space-x-2 mt-2">
      <PrimaryButton
        onClick={toggleReplyForm}
        className=" text-[13px] font-semibold px-3 py-1"
        type="button"
      >
        {showReplyForm ? "Cancel" : "Reply"}
      </PrimaryButton>

      {repliesCount > 0 && (
        <SecondaryButton
          onClick={toggleExpanded}
          className=" text-[13px] font-semibold px-3 py-1"
          type="button"
        >
          {expanded ? "Hide Replies" : `Show (${repliesCount})`}
        </SecondaryButton>
      )}
    </div>
  );
}
