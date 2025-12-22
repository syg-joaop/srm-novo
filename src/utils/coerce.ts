export const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") return value;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

export const firstNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const parsed = toNumber(value);
    if (parsed !== undefined) return parsed;
  }
  return undefined;
};

export const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    const parsed = toStringValue(value);
    if (parsed !== undefined) return parsed;
  }
  return undefined;
};

