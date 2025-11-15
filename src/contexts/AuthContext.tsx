"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase/firebase";
import { UserProfile } from "@/types/user";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeSnapshotRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }

      if (user) {
        try {
          const startTime = performance.now();
          console.log(
            "🔍 [START] Setting up Firestore listener for user:",
            user.uid
          );

          const userRef = doc(db, "users", user.uid);

          unsubscribeSnapshotRef.current = onSnapshot(
            userRef,
            async (snapshot) => {
              const endTime = performance.now();
              const duration = ((endTime - startTime) / 1000).toFixed(2);

              const source = snapshot.metadata.fromCache ? "cache" : "server";
              console.log(`📊 [${duration}s] Data from ${source}`);

              if (!snapshot.exists()) {
                console.log(`📝 [${duration}s] Creating new user profile...`);

                const setDocStart = performance.now();
                const newProfile = {
                  displayName: user.displayName || "Anonymous",
                  email: user.email || "",
                  photoURL: user.photoURL || "",
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),

                  preferences: {
                    theme: "dark" as const,
                    language: "en" as const,
                  },

                  stats: {
                    projectsCount: 0,
                    lastLoginAt: serverTimestamp(),
                  },
                };

                await setDoc(userRef, newProfile);
                const setDocEnd = performance.now();
                const setDocDuration = (
                  (setDocEnd - setDocStart) /
                  1000
                ).toFixed(2);

                console.log(`✅ [${setDocDuration}s] User profile created!`);
              } else {
                console.log(
                  `✅ [${duration}s] User profile exists:`,
                  snapshot.data()
                );

                // Сохраняем профиль в состояние
                setUserProfile(snapshot.data() as UserProfile);
              }
            },
            (error) => {
              const endTime = performance.now();
              const duration = ((endTime - startTime) / 1000).toFixed(2);
              console.error(`❌ [${duration}s] Snapshot error:`, error);
            }
          );

          // Обновляем lastLoginAt отдельно
          await setDoc(
            userRef,
            {
              stats: {
                lastLoginAt: serverTimestamp(),
              },
            },
            { merge: true }
          );
        } catch (error) {
          console.error("❌ Firestore error:", error);
        }
      } else {
        // Сбрасываем профиль при выходе
        setUserProfile(null);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
