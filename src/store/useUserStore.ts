import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SelectedCountry } from "@/types/providers";

// Subscription now carries the country so the same provider in different
// countries can be subscribed to independently.
type Subscription = {
  providerId: number;
  countryCode: string;
};

type UserState = {
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;

  countries: SelectedCountry[];
  addCountry: (country: SelectedCountry) => void;
  removeCountry: (code: string) => void;
  removeAllCountries: () => void;

  subscriptions: Subscription[];
  addSubscription: (providerId: number, countryCode: string) => void;
  removeSubscription: (providerId: number, countryCode: string) => void;
  isSubscribed: (providerId: number, countryCode: string) => boolean;

  completeOnboarding: () => void;
  toggleTerms: () => void;
  resetOnboarding: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      hasAcceptedTerms: false,
      countries: [],
      subscriptions: [],

      addCountry: (country) =>
        set((state) => {
          const exists = state.countries.some((c) => c.code === country.code);
          if (exists) return state;
          return { countries: [...state.countries, country] };
        }),

      removeCountry: (code) =>
        set((state) => ({
          countries: state.countries.filter((c) => c.code !== code),
        })),

      removeAllCountries: () => set({ countries: [] }),

      addSubscription: (providerId, countryCode) =>
        set((state) => {
          const exists = state.subscriptions.some(
            (s) => s.providerId === providerId && s.countryCode === countryCode,
          );
          if (exists) return state;
          return {
            subscriptions: [
              ...state.subscriptions,
              { providerId, countryCode },
            ],
          };
        }),

      removeSubscription: (providerId, countryCode) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter(
            (s) =>
              !(s.providerId === providerId && s.countryCode === countryCode),
          ),
        })),

      // Selector helper so components don't need to replicate the lookup logic.
      isSubscribed: (providerId, countryCode) =>
        get().subscriptions.some(
          (s) => s.providerId === providerId && s.countryCode === countryCode,
        ),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      toggleTerms: () =>
        set((state) => ({ hasAcceptedTerms: !state.hasAcceptedTerms })),

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
