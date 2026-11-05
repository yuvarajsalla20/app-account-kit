/** The same minimum as app-auth-kit, so the page never accepts what the sign-in kit would refuse. */
export const MIN_PASSWORD = 8;

export type PasswordProblem = 'current' | 'short' | 'same' | 'mismatch';

interface Entered {
  current: string;
  next: string;
  confirm: string;
  /** The shortest allowed new password. */
  min?: number;
}

/** What is wrong with the three boxes on the Change password page, or null when it can be saved. */
export const passwordProblem = ({ current, next, confirm, min = MIN_PASSWORD }: Entered): PasswordProblem | null => {
  if (!current) return 'current';
  if (next.length < min) return 'short';
  if (next === current) return 'same';
  if (next !== confirm) return 'mismatch';
  return null;
};
