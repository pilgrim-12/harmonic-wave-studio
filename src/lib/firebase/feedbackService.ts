import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Feedback, FeedbackCategory } from "@/types/feedback";

export interface CreateFeedbackData {
  userId: string;
  userEmail: string;
  userName?: string;
  category: FeedbackCategory;
  message: string;
}

export const feedbackService = {
  /**
   * Create a new feedback entry in Firebase
   */
  async createFeedback(data: CreateFeedbackData): Promise<string> {
    try {
      const feedbackRef = collection(db, "feedback");

      const feedbackData = {
        ...data,
        createdAt: serverTimestamp(),
        status: "new",
        userAgent: typeof window !== "undefined" ? navigator.userAgent : null,
        url: typeof window !== "undefined" ? window.location.href : null,
      };

      const docRef = await addDoc(feedbackRef, feedbackData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating feedback:", error);
      throw new Error("Failed to submit feedback");
    }
  },
};
