/** @doc Lightweight geo / currency detection from the browser. */

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  EG: "EGP", SA: "SAR", AE: "AED", KW: "KWD", QA: "QAR", BH: "BHD", OM: "OMR",
  JO: "JOD", LB: "LBP", IQ: "IQD", YE: "YER", SY: "SYP", PS: "ILS",
  MA: "MAD", DZ: "DZD", TN: "TND", LY: "LYD", SD: "SDG",
  US: "USD", GB: "GBP", CA: "CAD", AU: "AUD",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR", PT: "EUR", IE: "EUR",
  TR: "TRY", IN: "INR", PK: "PKR", BD: "BDT", ID: "IDR", MY: "MYR", PH: "PHP", TH: "THB",
  JP: "JPY", KR: "KRW", CN: "CNY", HK: "HKD", SG: "SGD", BR: "BRL", MX: "MXN",
};

/** Rough USD → local rates (June 2026 ballpark). For display only; final billing uses live rates. */
export const USD_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.78, EGP: 49, SAR: 3.75, AED: 3.67, KWD: 0.31, QAR: 3.64,
  BHD: 0.38, OMR: 0.38, JOD: 0.71, LBP: 89500, IQD: 1310, YER: 250, SYP: 13000,
  ILS: 3.7, MAD: 9.9, DZD: 134, TND: 3.1, LYD: 4.85, SDG: 601,
  CAD: 1.36, AUD: 1.5, TRY: 32, INR: 83, PKR: 278, BDT: 110, IDR: 16000,
  MYR: 4.7, PHP: 58, THB: 36, JPY: 156, KRW: 1380, CNY: 7.25, HKD: 7.8, SGD: 1.34,
  BRL: 5.4, MXN: 17,
};

const STORAGE_KEY = "user_country";

export function getStoredCountry(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredCountry(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code.toUpperCase());
  } catch {
    /* ignore */
  }
}

/** Quick guess from browser (no network). Returns ISO-2 country code or null. */
export function guessCountryFromBrowser(): string | null {
  if (typeof navigator === "undefined") return null;
  const langs = [navigator.language, ...(navigator.languages || [])];
  for (const lang of langs) {
    if (!lang) continue;
    const m = lang.match(/-([A-Z]{2})/i);
    if (m) return m[1].toUpperCase();
  }
  // Try timezone heuristic
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const TZ_MAP: Record<string, string> = {
      "Africa/Cairo": "EG", "Asia/Riyadh": "SA", "Asia/Dubai": "AE",
      "Asia/Kuwait": "KW", "Asia/Qatar": "QA", "Asia/Bahrain": "BH",
      "Asia/Muscat": "OM", "Asia/Amman": "JO", "Asia/Beirut": "LB",
      "Asia/Baghdad": "IQ", "Africa/Casablanca": "MA", "Africa/Algiers": "DZ",
      "Africa/Tunis": "TN", "Africa/Tripoli": "LY", "Asia/Shanghai": "CN",
    };
    if (TZ_MAP[tz]) return TZ_MAP[tz];
  } catch {
    /* ignore */
  }
  return null;
}

export async function detectCountry(): Promise<string> {
  const stored = getStoredCountry();
  if (stored) return stored;
  const guess = guessCountryFromBrowser();
  if (guess) {
    setStoredCountry(guess);
    return guess;
  }
  // Optional network fallback (free, no key). Best-effort.
  try {
    const res = await fetch("https://ipapi.co/country/", { cache: "force-cache" });
    if (res.ok) {
      const code = (await res.text()).trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) {
        setStoredCountry(code);
        return code;
      }
    }
  } catch {
    /* ignore */
  }
  return "US";
}

export function currencyForCountry(country: string): string {
  return COUNTRY_TO_CURRENCY[country.toUpperCase()] || "USD";
}

export function formatPrice(usd: number, currency: string, locale?: string): string {
  const rate = USD_RATES[currency] ?? 1;
  const local = usd * rate;
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: local >= 100 ? 0 : 2,
    }).format(local);
  } catch {
    return `${local.toFixed(2)} ${currency}`;
  }
}
