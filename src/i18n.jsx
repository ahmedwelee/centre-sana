import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import translations from "./locales/fr.json";
const LanguageContext = createContext(null);
export function translate(value, language = "ar") {
  if (language !== "fr" || typeof value !== "string") return value;
  const key = value.trim().replace(/\s+/g, " ");
  if (translations[key])
    return value.match(/^\s*/)[0] + translations[key] + value.match(/\s*$/)[0];
  const count = key.match(/^(\d+) خدمة$/);
  if (count) return `${count[1]} service${count[1] === "1" ? "" : "s"}`;
  return value;
}
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("sana-language") === "fr" ? "fr" : "ar";
    } catch {
      return "ar";
    }
  });
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("sana-language", language);
    } catch {}
  }, [language]);
  const context = useMemo(
    () => ({ language, setLanguage, t: (value) => translate(value, language) }),
    [language],
  );
  return (
    <LanguageContext.Provider value={context}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useI18n() {
  return useContext(LanguageContext);
}
export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={language === "fr" ? "Langue du site" : "لغة الموقع"}
    >
      <button
        type="button"
        lang="ar"
        aria-label="العربية"
        aria-pressed={language === "ar"}
        onClick={() => setLanguage("ar")}
      >
        عربي
      </button>
      <button
        type="button"
        lang="fr"
        aria-label="Français"
        aria-pressed={language === "fr"}
        onClick={() => setLanguage("fr")}
      >
        FR
      </button>
    </div>
  );
}
