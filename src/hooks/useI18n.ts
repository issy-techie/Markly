import { createContext, useContext } from "react";
import type { Translations } from "../i18n";
import { getTranslations } from "../i18n";

/** React context to provide translations throughout the app */
export const I18nContext = createContext<Translations>(getTranslations("ja"));

/** Hook to access the current translations */
export const useI18n = (): Translations => useContext(I18nContext);
