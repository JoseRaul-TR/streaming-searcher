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

type ModePreference = "system" | "light" | "dark";

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

  modePreference: ModePreference;
  setModePreference: (preference: ModePreference) => void;
  systemScheme: "light" | "dark";
  setSystemScheme: (scheme: "light" | "dark") => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      hasAcceptedTerms: false,
      countries: [],
      subscriptions: [],
      modePreference: "system",
      systemScheme: "dark",
      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),

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

      // resetOnboarding only resets search settings (country and streaming services choices). No reset to modePreference.
      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          hasAcceptedTerms: false,
          countries: [],
          subscriptions: [],
        }),

      setModePreference: (preference) => set({ modePreference: preference }),

      setSystemScheme: (scheme) => set({ systemScheme: scheme }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Explicit list of what DOES persists - systemScheme stays out
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasAcceptedTerms: state.hasAcceptedTerms,
        countries: state.countries,
        subscriptions: state.subscriptions,
        modePreference: state.modePreference,
      }),
    },
  ),
);
