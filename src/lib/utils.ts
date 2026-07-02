import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency.
 * Defaults to INR (₹) since we use Razorpay.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "INR",
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // Replace spaces with -
    .replace(/[^\w\-]+/g, "")    // Remove non-word chars
    .replace(/\-\-+/g, "-")     // Replace multiple - with single -
    .replace(/^-+/, "")          // Trim - from start
    .replace(/-+$/, "")          // Trim - from end
}

/**
 * Simple HTML sanitizer to prevent XSS.
 * Removes <script>, <embed>, <object>, <iframe>, <style>, and any event handler attributes.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, "")
    .replace(/<embed[^>]*>([\s\S]*?)<\/embed>/gi, "")
    .replace(/<object[^>]*>([\s\S]*?)<\/object>/gi, "")
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
    .replace(/on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, "") // remove onmouseover, onclick, etc.
    .replace(/javascript:/gi, "");
}

/**
 * Parses description HTML string to extract highlights and specifications stored as HTML comments.
 */
export function parseProductDescription(rawDescription: string | null) {
  if (!rawDescription) {
    return { html: "", highlights: [] as string[], specifications: {} as Record<string, string> };
  }
  const match = rawDescription.match(/<!--DATA:([\s\S]*?)-->/);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      const html = rawDescription.replace(/<!--DATA:[\s\S]*?-->/, "").trim();
      return {
        html,
        highlights: (data.highlights as string[]) || [],
        specifications: (data.specifications as Record<string, string>) || {},
      };
    } catch (e) {
      console.error("Failed to parse product metadata:", e);
    }
  }
  return { html: rawDescription, highlights: [] as string[], specifications: {} as Record<string, string> };
}

/**
 * Serializes highlights and specifications as an HTML comment block appended to the description HTML string.
 */
export function serializeProductDescription(html: string, highlights: string[], specifications: Record<string, string>) {
  const cleanHtml = html.replace(/<!--DATA:[\s\S]*?-->/, "").trim();
  const data = { highlights, specifications };
  return `${cleanHtml}\n\n<!--DATA:${JSON.stringify(data)}-->`;
}

