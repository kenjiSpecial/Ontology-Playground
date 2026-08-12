/**
 * Resolve display-only catalogue overlay fields without changing ontology
 * identity or the values used by selection, matching, bindings, or export.
 */

export interface DisplayNameSource {
  name?: string;
  displayName?: string;
}

export interface DisplayDescriptionSource {
  description?: string;
  displayDescription?: string;
}

function firstText(displayText: string | undefined, internalText: string | undefined, fallback: string): string {
  return displayText?.trim() ? displayText : internalText?.trim() ? internalText : fallback;
}

export function getDisplayName(source: DisplayNameSource | undefined, fallback = ''): string {
  return firstText(source?.displayName, source?.name, fallback);
}

export function getDisplayDescription(source: DisplayDescriptionSource | undefined): string | undefined {
  if (source?.displayDescription?.trim()) return source.displayDescription;
  return source?.description;
}

export function getDisplayValue(internalValue: string, displayValues?: Record<string, string>): string {
  const displayValue = displayValues?.[internalValue];
  return displayValue?.trim() ? displayValue : internalValue;
}

export function getSearchableValues(source: DisplayNameSource | undefined, fallback = ''): string[] {
  const values = [source?.displayName, source?.name, fallback].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  return [...new Set(values)];
}

/** Return true when query occurs in any display or internal value. */
export function matchesSearch(query: string, ...values: Array<string | undefined>): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;
  return values.some((value) => value?.toLocaleLowerCase().includes(normalizedQuery));
}
