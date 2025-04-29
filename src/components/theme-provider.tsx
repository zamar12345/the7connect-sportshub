
import { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export const ThemeProvider = ({ children, defaultTheme = "light", storageKey = "vite-ui-theme" }: ThemeProviderProps) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme} storageKey={storageKey}>
      {children}
    </NextThemesProvider>
  );
};
