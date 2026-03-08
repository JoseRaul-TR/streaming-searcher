import { Redirect } from "expo-router";
import { useUserStore } from "@/store/useUserStore";

export default function Index() {
  const { hasCompletedOnboarding } = useUserStore();
  return <Redirect href={hasCompletedOnboarding ? "/(tabs)" : "/onboarding"} />;
}
