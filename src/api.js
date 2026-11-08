import { useEffect, useState } from "react";
import { useI18n } from "./i18n";
export async function api(url, options = {}) {
  const form = options.body instanceof FormData;
  const response = await fetch("/api" + url, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(!form && options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: form
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(
      data.error || "تعذر الاتصال. يرجى المحاولة مجدداً.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
export function useData(url) {
  const { language } = useI18n();
  const [state, setState] = useState({ data: null, error: null }),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setState((previous) => ({ ...previous, error: null }));
    const localizedUrl =
      url + (url.includes("?") ? "&" : "?") + "locale=" + language;
    api(localizedUrl)
      .then((data) => active && setState({ data, error: null }))
      .catch((error) => active && setState({ data: null, error }));
    return () => {
      active = false;
    };
  }, [url, version, language]);
  return { ...state, reload: () => setVersion((v) => v + 1) };
}
