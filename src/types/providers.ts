export type Country = {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
};

export type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

export type WatchProvidersData = {
  link?: string; // Official JustWatch link
  free?: Provider[];
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
};
