import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await apiRequest("POST", "/api/auth/login", {
            firebaseId: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            profilePicture: firebaseUser.photoURL,
          });
          setUser(await response.json());
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return { user, loading, login, logout };
}
