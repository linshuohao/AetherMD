/**
 * GateLock for controlled Markdown props: skip apply when prev and next strings are equal.
 */
export function shouldApplyControlledValue(
  prev: string | undefined,
  next: string | undefined,
): boolean {
  if (next === undefined) {
    return false;
  }

  if (prev === undefined) {
    return true;
  }

  return prev !== next;
}
