import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DATE_LOCALE } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHoursToFriendlyString(totalHours?: number): string {
  if (totalHours === undefined || isNaN(totalHours) || totalHours < 0) return "N/D";
  if (totalHours === 0) return "0min";

  const hours = Math.floor(totalHours);
  const minutes = Math.floor((totalHours - hours) * 60);
  let result = "";
  if (hours > 0) result += `${hours}h`;
  if (minutes > 0) result += (result.length > 0 ? " " : "") + `${minutes}min`;
  if (result === "" && totalHours > 0) return "<1min"; // For very small positive values
  return result || "0min";
}


export function getStartDateOfWeekFromISOIdentifier(weekString?: string | null): Date | null {
    if (!weekString || typeof weekString !== 'string' || !weekString.includes('-W')) {
        return null;
    }
    const parts = weekString.split('-W');
    if (parts.length !== 2) return null;

    const year = parseInt(parts[0]);
    const week = parseInt(parts[1]);

    if (isNaN(year) || isNaN(week) || week < 1 || week > 53) { // Week 53 can happen
        return null;
    }
    
    // Create a date for Jan 4th of the year, then adjust to Monday of week 1
    const jan4th = new Date(Date.UTC(year, 0, 4));
    const firstMondayOfYear = new Date(jan4th);
    firstMondayOfYear.setUTCDate(jan4th.getUTCDate() - (jan4th.getUTCDay() || 7) + 1);

    // Add (week - 1) * 7 days to get to the Monday of the target week
    const targetMonday = new Date(firstMondayOfYear);
    targetMonday.setUTCDate(firstMondayOfYear.getUTCDate() + (week - 1) * 7);
    
    return targetMonday;
}

export function formatWeekIdentifierToDateDisplay(weekIdentifier?: string | null): string {
    const startOfWeekDate = getStartDateOfWeekFromISOIdentifier(weekIdentifier); 
    if (!startOfWeekDate || isNaN(startOfWeekDate.getTime())) {
        return weekIdentifier || 'N/A'; 
    }
    
    // Using UTC methods to avoid timezone issues with date part extraction
    const day = String(startOfWeekDate.getUTCDate()).padStart(2, '0');
    const month = String(startOfWeekDate.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    return `${day}/${month}`;
}

export function formatDateToDdMmYyyy(date?: Date | null): string {
  if (!date || isNaN(date.getTime())) return '-';
  try {
    return date.toLocaleDateString(DATE_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    // Fallback for environments where toLocaleDateString might fail with options
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
}

// Helper to get unique sorted values for select options
export function getUniqueValues<T extends Record<string, any>>(data: T[], key: keyof T, sort = true): string[] {
  const values = [...new Set(data.map(item => String(item[key])).filter(Boolean))];
  if (sort) {
    values.sort((a, b) => {
      if (!isNaN(Number(a)) && !isNaN(Number(b))) return Number(a) - Number(b);
      return a.localeCompare(b);
    });
  }
  return values;
}
