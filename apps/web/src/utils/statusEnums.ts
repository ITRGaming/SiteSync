export const IntegrityStatus = {
  OK: "OK",
  SOFT_TOE: "SOFT_TOE",
  OTHER: "OTHER",
} as const;

export const EccentricityStatus = {
  OK: "OK",
  BELOW_50MM: "0 - 50mm",
  BELOW_100MM: "50 - 100mm",
  ABOVE_100MM: "100mm & Above",
} as const;

export type IntegrityStatusType =
  (typeof IntegrityStatus)[keyof typeof IntegrityStatus];
export type EccentricityStatusType =
  (typeof EccentricityStatus)[keyof typeof EccentricityStatus];
