/**
 * Phone Number Utilities for Turkey (TR) Defaults
 * Handles automatic normalization, input masking, and WhatsApp/Call URL generation.
 */

/**
 * Normalizes and formats Turkish phone number as user types or pastes.
 * Examples:
 *   "5321234567" -> "0532 123 45 67"
 *   "+90 532 123 45 67" -> "0532 123 45 67"
 *   "0532 123 45 67" -> "0532 123 45 67"
 *   "0212 123 45 67" -> "0212 123 45 67" (Landlines supported)
 */
export function normalizeTRPhoneInput(input: string): string {
  if (!input) return "";

  // Remove everything except digits
  let digits = input.replace(/\D/g, "");

  // If user pasted or typed international code: +90 or 90
  if (digits.startsWith("90") && digits.length > 10) {
    digits = digits.slice(2);
  }

  // If starts with 0090
  if (digits.startsWith("0090") && digits.length > 12) {
    digits = digits.slice(4);
  }

  // Ensure leading 0 for Turkish standard (e.g. 5XX -> 05XX)
  if (digits.length > 0 && !digits.startsWith("0")) {
    digits = "0" + digits;
  }

  // Max 11 digits (0 + 10 digits: 05XXXXXXXXX)
  digits = digits.slice(0, 11);

  // Progressive formatting
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
}

/**
 * Formats a phone number for clean UI display.
 */
export function formatTRPhone(phone?: string | null): string {
  if (!phone) return "";
  return normalizeTRPhoneInput(phone);
}

/**
 * Converts any phone format to a clean WhatsApp international number:
 * 905XXXXXXXXX
 */
export function toWhatsAppPhone(phone?: string | null): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0090")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("90") && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // digits should now be 10 digits (e.g. 5321234567)
  return `90${digits}`;
}

/**
 * Generates direct WhatsApp Chat link
 */
export function getWhatsAppUrl(phone?: string | null, message?: string): string {
  const waNumber = toWhatsAppPhone(phone);
  if (!waNumber) return "#";
  const baseUrl = `https://wa.me/${waNumber}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

/**
 * Generates direct Tel call link
 */
export function getTelUrl(phone?: string | null): string {
  const waNumber = toWhatsAppPhone(phone);
  if (!waNumber) return "#";
  return `tel:+${waNumber}`;
}
