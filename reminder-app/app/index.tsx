import { useAuth } from "@/contexts/authContext";
import { Redirect } from "expo-router";

export default function IndexScreen() {
  const { authUser, loading } = useAuth();

  if (loading) return null; // or <Loading />

  return <Redirect href={authUser ? "/(tabs)" : "/auth"} />;
}
