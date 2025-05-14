import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export function formatMoney(amount: number): string {
  // Amount is stored in cents, convert to pounds
  const pounds = amount / 100;
  return `£${pounds.toFixed(2)}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function formatDurationHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
}

export function getDaysOfWeek(): string[] {
  return ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
}

export function getDayAbbreviations(): string[] {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}
