import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatError(error: any): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    return error.map((e) => (typeof e === 'object' ? e.msg || JSON.stringify(e) : String(e))).join(", ");
  }
  if (typeof error === "object") {
    return error.message || error.detail || JSON.stringify(error);
  }
  return String(error);
}
