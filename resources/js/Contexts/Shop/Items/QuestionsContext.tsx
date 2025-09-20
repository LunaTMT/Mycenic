import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { usePage } from "@inertiajs/react";
import axios from "axios";

export interface Question {
  id?: number;
  user: {
    id: number;
    name: string;
    avatar: string | null;
    email: string;
  };
  question: string;

  replies_recursive: Question[];
  isAdmin?: boolean;
  likes?: number;
  dislikes?: number;
  parent_id?: number | null;
  category?: string;
  created_at: string;
}

interface QuestionsContextType {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  questionsPerPage: number;
  totalPages: number;
  currentQuestions: Question[];
  handleSortChange: (value: string) => void;

  questionText: string;
  setQuestionText: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  errors: { question?: string };
  setErrors: React.Dispatch<React.SetStateAction<{ question?: string }>>;
  processing: boolean;
  submitQuestion: (authUser: any) => Promise<boolean>;
  MAX_LENGTH: number;
  categories: { value: string; label: string }[];

  openReplyFormId: string | null;
  setOpenReplyFormId: React.Dispatch<React.SetStateAction<string | null>>;
  expandedIds: Set<string>;
  toggleExpandedId: (id: string) => void;
  addReply: (questionId: string, replyText: string) => void;
  refreshQuestions: () => Promise<void>;

  updateQuestion: (questionId: number, newText: string) => Promise<boolean>;
  deleteQuestion: (questionId: number) => Promise<boolean>;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export const QuestionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = usePage().props as any;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [sortBy, setSortByState] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const questionsPerPage = 5;

  const [questionText, setQuestionText] = useState<string>("");
  const [category, setCategory] = useState<string>("general");
  const [errors, setErrors] = useState<{ question?: string }>({});
  const [processing, setProcessing] = useState<boolean>(false);

  const MAX_LENGTH = 300;
  const categories = [
    { value: "general", label: "General Question" },
    { value: "shipping", label: "Shipping" },
    { value: "product", label: "Product" },
  ];

  const refreshQuestions = async () => {
    try {
      const response = await axios.get<Question[]>("/api/questions");
      const mapped = response.data.map((q) => ({ ...q, replies_recursive: q.replies_recursive || [] }));
      setQuestions(mapped);
    } catch (err) {
      console.error("[QuestionsProvider] Failed to load questions:", err);
      toast.error("Failed to load questions.");
    }
  };

  useEffect(() => {
    refreshQuestions();
  }, []);

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return +new Date(b.created_at) - +new Date(a.created_at);
        case "oldest":
          return +new Date(a.created_at) - +new Date(b.created_at);
        case "most_liked":
          return (b.likes || 0) - (a.likes || 0);
        case "least_liked":
          return (a.likes || 0) - (b.likes || 0);
        default:
          return 0;
      }
    });
  }, [questions, sortBy]);

  const filteredQuestions = useMemo(() => {
    if (!category || category === "all") return sortedQuestions;
    return sortedQuestions.filter((q) => q.category === category);
  }, [sortedQuestions, category]);

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const currentQuestions = useMemo(() => {
    const start = (currentPage - 1) * questionsPerPage;
    return filteredQuestions.slice(start, start + questionsPerPage);
  }, [filteredQuestions, currentPage]);

  const setSortBy = (v: string) => {
    setSortByState(v);
    setCurrentPage(1);
  };

  const handleSortChange = (v: string) => setSortBy(v);

  const [openReplyFormId, setOpenReplyFormId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpandedId = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addReply = async (questionId: string, replyText: string) => {
    if (!auth?.user?.id) {
      toast.error("Login required");
      return;
    }
    try {
      await axios.post(`/questions/${questionId}/reply`, { question: replyText });
      setOpenReplyFormId(null);
      setExpandedIds((prev) => new Set(prev).add(questionId));
      await refreshQuestions();
      toast.success("Reply added!");
    } catch {
      toast.error("Reply failed.");
    }
  };

  const updateQuestion = async (questionId: number, newText: string): Promise<boolean> => {
    try {
      await axios.post(`/questions/${questionId}/update`, { question: newText });
      toast.success("Question updated!");
      await refreshQuestions();
      return true;
    } catch (error) {
      toast.error("Failed to update question.");
      return false;
    }
  };

  const deleteQuestion = async (questionId: number): Promise<boolean> => {
    try {
      await axios.delete(`/questions/${questionId}`);
      toast.success("Question deleted");
      await refreshQuestions();
      return true;
    } catch (error) {
      toast.error("Failed to delete question.");
      return false;
    }
  };

  const submitQuestion = async (authUser: any): Promise<boolean> => {
    setErrors({});
    if (!questionText.trim()) {
      setErrors({ question: "Please enter your question." });
      return false;
    }
    if (questionText.length > MAX_LENGTH) {
      setErrors({ question: `Max ${MAX_LENGTH} chars.` });
      return false;
    }
    if (!authUser) {
      toast.error("Login required");
      return false;
    }
    setProcessing(true);
    try {
      const newQ: Question = {
        id: Math.random(),
        user: {
          id: authUser.id,
          name: authUser.name,
          avatar: authUser.avatar || `https://i.pravatar.cc/150?u=${authUser.email}`,
          email: authUser.email,
        },
        question: questionText,
        created_at: new Date().toISOString(),
        replies_recursive: [],
        isAdmin: authUser.role === "admin",
        likes: 0,
        dislikes: 0,
        parent_id: null,
        category,
      };
      setQuestions((prev) => [newQ, ...prev]);
      toast.success("Question submitted!");
      setQuestionText("");
      setCategory("general");
      setProcessing(false);
      return true;
    } catch {
      toast.error("Submit failed");
      setProcessing(false);
      return false;
    }
  };

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        setQuestions,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        questionsPerPage,
        totalPages,
        currentQuestions,
        handleSortChange,

        questionText,
        setQuestionText,
        category,
        setCategory,
        errors,
        setErrors,
        processing,
        submitQuestion,
        MAX_LENGTH,
        categories,

        openReplyFormId,
        setOpenReplyFormId,
        expandedIds,
        toggleExpandedId,
        addReply,
        refreshQuestions,

        updateQuestion,
        deleteQuestion,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = (): QuestionsContextType => {
  const ctx = useContext(QuestionsContext);
  if (!ctx) throw new Error("useQuestions must be used within a QuestionsProvider");
  return ctx;
};
