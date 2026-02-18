export const AttachmentType = {
  DRAWING: "DRAWING",
  CUBE_7_DAY: "CUBE_7_DAY",
  CUBE_28_DAY: "CUBE_28_DAY",
  INTEGRITY_TEST: "INTEGRITY_TEST",
  ECCENTRICITY_CHECK: "ECCENTRICITY_CHECK",
  PILE_READING: "PILE_READING",
  OTHER: "OTHER",
} as const;

export type AttachmentType = (typeof AttachmentType)[keyof typeof AttachmentType];