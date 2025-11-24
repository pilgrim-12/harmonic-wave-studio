export type FeedbackCategory = "bug" | "suggestion" | "feedback" | "question" | "other";

export interface Feedback {
  id?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  category: FeedbackCategory;
  message: string;
  createdAt: Date;
  status?: "new" | "reviewed" | "resolved";
  userAgent?: string;
  url?: string;
}

export interface FeedbackCategoryOption {
  value: FeedbackCategory;
  label: string;
  description: string;
}

export const FEEDBACK_CATEGORIES: FeedbackCategoryOption[] = [
  {
    value: "bug",
    label: "Bug Report",
    description: "Report a problem or error",
  },
  {
    value: "suggestion",
    label: "Suggestion",
    description: "Suggest an improvement or new feature",
  },
  {
    value: "feedback",
    label: "Feedback",
    description: "Share your thoughts about the app",
  },
  {
    value: "question",
    label: "Question",
    description: "Ask a question about the app",
  },
  {
    value: "other",
    label: "Other",
    description: "Something else",
  },
];
