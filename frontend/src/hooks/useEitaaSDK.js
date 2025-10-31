import { useEffect, useMemo, useState } from 'react';

const DEFAULT_LIGHT = {
  surface: '#f8fafc',
  primary: '#3b82f6',
  accent: '#0ea5e9'
};

const DEFAULT_DARK = {
  surface: '#111827',
  primary: '#60a5fa',
  accent: '#22d3ee'
};

function hexToRgbTuple(hex) {
  if (!hex) return null;
  const normalised = hex.replace('#', '');
  if (normalised.length !== 6) return null;
  const bigint = parseInt(normalised, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

function applyThemeVariables(colorScheme, themeParams = {}) {
  const palette = colorScheme === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT;
  const root = document.documentElement;
  const resolved = {
    surface: hexToRgbTuple(themeParams.bg_color) ?? hexToRgbTuple(themeParams.secondary_bg_color) ?? palette.surface,
    primary: hexToRgbTuple(themeParams.button_color) ?? palette.primary,
    accent: hexToRgbTuple(themeParams.link_color) ?? palette.accent
  };

  Object.entries(resolved).forEach(([key, value]) => {
    const formatted = typeof value === 'string' && value.includes(' ') ? value : hexToRgbTuple(value);
    root.style.setProperty(`--app-${key}`, formatted ?? palette[key]);
  });

  root.classList.toggle('dark', colorScheme === 'dark');
}

export default function useEitaaSDK({ onThemeChange, onViewportChange } = {}) {
  const [colorScheme, setColorScheme] = useState('light');
  const [themeParams, setThemeParams] = useState({});
  const [viewport, setViewport] = useState(null);

  useEffect(() => {
    const sdk = window.Eitaa?.WebApp;
    console.info('Eitaa WebApp SDK detected:', Boolean(sdk));
    if (!sdk) {
      document.documentElement.classList.remove('dark');
      applyThemeVariables('light');
      return;
    }

    const handleTheme = () => {
      const scheme = sdk.colorScheme || 'light';
      const params = sdk.themeParams || {};
      setColorScheme(scheme);
      setThemeParams(params);
      applyThemeVariables(scheme, params);
      onThemeChange?.(scheme, params);
    };

    const handleViewport = () => {
      const state = sdk.viewportState ?? {};
      setViewport(state);
      onViewportChange?.(state);
    };

    sdk.ready();
    sdk.expand();
    handleTheme();
    handleViewport();

    sdk.onEvent('themeChanged', handleTheme);
    sdk.onEvent('viewportChanged', handleViewport);

    return () => {
      sdk.offEvent?.('themeChanged', handleTheme);
      sdk.offEvent?.('viewportChanged', handleViewport);
    };
  }, [onThemeChange, onViewportChange]);

  return useMemo(
    () => ({
      colorScheme,
      themeParams,
      viewport,
      sdk: window.Eitaa?.WebApp ?? null
    }),
    [colorScheme, themeParams, viewport]
  );
}
