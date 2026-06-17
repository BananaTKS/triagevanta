import type { TicketCategory } from "@/db/schema";

// Keyword hints per category. Pure + dependency-free so it can be unit-tested
// and reused (e.g. ticket auto-labelling on creation).
const KEYWORDS: Record<Exclude<TicketCategory, "other">, string[]> = {
  network: [
    "wifi",
    "wi-fi",
    "network",
    "vpn",
    "ethernet",
    "internet",
    "dns",
    "router",
    "connection",
    "offline",
  ],
  hardware: [
    "laptop",
    "monitor",
    "keyboard",
    "mouse",
    "screen",
    "battery",
    "charger",
    "docking",
    "printer",
    "hardware",
    "webcam",
    "headset",
  ],
  software: [
    "install",
    "software",
    "application",
    "license",
    "outlook",
    "excel",
    "office",
    "teams",
    "adobe",
    "update",
    "crash",
  ],
  access: [
    "password",
    "login",
    "log in",
    "account",
    "access",
    "locked",
    "mfa",
    "2fa",
    "sso",
    "okta",
    "permission",
    "reset",
    "unlock",
  ],
};

/**
 * Infer a ticket category from its text by counting keyword hits.
 * Returns the best-scoring category, or null when nothing matches.
 */
export function categorizeTicket(
  title: string,
  description: string,
): TicketCategory | null {
  const text = `${title} ${description}`.toLowerCase();
  let best: { category: TicketCategory; score: number } | null = null;

  for (const [category, words] of Object.entries(KEYWORDS) as [
    TicketCategory,
    string[],
  ][]) {
    let score = 0;
    for (const word of words) {
      if (text.includes(word)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { category, score };
    }
  }

  return best?.category ?? null;
}
