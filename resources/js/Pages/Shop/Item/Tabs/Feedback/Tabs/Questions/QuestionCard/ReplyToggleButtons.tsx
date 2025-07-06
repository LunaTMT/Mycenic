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
      <button
        onClick={toggleReplyForm}
        className="w-[120px] h-[36px] px-3 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-md text-sm font-semibold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-black transition"
      >
        {showReplyForm ? "Cancel" : "Reply"}
      </button>

      {repliesCount > 0 && (
        <button
          onClick={toggleExpanded}
          className="w-[120px] h-[36px] px-3 border border-gray-500 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {expanded ? "Hide Replies" : `Show (${repliesCount})`}
        </button>
      )}
    </div>
  );
}
