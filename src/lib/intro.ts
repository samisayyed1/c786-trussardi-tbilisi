const SESSION_KEY = 'c786:intro-played';

/** True when the cinematic intro has already run in this browsing session. */
export function introAlreadyPlayed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    // Private modes can throw on storage access; degrade to showing it.
    return false;
  }
}

/** Records that the intro has run, so it does not replay on the next section. */
export function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Non-fatal: the intro simply plays again next time.
  }
}
