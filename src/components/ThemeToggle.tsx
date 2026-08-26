import React, { useEffect, useState } from "react";
import type { ThemeName, ThemeOption } from "@/lib/types";
import { Palette, Check, Sun, Moon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    name: "Default Light",
    type: "light",
    badge: "Clean",
    previewColors: ["#ffffff", "#f1f5f9", "#3b82f6"],
  },
  {
    id: "dark",
    name: "Default Dark",
    type: "dark",
    badge: "Zinc",
    previewColors: ["#090d16", "#1e293b", "#60a5fa"],
  },
  {
    id: "theme-latte",
    name: "Catppuccin Latte",
    type: "light",
    badge: "Latte",
    previewColors: ["#eff1f5", "#ccd0da", "#1e66f5"],
  },
  {
    id: "theme-frappe",
    name: "Catppuccin Frappé",
    type: "dark",
    badge: "Frappé",
    previewColors: ["#303446", "#414559", "#8caaee"],
  },
  {
    id: "theme-macchiato",
    name: "Catppuccin Macchiato",
    type: "dark",
    badge: "Macchiato",
    previewColors: ["#24273a", "#363a4f", "#8aadf4"],
  },
  {
    id: "theme-mocha",
    name: "Catppuccin Mocha",
    type: "dark",
    badge: "Mocha",
    previewColors: ["#1e1e2e", "#313244", "#89b4fa"],
  },
];

export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Remove existing theme classes
  root.classList.remove(
    "dark",
    "theme-latte",
    "theme-frappe",
    "theme-macchiato",
    "theme-mocha"
  );

  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme.startsWith("theme-")) {
    root.classList.add(theme);
    // if it's a dark catppuccin theme, also add dark for standard components if needed
    if (theme !== "theme-latte") {
      root.classList.add("dark");
    }
  }

  localStorage.setItem("atlasindex-theme", theme);
  window.dispatchEvent(new CustomEvent("atlasindex-theme-change", { detail: theme }));
}

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("theme-mocha");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("atlasindex-theme") as ThemeName) || "theme-mocha";
    setCurrentTheme(saved);
  }, []);

  const handleChange = (newTheme: string) => {
    const val = newTheme as ThemeName;
    setCurrentTheme(val);
    applyTheme(val);
  };

  if (!mounted) {
    return (
      <div className="h-9 w-[180px] rounded-md border border-input bg-card/50 flex items-center px-3 gap-2 text-xs text-muted-foreground animate-pulse">
        <Palette className="size-4 opacity-60" />
        <span>Loading theme...</span>
      </div>
    );
  }

  const activeOption = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[5];

  return (
    <div className="flex items-center gap-2">
      <Select value={currentTheme} onValueChange={handleChange}>
        <SelectTrigger className="h-9 w-[190px] bg-card/80 backdrop-blur border-border/80 text-xs font-medium focus:ring-1 focus:ring-primary">
          <div className="flex items-center gap-2 truncate">
            <Palette className="size-3.5 text-primary shrink-0" />
            <div className="flex items-center gap-1.5 truncate">
              <span className="truncate">{activeOption.name}</span>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="w-[240px]">
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Standard Themes
            </SelectLabel>
            {THEME_OPTIONS.slice(0, 2).map((theme) => (
              <SelectItem key={theme.id} value={theme.id} className="text-xs cursor-pointer py-2">
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-2">
                    {theme.type === "light" ? (
                      <Sun className="size-3.5 text-amber-500" />
                    ) : (
                      <Moon className="size-3.5 text-blue-400" />
                    )}
                    <span>{theme.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {theme.previewColors.map((c, i) => (
                      <span
                        key={i}
                        className="size-2.5 rounded-full border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>

          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              Catppuccin Flavours
            </SelectLabel>
            {THEME_OPTIONS.slice(2).map((theme) => (
              <SelectItem key={theme.id} value={theme.id} className="text-xs cursor-pointer py-2">
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary text-[11px]">🐱</span>
                    <span>{theme.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {theme.previewColors.map((c, i) => (
                      <span
                        key={i}
                        className="size-2.5 rounded-full border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
