/**
 * Shared formatting helpers.
 *
 * Centralizes display logic that would otherwise be duplicated across
 * modals, settings labels and onboarding screens.
 */

/**
 * Returns a human-readable count string with automatic pluralization.
 *
 * @param count - The numeric quantity to describe.
 * @param singular - The singular form of the noun (e.g. "service", "country").
 * @param plural - Optional explicit plural form. If omitted, an "s" is appended
 *                 to the singular (e.g. "service" → "services").
 * @returns A formatted string:
 *   - count === 0  → "No {plural}"         (e.g. "No services")
 *   - count === 1  → "1 {singular}"        (e.g. "1 service")
 *   - count > 1   → "{count} {plural}"    (e.g. "3 services")
 *
 * @example
 * formatCount(0, "service")              // "No services"
 * formatCount(1, "service")              // "1 service"
 * formatCount(3, "service")              // "3 services"
 * formatCount(3, "country", "countries") // "3 countries"
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
 * @param countries - The array of currently selected SelectedCountry objects.
 *                    Only the name property is used from each element.
 * @returns A display string:
 *   - Empty array  → "All countries"
 *   - 1 country    → the country's name (e.g. "Sweden")
 *   - 2+ countries → "{country} and {n} more (e.g. "Sweden and 6 more")
 */
export function formatCountriesLabel(countries: { name: string }[]): string {
  if (countries.length === 0) return "All countries";
  if (countries.length === 1) return countries[0].name;
  return `${countries[0].name} and ${countries.length - 1} more`;
}

/**
 * Returns a label describing the current country selection for use in
 * onboarding step 1 and the country selector pill.
 *
 * @param countries - The array of currently selected SelectedCountry objects.
 *                    Only the name property is used from each element.
 * @returns A display string:
 *   - Empty array  → "Select countries (optional)"
 *   - 1 country    → the country's name (e.g. "Sweden")
 *   - 2+ countries → "{n} countries selected" (e.g. "3 countries selected")
 *
 * @example
 * formatCountriesPickerLabel([])                         // "Select countries (optional)"
 * formatCountriesPickerLabel([{ name: "Sweden" }])       // "Sweden"
 * formatCountriesPickerLabel([{ name: "Sweden" }, ...])  // "3 countries selected"
 */
export function formatCountriesPickerLabel(
  countries: { name: string }[],
): string {
  if (countries.length === 0) return "Select countries (optional)";
  if (countries.length === 1) return countries[0].name;
  return `${countries.length} countries selected`;
}
