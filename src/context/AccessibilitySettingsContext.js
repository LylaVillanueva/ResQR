import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../lib/translations';

const KEY = 'resqr.accessibilitySettings';

export const FONT_SCALES = [
  { key: 'small', label: 'Small', value: 0.88 },
  { key: 'default', label: 'Default', value: 1 },
  { key: 'large', label: 'Large', value: 1.18 },
  { key: 'xlarge', label: 'Extra Large', value: 1.38 },
];

export const FONT_FAMILIES = [
  { key: 'poppins', label: 'Poppins (default)' },
  { key: 'system', label: 'System Default' },
];

// English is fully supported; Filipino currently covers sign-in, settings,
// and navigation — the rest of the app still reads in English until more
// screens are translated. See src/lib/translations.js.
export const LANGUAGES = [
  { key: 'en', label: 'English' },
  { key: 'fil', label: 'Filipino' },
];

const DEFAULTS = { fontScaleKey: 'default', fontFamilyKey: 'poppins', languageKey: 'en' };

const AccessibilitySettingsContext = createContext({
  ...DEFAULTS,
  fontScale: 1,
  setFontScaleKey: () => {},
  setFontFamilyKey: () => {},
  setLanguageKey: () => {},
  ready: false,
  t: (key) => translate('en', key),
});

export function AccessibilitySettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
      })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const persist = useCallback((next) => {
    setSettings(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setFontScaleKey = useCallback((fontScaleKey) => persist({ ...settings, fontScaleKey }), [settings, persist]);
  const setFontFamilyKey = useCallback((fontFamilyKey) => persist({ ...settings, fontFamilyKey }), [settings, persist]);
  const setLanguageKey = useCallback((languageKey) => persist({ ...settings, languageKey }), [settings, persist]);

  const fontScale = FONT_SCALES.find((s) => s.key === settings.fontScaleKey)?.value ?? 1;
  const t = useCallback((key) => translate(settings.languageKey, key), [settings.languageKey]);

  const value = useMemo(() => ({
    ...settings,
    fontScale,
    setFontScaleKey,
    setFontFamilyKey,
    setLanguageKey,
    ready,
    t,
  }), [settings, fontScale, setFontScaleKey, setFontFamilyKey, setLanguageKey, ready, t]);

  return <AccessibilitySettingsContext.Provider value={value}>{children}</AccessibilitySettingsContext.Provider>;
}

export function useAccessibilitySettings() {
  return useContext(AccessibilitySettingsContext);
}
