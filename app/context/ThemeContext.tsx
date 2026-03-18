"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { SessionProvider } from "next-auth/react";

type Mode = "light" | "dark";

interface ThemeContextType {
  mode: Mode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleMode: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

const getTheme = (mode: Mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#4f46e5",
        light: "#818cf8",
        dark: "#3730a3",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#0d9488",
        light: "#2dd4bf",
        dark: "#0f766e",
        contrastText: "#ffffff",
      },
      background: {
        default: mode === "light" ? "#f8fafc" : "#0f172a",
        paper: mode === "light" ? "#ffffff" : "#1e293b",
      },
      text: {
        primary: mode === "light" ? "#0f172a" : "#f1f5f9",
        secondary: mode === "light" ? "#64748b" : "#94a3b8",
      },
      divider: mode === "light" ? "#e2e8f0" : "#334155",
      success: { main: "#10b981", light: "#34d399", dark: "#059669" },
      warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
      error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
      info: { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', sans-serif",
      h3: { fontWeight: 800 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 10,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)"
                : "0 1px 3px rgba(0,0,0,0.4)",
            backgroundImage: "none",
            border:
              mode === "light" ? "1px solid #f1f5f9" : "1px solid #334155",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottomColor: mode === "light" ? "#f1f5f9" : "#334155",
          },
        },
      },
    },
  });

export function ThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("themeMode") as Mode;
    if (saved === "light" || saved === "dark") setMode(saved);
    setMounted(true);
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });
  };

  const theme = getTheme(mode);

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <SessionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </ThemeContext.Provider>
  );
}
