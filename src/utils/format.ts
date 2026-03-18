/**
 * Shared formatting helpers.
 *
 * Centralises display logic that would otherwise be duplicated across
 * store selectors, modal headers, and settings labels.
 */

/**
 * Returns a human-readable count string with automatic pluralisation.
 *
 * formatCount(0, "service")          → "No services"
 * formatCount(1, "service")          → "1 service"
 * formatCount(3, "service")          → "3 services"
 * formatCount(3, "country","countries") → "3 countries"
 */
export function formatCount(
  count: number,
  singular: string,
  plural?: string,
): string {
  const pluralForm = plural ?? `${singular}s`;
  if (count === 0) return `No ${pluralForm}`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Returns a label for a list of selected countries.
 *
 * []                    → "All countries"
 * [{ name: "Sweden" }]  → "Sweden"
 * [SE, ES, FR]          → "Sweden +2 more"
 */
export function formatCountriesLabel(countries: { name: string }[]): string {
  if (countries.length === 0) return "All countries";
  if (countries.length === 1) return countries[0].name;
  return `${countries[0].name} +${countries.length - 1} more`;
}

/**
 * Returns a label for a list of selected countries in onboarding context,
 * where the empty state reads differently.
 *
 * []                    → "Select countries (optional)"
 * [{ name: "Sweden" }]  → "Sweden"
 * [SE, ES]              → "2 countries selected"
 */
export function formatCountriesPickerLabel(
  countries: { name: string }[],
): string {
  if (countries.length === 0) return "Select countries (optional)";
  if (countries.length === 1) return countries[0].name;
  return `${countries.length} countries selected`;
}
