const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // ✅ Use Backend URL
import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const response = await apiRequest("POST", "/api/auth/login", {
            firebaseId: firebaseUser.uid,
            name: firebaseUser.displayName || "Anonymous",
            email: firebaseUser.email || "",
            profilePicture: firebaseUser.photoURL,
            bio: null,
          });
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error syncing user:", error);
        toast({
          title: "Error",
          description: "Failed to sync user data with server",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const login = async () => {
    try {
      if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        toast({
          title: "Configuration Error",
          description: "Firebase credentials are not configured. Please add them to continue.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);

      if (!result.user) {
        throw new Error("No user data returned from Google");
      }

      toast({
        title: "Success",
        description: "Successfully signed in!",
      });
    } catch (error: any) {
      console.error("Sign-in error:", error);

      let errorMessage = "Failed to sign in with Google";

      // Handle specific error cases
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Please enable popups for this site to sign in";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for sign-in";
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Firebase configuration is missing or invalid";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Success",
        description: "Successfully signed out",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return { user, loading, login, logout };
}
