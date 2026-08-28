/**
 * Utility formatters for Finora in Bahasa Indonesia
 */

export function formatIDR(amount: number, withPrefix = true): string {
  const absoluteAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absoluteAmount);

  if (!withPrefix) {
    return formatted;
  }

  return `Rp${formatted}`;
}

export function formatCompactIDR(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `Rp${(amount / 1_000_000_000).toFixed(1).replace(".0", "")}M`;
  }
  if (abs >= 1_000_000) {
    return `Rp${(amount / 1_000_000).toFixed(1).replace(".0", "")}jt`;
  }
  if (abs >= 1_000) {
    return `Rp${(amount / 1_000).toFixed(0)}rb`;
  }
  return formatIDR(amount);
}

export const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const INDONESIAN_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function formatDateIndo(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatRelativeDateIndo(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return "Hari ini";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Kemarin";
  }

  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()];
  return `${day} ${month}`;
}
