import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

// Define structure for nested translations
interface Translations {
  [key: string]: string | Translations;
}

// Define context value structure
interface I18nContextProps {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  translations: Translations; // Expose translations if needed directly
}

// Create the context with default values
const I18nContext = createContext<I18nContextProps>({
  language: 'es', // Default language
  setLanguage: () => console.warn('setLanguage called before I18nProvider mounted'),
  t: (key) => key, // Default translation function just returns the key
  translations: {},
});

// Custom hook to use the context
export const useI18n = () => useContext(I18nContext);

// Define provider props
interface I18nProviderProps {
  children: ReactNode;
}

// LocalStorage key for settings
const SETTINGS_STORAGE_KEY = 'appSettings';

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [language, setLanguageState] = useState<string>('es'); // Default to Spanish
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to load translations for a given language
  const loadTranslations = useCallback(async (lang: string) => {
    setIsLoading(true);
    try {
      // Use dynamic import to fetch the JSON file
      const response = await fetch(`/locales/${lang}/translation.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}: ${response.statusText}`);
      }
      const json = await response.json();
      setTranslations(json);
      console.log(`Loaded translations for: ${lang}`);
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      // Fallback to default language (e.g., Spanish) or English if loading fails
      if (lang !== 'es') {
        await loadTranslations('es'); // Attempt fallback
      } else {
        setTranslations({}); // Set empty if default also fails
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to load initial language from localStorage and load translations
  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let initialLang = 'es'; // Default
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings.language && ['en', 'es'].includes(parsedSettings.language)) {
          initialLang = parsedSettings.language;
        }
      } catch (error) {
        console.error("Failed to parse language from localStorage:", error);
      }
    }
    setLanguageState(initialLang);
    loadTranslations(initialLang);
  }, [loadTranslations]); // Depend on loadTranslations

  // Function to change language and reload translations
  const setLanguage = useCallback((lang: string) => {
    if (['en', 'es'].includes(lang)) {
      setLanguageState(lang);
      loadTranslations(lang);
      // Optionally update localStorage here as well if language is changed outside settings page
      // const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      // const settings = storedSettings ? JSON.parse(storedSettings) : {};
      // settings.language = lang;
      // localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } else {
      console.warn(`Unsupported language selected: ${lang}`);
    }
  }, [loadTranslations]);

  // Translation function 't'
  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: string | Translations | undefined = translations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Key not found, return the key itself as fallback
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof result === 'string') {
      // Basic interpolation (replace {{variable}} with value)
      if (options) {
        Object.keys(options).forEach(optKey => {
          result = (result as string).replace(`{{${optKey}}}`, String(options[optKey]));
        });
      }
      return result;
    }

    // If the final result is not a string (e.g., nested object), return the key
    console.warn(`Translation key did not resolve to a string: ${key}`);
    return key;
  }, [translations]);

  // Show loading state or children
  if (isLoading) {
    // You might want a more sophisticated loading indicator
    return <div>Loading language...</div>;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </I18nContext.Provider>
  );
};
