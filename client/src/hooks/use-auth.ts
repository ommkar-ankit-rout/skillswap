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
          description: "Failed to sync user data",
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
      console.error("Error signing in:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      throw error;
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
      throw error;
    }
  };

  return { user, loading, login, logout };
}