/**
 * className utility for NativeWind
 * Combines class names with conditional logic
 * 
 * @example
 * cn("flex-1", isActive && "bg-accent-primary", className)
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
