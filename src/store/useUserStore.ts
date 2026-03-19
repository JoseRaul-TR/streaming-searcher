import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SelectedCountry } from "@/types/providers";
import { WatchlistItem } from "@/types/watchlist";

/**
 * A subscription entry that ties a streaming provider to the specific country
 * the user subscribed to it in. Using a composite key (providerId + countryCode)
 * means that subscribing to Netflix in Sweden does not automatically highlight
 * Netflix in Spain.
 */
type Subscription = {
  providerId: number;
  countryCode: string;
};

/** The three possible values for the user's theme preference. */
type ModePreference = "system" | "light" | "dark";

type UserState = {
  // ── Onboarding ──────────────────────────────────────────────────────────
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;

  // ── Countries ───────────────────────────────────────────────────────────
  countries: SelectedCountry[];

  /**
   * Adds a country to the selection if it is not already present.
   *
   * @param country - A SelectedCountry object with code (ISO 3166-1) and name.
   */
  addCountry: (country: SelectedCountry) => void;

  /**
   * Removes a country from the selection by its ISO 3166-1 code.
   *
   * @param code - The ISO 3166-1 alpha-2 code of the country to remove (e.g. "SE").
   */
  removeCountry: (code: string) => void;

  /** Clears all selected countries, switching the app to global mode. */
  removeAllCountries: () => void;

  // ── Subscriptions ────────────────────────────────────────────────────────
  subscriptions: Subscription[];

  /**
   * Adds a subscription if the same (providerId, countryCode) pair does not already exist.
   *
   * @param providerId - The TMDB numeric provider_id (e.g. 8 for Netflix).
   * @param countryCode - The ISO 3166-1 code of the country the subscription is for.
   */
  addSubscription: (providerId: number, countryCode: string) => void;

  /**
   * Removes the subscription matching the given (providerId, countryCode) pair.
   *
   * @param providerId - The TMDB numeric provider_id.
   * @param countryCode - The ISO 3166-1 code of the country.
   */
  removeSubscription: (providerId: number, countryCode: string) => void;

  /**
   * Returns true if the user is subscribed to the given provider in the given country.
   * Used by ProviderSection and CountryProviderSection to highlight matching logos.
   *
   * @param providerId - The TMDB numeric provider_id to look up.
   * @param countryCode - The ISO 3166-1 code of the country to check.
   * @returns True if a matching Subscription entry exists in the store.
   */
  isSubscribed: (providerId: number, countryCode: string) => boolean;

  // ── Onboarding flow ──────────────────────────────────────────────────────
  /**
   * Marks onboarding as complete, triggering a redirect to /(tabs) via index.tsx.
   */
  completeOnboarding: () => void;

  /**
   * Toggles hasAcceptedTerms between true and false.
   * Bound to the terms checkbox in onboarding step 3.
   */
  toggleTerms: () => void;

  /**
   * Resets all user data except modePreference, returning the app to its
   * initial state. Clears onboarding, terms, countries, subscriptions, and watchlist.
   * Triggers a redirect to /onboarding in SettingsScreen.
   */
  resetApp: () => void;

  // ── Theme ────────────────────────────────────────────────────────────────
  modePreference: ModePreference;

  /**
   * Sets the user's theme preference.
   *
   * @param preference - "system" (follows OS), "light", or "dark".
   */
  setModePreference: (preference: ModePreference) => void;

  /**
   * The current OS color scheme, updated at runtime by the Appearance listener
   * in _layout.tsx. NOT persisted — reflects the live system value.
   */
  systemScheme: "light" | "dark";

  /**
   * Updates the stored OS color scheme. Called by Appearance.addChangeListener
   * in AppLayout whenever the OS theme changes.
   *
   * @param scheme - The new OS color scheme: "light" or "dark".
   */
  setSystemScheme: (scheme: "light" | "dark") => void;

  // ── Search ───────────────────────────────────────────────────────────────
  /**
   * The current search query text. Stored in the Zustand store (not local state)
   * so it survives navigation — the user returns to the same query after going
   * to details and pressing back. Excluded from persist so it resets on app restart.
   */
  searchQuery: string;

  /**
   * Sets the search query text.
   *
   * @param q - The new query string from the SearchBar TextInput.
   */
  setSearchQuery: (q: string) => void;

  // ── Watchlist ─────────────────────────────────────────────────────────────
  watchlist: WatchlistItem[];

  /**
   * Adds a title to the watchlist if it is not already present.
   * New items are prepended (most recently added appears first by default).
   *
   * @param item - A WatchlistItem with id, media_type, title, year, poster_path,
   *               and added_at (Date.now() timestamp).
   */
  addToWatchlist: (item: WatchlistItem) => void;

  /**
   * Removes a title from the watchlist by its composite key (id + media_type).
   *
   * @param id - The TMDB numeric id of the title.
   * @param mediaType - "movie" or "tv" — required because TMDB can assign the
   *                    same numeric id to both a movie and a series.
   */
  removeFromWatchlist: (id: number, mediaType: "movie" | "tv") => void;

  /**
   * Returns true if the title identified by (id, mediaType) is in the watchlist.
   * Used by MediaCard and DetailsScreen to show the correct bookmark icon state.
   *
   * @param id - The TMDB numeric id of the title.
   * @param mediaType - "movie" or "tv".
   * @returns True if a matching WatchlistItem exists in the store.
   */
  isInWatchlist: (id: number, mediaType: "movie" | "tv") => boolean;
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
      watchlist: [],

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

      isSubscribed: (providerId, countryCode) =>
        get().subscriptions.some(
          (s) => s.providerId === providerId && s.countryCode === countryCode,
        ),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      toggleTerms: () =>
        set((state) => ({ hasAcceptedTerms: !state.hasAcceptedTerms })),

      resetApp: () =>
        set({
          hasCompletedOnboarding: false,
          hasAcceptedTerms: false,
          countries: [],
          subscriptions: [],
          watchlist: [],
          modePreference: "system",
        }),

      setModePreference: (preference) => set({ modePreference: preference }),

      setSystemScheme: (scheme) => set({ systemScheme: scheme }),

      addToWatchlist: (item) =>
        set((state) => {
          const exists = state.watchlist.some(
            (w) => w.id === item.id && w.media_type === item.media_type,
          );
          if (exists) return state;
          // Prepend so the most recently added item appears first
          // in the default "Recently Added" sort order.
          return { watchlist: [item, ...state.watchlist] };
        }),

      removeFromWatchlist: (id, mediaType) =>
        set((state) => ({
          watchlist: state.watchlist.filter(
            (w) => !(w.id === id && w.media_type === mediaType),
          ),
        })),

      isInWatchlist: (id, mediaType) =>
        get().watchlist.some((w) => w.id === id && w.media_type === mediaType),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Explicit whitelist of fields that persist to AsyncStorage.
      // systemScheme and searchQuery are intentionally excluded:
      // systemScheme is always refreshed from the OS at startup;
      // searchQuery should reset between sessions.
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasAcceptedTerms: state.hasAcceptedTerms,
        countries: state.countries,
        subscriptions: state.subscriptions,
        modePreference: state.modePreference,
        watchlist: state.watchlist,
      }),
    },
  ),
);
