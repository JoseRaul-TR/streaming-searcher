# FoundIt (streaming-searcher)

Find where to watch any movie, series or person — across any country, on any streaming service.

Built with React Native, Expo and TypeScript as a final project for a mobile development course.

<img width="98.33" height="213" alt="Captura 2026-03-20 a las 14 14 00" src="https://github.com/user-attachments/assets/7776ca51-4ba8-40b2-9a9f-4c948b451175" />

<img width="98.33" height="213" alt="Captura 2026-03-19 a las 7 50 29" src="https://github.com/user-attachments/assets/ede3c99a-2265-422a-81c9-a56ca84934ce" />

<img width="98.33" height="213" alt="Captura 2026-03-19 a las 7 52 10" src="https://github.com/user-attachments/assets/4740dd86-3e15-410f-97c8-531a323ff9af" />

<img width="98.33" height="213" alt="Captura 2026-03-19 a las 7 54 14" src="https://github.com/user-attachments/assets/5018f043-de6e-4ff6-b31e-0455d1115c14" />

<img width="98.33" height="213" alt="Captura 2026-03-19 a las 7 54 33" src="https://github.com/user-attachments/assets/a498d927-3d2d-4f19-b7e4-afdcebf5125e" />

<img width="98.33" height="213" alt="Captura 2026-03-19 a las 7 54 56" src="https://github.com/user-attachments/assets/13991da6-681e-4ea3-b5b9-05d9845e70bc" />

<img width="98.33" height="213" alt="Captura 2026-03-19 a las 7 55 05" src="https://github.com/user-attachments/assets/8a48ea2a-202b-4c67-a8d2-25f206862b08" />

---

## Features

- Search movies, TV series and people via the TMDB API
- Check streaming availability by country (Free, Stream, Rent, Buy)
- Select one or more countries to filter results, or search globally
- Mark the streaming services you subscribe to — they are highlighted in results
- Save titles to a personal watchlist
- Filter and sort the watchlist by type, title or release year
- Light / Dark / System theme
- Animated provider subscription feedback

---

## Tech Stack

| Technology        | Role                                    |
| ----------------- | --------------------------------------- |
| React Native 0.83 | Cross-platform mobile UI                |
| Expo SDK 55       | Build tooling and native modules        |
| Expo Router       | File-based navigation (Stack + Tabs)    |
| TypeScript        | Static typing throughout                |
| Zustand + Persist | Global state + AsyncStorage persistence |
| TanStack Query v5 | API caching and async state             |
| TMDB API v3       | Movie, TV and streaming data            |

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/streaming-searcher.git
cd streaming-searcher
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```
EXPO_PUBLIC_TMDB_BEARER_TOKEN=your_token_here
```

Get a free Bearer token at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

### 4. Run the app

```bash
npx expo start
```

Then scan the QR code with **Expo Go** on your device, or press `a` for Android emulator / `i` for iOS simulator.

---

## Project Structure

```
src/
├── app/                        # Expo Router screens and layouts
│   ├── _layout.tsx             # Root layout — QueryClient, SafeAreaProvider
│   ├── index.tsx               # Entry point — redirects to onboarding or tabs
│   ├── onboarding.tsx          # 4-step onboarding flow
│   ├── details.tsx             # Movie / TV / Person detail screen
│   └── (tabs)/
│       ├── _layout.tsx         # Tab bar configuration
│       ├── index.tsx           # Explore / Search screen
│       ├── watchlist.tsx       # Personal watchlist
│       └── settings.tsx        # App preferences
│
├── components/
│   ├── common/                 # Generic reusable components
│   │   ├── ApiStateDisplay.tsx # Loading / error / empty states
│   │   ├── FadeView.tsx        # Fade-in animation wrapper
│   │   ├── InfoTooltip.tsx     # Info icon with modal overlay
│   │   ├── ModalHeader.tsx     # Shared modal header (back + title)
│   │   └── PillButton.tsx      # Rounded pill button (primary/secondary/ghost)
│   ├── media/                  # Content-specific components
│   │   ├── CountryProviderSection.tsx
│   │   ├── KnownForSection.tsx
│   │   ├── MediaCard.tsx
│   │   ├── ProviderLogo.tsx
│   │   └── ProvidersSection.tsx
│   ├── modals/
│   │   ├── CountryPickerModal.tsx
│   │   ├── SubscriptionPickerModal.tsx
│   │   └── TermsModal.tsx
│   ├── search/
│   │   ├── CountryAutocomplete.tsx
│   │   └── SearchBar.tsx
│   └── watchlist/
│       └── WatchlistControls.tsx
│
├── constants/
│   └── colors.ts               # Color tokens + withOpacity helper
│
├── hooks/
│   ├── useMode.ts              # Resolves active color scheme
│   ├── useProvidersByCountry.ts
│   ├── useSearch.ts            # Debounced search + TanStack Query
│   └── useWatchProviders.ts
│
├── services/
│   └── api.ts                  # TMDB API wrapper (fetchTMDB<T>)
│
├── store/
│   └── useUserStore.ts         # Zustand store with AsyncStorage persistence
│
├── types/
│   ├── providers.ts
│   ├── searchedItem.ts
│   └── watchlist.ts
│
└── utils/
    ├── format.ts               # formatCount, formatCountriesPickerLabel
    └── shadow.ts               # getShadow — cross-platform shadow helper
```

---

## Environment Variables

| Variable                        | Description                                       |
| ------------------------------- | ------------------------------------------------- |
| `EXPO_PUBLIC_TMDB_BEARER_TOKEN` | TMDB v4 Bearer token. Required for all API calls. |

---

## API

All TMDB communication is handled by a single generic fetcher:

```ts
async function fetchTMDB<T>(path: string): Promise<T>;
```

| Endpoint | Used for |
|----------|----------|
| `GET /3/search/multi` | Search movies, TV shows and people |
| `GET /3/watch/providers/regions` | List all available countries |
| `GET /3/watch/providers/{movie\|tv}?watch_region=` | Providers available in a country |
| `GET /3/{type}/{id}/watch/providers` | Streaming availability for a title |
| `GET /3/{type}/{id}` | Title details (fallback for watchlist items) |

---

## TypeScript

The project is configured with strict TypeScript:

```jsonc
{
  "strict": true,
  "noImplicitAny": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "allowUnreachableCode": false,
}
```

Run the type checker with:

```bash
npx tsc --noEmit
```

---

## Data attribution

Streaming data is provided by [JustWatch](https://www.justwatch.com/) via the TMDB API.
This product uses the TMDB API but is not endorsed or certified by TMDB.

## Author

@JoseRaul-TR
