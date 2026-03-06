import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserState {
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;
  country: string; // US, ES, SE, ...
  setCountry: (country: string) => void;
  completeOnboarding: () => void;
  acceptTerms: () => void;
  resetOnboarding: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      hasAcceptedTerms: false,
      country: "SE", // Default country Sweden
      setCountry: (country) => set({ country }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      acceptTerms: () => set({ hasAcceptedTerms: true }),
      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          hasAcceptedTerms: false,
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
