/**
 * Converts ISO String (API) to datetime-local format (Input)
 */
export const toDateTimeLocal = (isoString: string | null): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const DD = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
};

/**
 * Converts datetime-local (Input) back to ISO String (API)
 */
export const toISO = (localString: string | null): string | null => {
  if (!localString) return null;
  const date = new Date(localString);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * Extracts HH:mm from ISO string for standard time inputs
 */
export const formatIsoToTime = (isoString: string | null): string => {
  if (!isoString) return "";
  if (!isoString.includes("T")) return isoString;

  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

/**
 * Combines a Date part (YYYY-MM-DD) with a Time part (HH:mm) into ISO
 */
export const combineDateAndTime = (
  datePart: string | undefined,
  timeStr: string | null,
): string | null => {
  if (!timeStr || !datePart) return null;
  if (timeStr.includes("T")) return timeStr;

  const combined = new Date(`${datePart.split("T")[0]}T${timeStr}`);
  return isNaN(combined.getTime()) ? null : combined.toISOString();
};
