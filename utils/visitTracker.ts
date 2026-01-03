// Visit Tracker Utility
// Tracks total visits and unique visitors using localStorage + counter API

const VISIT_KEY = 'convertly_visited';
const VISIT_COUNT_KEY = 'convertly_visit_count';
const LAST_VISIT_KEY = 'convertly_last_visit';

export interface VisitStats {
  totalVisits: number;
  isNewVisitor: boolean;
  lastVisit: string | null;
}

/**
 * Check if this is a new visitor (first time visiting)
 */
export function isNewVisitor(): boolean {
  if (typeof window === 'undefined') return true;
  return !localStorage.getItem(VISIT_KEY);
}

/**
 * Mark the current user as having visited
 */
export function markAsVisited(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VISIT_KEY, 'true');
  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
}

/**
 * Get the local visit count (how many times this user has visited)
 */
export function getLocalVisitCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem(VISIT_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

/**
 * Increment local visit count
 */
export function incrementLocalVisitCount(): number {
  if (typeof window === 'undefined') return 0;
  const current = getLocalVisitCount();
  const newCount = current + 1;
  localStorage.setItem(VISIT_COUNT_KEY, newCount.toString());
  return newCount;
}

/**
 * Get last visit timestamp
 */
export function getLastVisit(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_VISIT_KEY);
}

/**
 * Fetch total visits from counter API
 * @param increment - Whether to increment the counter (true for new page loads)
 */
export async function fetchTotalVisits(increment: boolean = false): Promise<number> {
  try {
    const endpoint = increment
      ? 'https://api.counterapi.dev/v1/convertly-visits/total/up'
      : 'https://api.counterapi.dev/v1/convertly-visits/total/get';

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Failed to fetch visit count');

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error fetching visit count:', error);
    return 0;
  }
}

/**
 * Fetch unique visitors count (only increments for new visitors)
 */
export async function fetchUniqueVisitors(isNew: boolean): Promise<number> {
  try {
    const endpoint = isNew
      ? 'https://api.counterapi.dev/v1/convertly-visitors/unique/up'
      : 'https://api.counterapi.dev/v1/convertly-visitors/unique/get';

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Failed to fetch unique visitors');

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error fetching unique visitors:', error);
    return 0;
  }
}

/**
 * Track a page visit - call this once when the app loads
 * Returns the updated visit stats
 */
export async function trackVisit(): Promise<VisitStats> {
  const isNew = isNewVisitor();
  const lastVisit = getLastVisit();

  // Always increment total visits
  const totalVisits = await fetchTotalVisits(true);

  // Increment unique visitors only for new visitors
  if (isNew) {
    await fetchUniqueVisitors(true);
    markAsVisited();
  }

  // Increment local count
  incrementLocalVisitCount();

  return {
    totalVisits,
    isNewVisitor: isNew,
    lastVisit
  };
}

/**
 * Get current visit stats without incrementing
 */
export async function getVisitStats(): Promise<VisitStats> {
  const isNew = isNewVisitor();
  const lastVisit = getLastVisit();
  const totalVisits = await fetchTotalVisits(false);

  return {
    totalVisits,
    isNewVisitor: isNew,
    lastVisit
  };
}
