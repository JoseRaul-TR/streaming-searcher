import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserState = {
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;
  country: string; // US, ES, SE, ...
  countryName: string; // Sweden, Spain, ...
  setCountry: (code: string, name: string) => void;
  completeOnboarding: () => void;
  acceptTerms: () => void;
  resetOnboarding: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      hasAcceptedTerms: false,
      country: "",
      countryName: "",
      setCountry: (code, name) => set({ country: code, countryName: name }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      acceptTerms: () => set({ hasAcceptedTerms: true }),
      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          hasAcceptedTerms: false,
          country: "",
          countryName: "",
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
