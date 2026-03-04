declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_TMDB_API_URL: string;
      EXPO_PUBLIC_TMDB_BEARER_TOKEN: string;
    }
  }
}

export {};