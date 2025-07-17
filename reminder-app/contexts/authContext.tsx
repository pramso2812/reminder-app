import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  email?: string;
  created_at?: string;
  // Add any other fields you store in your `profile` table
};

type AuthContextType = {
  authUser: any; // From supabase.auth
  profile: Profile | null; // From `profile` table
  session: any;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session;
      setSession(currentSession);
      setAuthUser(currentSession?.user ?? null);

      if (currentSession?.user?.id) {
        const { data: profileData } = await supabase
          .from("profile")
          .select("*")
          .eq("id", currentSession.user.id)
          .single();

        setProfile(profileData ?? null);
      }

      setLoading(false);
    };

    restoreSession();

    // 🔁 Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setAuthUser(session?.user ?? null);

        if (session?.user?.id) {
          const { data: profileData } = await supabase
            .from("profile")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setProfile(profileData ?? null);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAuthUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ authUser, profile, session, loading, logout }}
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
