const STORAGE_KEY = "heartHaxor_saved_emails";
const MAX_SAVED = 8;

export function getSavedEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((e): e is string => typeof e === "string") : [];
  } catch {
    return [];
  }
}

export function rememberEmail(email: string): void {
  if (typeof window === "undefined" || !email?.trim()) return;
  const normalized = email.trim().toLowerCase();
  const list = getSavedEmails().filter((e) => e.toLowerCase() !== normalized);
  list.unshift(email.trim());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_SAVED)));
}
