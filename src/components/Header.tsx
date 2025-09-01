// src/components/Header.tsx

import { useState, useEffect } from "react";
import packageJson from "../../package.json";
import UIToggle from "./ui/UIToggle";
import { ToggleData, ToggleCallback } from "../data/interfaces";
import { moon, sun } from "../data/icons";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      setIsDarkMode(prefersDark);
      document.documentElement.setAttribute(
        "data-theme",
        prefersDark ? "dark" : "light"
      );
    }
  }, []);

  // Toggle theme callback
  const handleThemeToggle: ToggleCallback = (toggleData, checked) => {
    const newTheme = checked ? "dark" : "light";
    setIsDarkMode(checked);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Theme toggle configuration
  const themeToggleData: ToggleData = {
    id: "theme-toggle",
    label: isDarkMode ? "Dark" : "Light",
    checked: isDarkMode,
    variant: "custom",
    size: "medium",
    metadata: {
      action: "toggle-theme",
      theme: isDarkMode ? "dark" : "light",
    },
  };

  return (
    <header className="p-4 h-[60px] flex items-center justify-between bg-theme-secondary border-b-2 border-theme-tertiary">
      <div className="flex items-center gap-4">
        <img
          src="/src/assets/g3dlogoBlack.svg"
          alt="Gone3D Logo"
          className="h-10 w-10 object-contain flex-shrink-0 theme-logo-filter"
        />
        <h1 className="text-xl font-bold font-orbitron text-theme-primary">
          Gone3D Media Manager
        </h1>
      </div>

      {/* Right side - Version and Theme Toggle */}
      <div className="flex items-center gap-6">
        {/* Version Display */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-theme-tertiary font-medium">v</span>
          <span className="text-sm text-theme-secondary font-semibold">
            {packageJson.version}
          </span>
        </div>

        {/* Theme Toggle using UIToggle */}
        <UIToggle
          data={themeToggleData}
          onChange={handleThemeToggle}
          showLabel={true}
          iconLeft={sun}
          iconRight={moon}
        />
      </div>
    </header>
  );
};

export default Header;
