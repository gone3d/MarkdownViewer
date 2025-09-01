// src/components/ui/UIToggle.tsx

import React from "react";
import { ToggleData, ToggleCallback } from "../../data/interfaces";

interface UIToggleProps {
  data: ToggleData;
  onChange: ToggleCallback;
  showLabel?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const UIToggle: React.FC<UIToggleProps> = ({
  data,
  onChange,
  showLabel = true,
  iconLeft,
  iconRight,
}) => {
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    onChange(data, newChecked, event);
  };

  const getSizeClasses = () => {
    switch (data.size) {
      case "small":
        return {
          track: "w-10 h-6",
          handle: "w-4 h-4 top-1",
          icon: "w-2.5 h-2.5",
          translate: data.checked ? "translate-x-4" : "translate-x-1",
        };
      case "large":
        return {
          track: "w-16 h-10",
          handle: "w-8 h-8 top-1",
          icon: "w-4 h-4",
          translate: data.checked ? "translate-x-7" : "translate-x-1",
        };
      default: // medium
        return {
          track: "w-14 h-8",
          handle: "w-6 h-6 top-1",
          icon: "w-3 h-3",
          translate: data.checked ? "translate-x-7" : "translate-x-1",
        };
    }
  };

  const getVariantClasses = () => {
    switch (data.variant) {
      case "success":
        return {
          track: data.checked
            ? "bg-gradient-to-r from-green-500 to-emerald-400"
            : "toggle-theme",
          handle: data.checked
            ? "bg-white shadow-lg shadow-green-500/50"
            : "toggle-theme-handle",
          glow: data.checked
            ? "bg-gradient-to-r from-green-400/20 to-emerald-400/20"
            : "",
        };
      case "custom":
        return {
          track: "toggle-theme",
          handle: "toggle-theme-handle",
          glow: data.checked
            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20"
            : "",
        };
      default: // primary
        return {
          track: "toggle-theme",
          handle: "toggle-theme-handle",
          glow: data.checked
            ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
            : "",
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const renderIcon = () => {
    if (iconLeft && !data.checked) return iconLeft;
    if (iconRight && data.checked) return iconRight;
    return null;
  };

  return (
    <div className={`flex items-center gap-3 ${data.className || ""}`}>
      {showLabel && data.label && (
        <span className="text-theme-secondary font-medium select-none">
          {data.label}
        </span>
      )}

      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          id={data.id}
          checked={data.checked}
          disabled={data.disabled}
          onChange={handleToggle}
          className="sr-only"
          aria-label={data.label || "Toggle"}
        />

        <label
          htmlFor={data.id}
          className={`
            relative ${sizeClasses.track} ${variantClasses.track} 
            rounded-full cursor-pointer transition-all duration-300 block
            ${data.disabled ? "opacity-50 cursor-not-allowed" : ""}
            focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-transparent
          `}
        >
          {/* Handle */}
          <div
            className={`
              absolute ${sizeClasses.handle} ${variantClasses.handle}
              rounded-full transition-all duration-300 transform ${
                sizeClasses.translate
              }
              flex items-center justify-center
              ${data.disabled ? "" : "hover:scale-105"}
            `}
          >
            {/* Icon inside handle */}
            {(iconLeft || iconRight) && (
              <div className={`${sizeClasses.icon} text-current`}>
                {renderIcon()}
              </div>
            )}
          </div>

          {/* Background track with subtle glow */}
          {variantClasses.glow && (
            <div className="absolute inset-0 rounded-full opacity-50">
              <div
                className={`w-full h-full rounded-full transition-all duration-300 ${variantClasses.glow}`}
              />
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default UIToggle;
