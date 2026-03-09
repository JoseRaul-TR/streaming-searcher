import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SelectedCountry } from "@/types/providers";

type UserState = {
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;

  // One or more countries the user wants to search in
  countries: SelectedCountry[];
  addCountry: (country: SelectedCountry) => void;
  removeCountry: (code: string) => void;

  // Provider/s IDs the user is subscribed to
  subscriptions: number[];
  addSubscription: (providerId: number) => void;
  removeSubscription: (providerId: number) => void;

  completeOnboarding: () => void;
  acceptTerms: () => void;
  resetOnboarding: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      hasAcceptedTerms: false,
      countries: [],
      subscriptions: [],

      addCountry: (country) =>
        set((state) => {
          // Avoid duplicates
          const exists = state.countries.some((c) => c.code === country.code);
          if (exists) return state;
          return { countries: [...state.countries, country] };
        }),

      removeCountry: (code) =>
        set((state) => ({
          countries: state.countries.filter((c) => c.code !== code),
        })),

      addSubscription: (providerId) =>
        set((state) => {
          if (state.subscriptions.includes(providerId)) return state;
          return { subscriptions: [...state.subscriptions, providerId] };
        }),

      removeSubscription: (providerId) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((id) => id !== providerId),
        })),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      acceptTerms: () => set({ hasAcceptedTerms: true }),

      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          hasAcceptedTerms: false,
          countries: [],
          subscriptions: [],
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
