// src/components/ui/UITextField.tsx

import React, { useState, useRef, useEffect } from "react";
import { InputData, InputCallback } from "../../data/interfaces";

interface UITextFieldProps {
  data: InputData;
  onChange: InputCallback;
  showLabel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const UITextField: React.FC<UITextFieldProps> = ({
  data,
  onChange,
  showLabel = true,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  onKeyDown,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(data.value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal value when data.value changes
  useEffect(() => {
    setInternalValue(data.value || "");
  }, [data.value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    onChange(data, newValue, event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const getVariantClasses = () => {
    const baseClasses =
      "w-full px-4 py-3 rounded-full transition-all duration-300 focus:outline-none";

    switch (data.variant) {
      case "glass":
        return `${baseClasses} bg-transparent border-2 border-theme-primary text-theme-primary focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 placeholder-theme-tertiary`;

      case "outline":
        return `${baseClasses} bg-transparent border-2 border-theme-tertiary text-theme-primary focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/20 placeholder-theme-tertiary hover:border-theme-primary`;

      default: // primary
        return `${baseClasses} input-theme-primary placeholder-theme-tertiary focus:shadow-lg focus:shadow-blue-500/20`;
    }
  };

  const getIconClasses = () => {
    return "w-5 h-5 text-theme-tertiary transition-colors duration-300";
  };

  const getFocusedIconClasses = () => {
    switch (data.variant) {
      case "glass":
        return isFocused ? "text-cyan-400" : "text-theme-tertiary";
      case "outline":
        return isFocused ? "text-blue-400" : "text-theme-tertiary";
      default:
        return isFocused ? "text-blue-400" : "text-theme-tertiary";
    }
  };

  const getInputClasses = () => {
    let classes = getVariantClasses();

    // Adjust padding for icons
    if (leftIcon && rightIcon) {
      classes = classes.replace("px-4", "px-12");
    } else if (leftIcon) {
      classes = classes.replace("px-4", "pl-12 pr-4");
    } else if (rightIcon) {
      classes = classes.replace("px-4", "pl-4 pr-12");
    }

    // Add disabled styles
    if (data.disabled) {
      classes += " opacity-50 cursor-not-allowed";
    }

    return classes;
  };

  const renderRequiredIndicator = () => {
    if (data.required && showLabel) {
      return <span className="text-red-400 ml-1">*</span>;
    }
    return null;
  };

  return (
    <div className={`space-y-2 ${data.className || ""}`}>
      {/* Label */}
      {showLabel && data.label && (
        <label
          htmlFor={data.id}
          className="block text-theme-secondary font-semibold select-none cursor-pointer"
        >
          {data.label}
          {renderRequiredIndicator()}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${getIconClasses()} ${getFocusedIconClasses()}`}
          >
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={inputRef}
          id={data.id}
          type={data.type}
          value={internalValue}
          placeholder={data.placeholder}
          disabled={data.disabled}
          required={data.required}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          className={getInputClasses()}
          aria-label={data.label || data.placeholder}
          aria-required={data.required}
          aria-invalid={data.metadata?.hasError ? "true" : "false"}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${getIconClasses()} ${getFocusedIconClasses()}`}
          >
            {rightIcon}
          </div>
        )}

        {/* Focus Ring for Glass Variant */}
        {data.variant === "glass" && isFocused && (
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 pointer-events-none animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default UITextField;
