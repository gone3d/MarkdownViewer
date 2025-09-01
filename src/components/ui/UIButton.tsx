// src/components/ui/UIButton.tsx

import React from "react";
import { ButtonData, ButtonCallback, IconConfig } from "../../data/interfaces";
import { loader } from "../../data/icons";

interface UIButtonProps {
  data: ButtonData;
  onClick?: ButtonCallback;
  children?: React.ReactNode; // Override label if needed
}

const UIButton: React.FC<UIButtonProps> = ({ data, onClick, children }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!data.disabled && !data.loading && onClick) {
      onClick(data, event);
    }
  };

  // Base classes that apply to all buttons
  const baseClasses =
    "group relative overflow-hidden font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed";

  // Size classes
  const sizeClasses = {
    small: "py-2 px-4 text-sm",
    medium: "py-4 px-8 text-base",
    large: "py-6 px-12 text-lg",
  };

  // Variant-specific classes
  const variantClasses = {
    primary: "btn-theme-primary active:scale-95",
    secondary: "btn-theme-secondary active:scale-95",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400 hover:shadow-lg hover:shadow-red-500/50 active:scale-95",
    glass: "btn-theme-glass active:scale-95",
    outline:
      "bg-transparent border-2 border-theme-primary text-theme-secondary hover:border-theme-secondary hover:text-theme-primary hover:shadow-lg hover:shadow-white/20 active:scale-95",
    icon: "bg-theme-tertiary text-theme-primary hover:bg-theme-secondary hover:shadow-lg active:scale-95",
  };

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[data.size || "medium"],
    variantClasses[data.variant],
    data.className || "",
    data.icon && data.variant === "icon" ? "flex items-center gap-3" : "",
  ].join(" ");

  // Render icon if present
  const renderIcon = (icon: IconConfig) => {
    if (icon.type === "dot") {
      return (
        <span
          className={`rounded-full flex-shrink-0 ${icon.size || "w-5 h-5"}`}
          style={{ backgroundColor: icon.color || "#3b82f6" }}
        />
      );
    } else if (icon.type === "custom" && icon.content) {
      return (
        <span className={`flex-shrink-0 ${icon.size || "w-5 h-5"}`}>
          {icon.content}
        </span>
      );
    }
    return null;
  };

  // Loading component using Lucide icon
  const LoadingIcon = () => (
    <span className="w-5 h-5 text-current">{loader}</span>
  );

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      disabled={data.disabled || data.loading}
      aria-label={data.label}
    >
      {/* Hover overlay effects */}
      {(data.variant === "primary" || data.variant === "danger") && (
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      )}

      {data.variant === "secondary" && (
        <div className="absolute inset-0 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      )}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {data.loading && <LoadingIcon />}
        {data.icon && !data.loading && renderIcon(data.icon)}
        {children || data.label}
      </span>
    </button>
  );
};

export default UIButton;
