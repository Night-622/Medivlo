/** Short human codes: no 0/O/1/I/L to avoid misreads. Join codes 6 chars, friend codes 8 (XXXX-XXXX). */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function randomCode(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export const newJoinCode = (): string => randomCode(6);
export const newFriendCode = (): string => { const c = randomCode(8); return `${c.slice(0, 4)}-${c.slice(4)}`; };

/** Normalise user input: uppercase, strip spaces/dashes. Returns null if it can't be a code. */
export function normaliseCode(s: string): string | null {
  const v = s.toUpperCase().replace(/[\s-]/g, '');
  return /^[A-HJ-KM-NP-Z2-9]+$/.test(v) ? v : null;
}
