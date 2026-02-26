import type { Language } from "../types";
import type { Translations } from "./types";
import ja from "./ja";
import en from "./en";

export type { Translations };

const translations: Record<Language, Translations> = { ja, en };

/** Get translation object for a given language */
export const getTranslations = (lang: Language): Translations => translations[lang];

/** Available language options for the UI */
export const LANGUAGE_OPTIONS: { value: Language; label: string; nativeLabel: string }[] = [
  { value: "ja", label: "Japanese", nativeLabel: "日本語" },
  { value: "en", label: "English", nativeLabel: "English" },
];
