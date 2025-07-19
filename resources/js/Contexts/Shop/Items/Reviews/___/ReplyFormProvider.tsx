import React, { createContext, useContext, useState } from "react";

interface ReplyFormContextType {
  openReplyFormId: string | null;
  setOpenReplyFormId: React.Dispatch<React.SetStateAction<string | null>>;
  toggleReplyForm: (id: string) => void;
  showReplyForm: (id: string) => boolean;

  expandedIds: Set<string>;
  toggleExpandedId: (id: string) => void;

  addRepl: (parentId: string, replyContent: string) => void;
}

const ReplyFormContext = createContext<ReplyFormContextType | undefined>(undefined);

export const ReplyFormProvider = ({ children }: { children: React.ReactNode }) => {
  const [openReplyFormId, setOpenReplyFormId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleReplyForm = (id: string) => {
    setOpenReplyFormId((prevId) => (prevId === id ? null : id));
  };

  const showReplyForm = (id: string) => openReplyFormId === id;

  const toggleExpandedId = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addRepl = (parentId: string, replyContent: string) => {
    // TODO: Replace this with actual reply logic (e.g. API POST request)
    console.log("Reply submitted:", { parentId, replyContent });
  };

  return (
    <ReplyFormContext.Provider
      value={{
        openReplyFormId,
        setOpenReplyFormId,
        toggleReplyForm,
        showReplyForm,
        expandedIds,
        toggleExpandedId,
        addRepl,
      }}
    >
      {children}
    </ReplyFormContext.Provider>
  );
};

export const useReplyForm = (): ReplyFormContextType => {
  const context = useContext(ReplyFormContext);
  if (!context) {
    throw new Error("useReplyForm must be used within a ReplyFormProvider");
  }
  return context;
};
