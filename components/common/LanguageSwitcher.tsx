"use client";

import { useMemo, useSyncExternalStore } from "react";

type LanguageOption = {
  code: string;
  label: string;
};

const TOP_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "zh-CN", label: "中文 (简体)" },
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((p) => p.trim());
  const prefix = `${name}=`;
  const match = parts.find((p) => p.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function setGoogTransCookie(value: string) {
  if (typeof document === "undefined") return;

  const base = `googtrans=${encodeURIComponent(value)};path=/`;
  document.cookie = base;

  // Also try setting the cookie on the apex domain so it persists
  // across www/subdomains in production.
  const host = window.location.hostname;
  const isLocalhost = host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host);
  if (isLocalhost) return;

  const segments = host.split(".");
  if (segments.length < 2) return;

  const apexDomain = segments.slice(-2).join(".");
  document.cookie = `${base};domain=.${apexDomain}`;
}

function getSelectedLanguageFromCookie(): string {
  const raw = getCookie("googtrans");
  if (!raw) return "en";

  // Expected formats: /en/es or /auto/es
  const parts = raw.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) return "en";

  // Normalize zh-cn casing
  if (last.toLowerCase() === "zh-cn") return "zh-CN";
  return last;
}

export function LanguageSwitcher() {
  const optionsByCode = useMemo(() => {
    const map = new Map<string, LanguageOption>();
    for (const opt of TOP_LANGUAGES) map.set(opt.code, opt);
    return map;
  }, []);

  const value = useSyncExternalStore(
    (onStoreChange) => {
      // We don't have a real cookie change event. This keeps things
      // reasonably in sync when the tab regains focus.
      window.addEventListener("focus", onStoreChange);
      document.addEventListener("visibilitychange", onStoreChange);
      return () => {
        window.removeEventListener("focus", onStoreChange);
        document.removeEventListener("visibilitychange", onStoreChange);
      };
    },
    () => getSelectedLanguageFromCookie(),
    () => "en"
  );

  function onChange(next: string) {
    // Our site default language is English.
    // Google Translate reads this cookie to decide the target language.
    setGoogTransCookie(`/en/${next}`);

    // Reload so the translate element picks up the new cookie value.
    window.location.reload();
  }

  return (
    <div className="notranslate flex items-center" translate="no">
      <label className="sr-only" htmlFor="language-switcher">
        Language
      </label>
      <select
        id="language-switcher"
        value={optionsByCode.has(value) ? value : "en"}
        onChange={(e) => onChange(e.target.value)}
        translate="no"
        className="h-9 max-w-40 rounded-full border border-neutral-800 bg-neutral-950/60 px-3 text-xs font-medium text-neutral-200 hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
      >
        {TOP_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} translate="no">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
