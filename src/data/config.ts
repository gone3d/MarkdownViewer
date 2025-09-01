// src/data/config.ts

import React from "react";
import {
  ButtonData,
  ButtonCallback,
  ToggleData,
  ToggleCallback,
  InputData,
  InputCallback,
} from "./interfaces";

// Generic callback function for demonstration
export const handleButtonClick: ButtonCallback = (buttonData, event) => {
  console.log("Button clicked:", {
    id: buttonData.id,
    variant: buttonData.variant,
    label: buttonData.label,
    metadata: buttonData.metadata,
    event: event?.type,
  });

  // You can add specific logic based on button type or metadata
  if (buttonData.metadata?.action) {
    console.log("Executing action:", buttonData.metadata.action);
  }
};

// Generic callback function for toggles
export const handleToggleChange: ToggleCallback = (
  toggleData,
  checked,
  event
) => {
  console.log("Toggle changed:", {
    id: toggleData.id,
    label: toggleData.label,
    checked: checked,
    metadata: toggleData.metadata,
    event: event?.type,
  });

  // You can add specific logic based on toggle type or metadata
  if (toggleData.metadata?.action) {
    console.log("Executing toggle action:", toggleData.metadata.action);
  }
};

// Generic callback function for text fields
export const handleInputChange: InputCallback = (inputData, value, event) => {
  console.log("Input changed:", {
    id: inputData.id,
    variant: inputData.variant,
    type: inputData.type,
    value: value,
    metadata: inputData.metadata,
    event: event?.type,
  });

  // You can add specific logic based on input type or metadata
  if (inputData.metadata?.validation) {
    console.log("Running validation for:", inputData.id);
  }
};

// Example button configurations
export const buttonExamples: ButtonData[] = [
  {
    id: "btn-primary",
    variant: "primary",
    label: "Primary Action",
    metadata: {
      action: "save",
      category: "form",
      priority: "high",
    },
  },
  {
    id: "btn-secondary",
    variant: "secondary",
    label: "Secondary",
    metadata: {
      action: "cancel",
      category: "form",
      priority: "medium",
    },
  },
  {
    id: "btn-danger",
    variant: "danger",
    label: "Danger",
    metadata: {
      action: "delete",
      category: "destructive",
      priority: "high",
      confirmRequired: true,
    },
  },
  {
    id: "btn-glass",
    variant: "glass",
    label: "Glass Effect",
    metadata: {
      action: "info",
      category: "display",
      priority: "low",
    },
  },
  {
    id: "btn-outline",
    variant: "outline",
    label: "Outline",
    metadata: {
      action: "view",
      category: "navigation",
      priority: "medium",
    },
  },
  {
    id: "btn-icon",
    variant: "icon",
    label: "With Icon",
    icon: {
      type: "dot",
      color: "#3b82f6",
      size: "w-5 h-5",
    },
    metadata: {
      action: "status",
      category: "indicator",
      priority: "low",
    },
  },
];

// Additional button examples with different sizes and states
export const additionalButtonExamples: ButtonData[] = [
  {
    id: "btn-small",
    variant: "primary",
    size: "small",
    label: "Small Button",
    metadata: { size: "small" },
  },
  {
    id: "btn-large",
    variant: "secondary",
    size: "large",
    label: "Large Button",
    metadata: { size: "large" },
  },
  {
    id: "btn-disabled",
    variant: "primary",
    label: "Disabled",
    disabled: true,
    metadata: { state: "disabled" },
  },
  {
    id: "btn-loading",
    variant: "glass",
    label: "Loading...",
    loading: true,
    metadata: { state: "loading" },
  },
  {
    id: "btn-custom-icon",
    variant: "icon",
    label: "Custom Icon",
    icon: {
      type: "custom",
      size: "w-5 h-5",
      content: React.createElement(
        "svg",
        {
          fill: "currentColor",
          viewBox: "0 0 20 20",
          className: "w-full h-full",
        },
        React.createElement("path", {
          fillRule: "evenodd",
          d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
          clipRule: "evenodd",
        })
      ),
    },
    metadata: {
      action: "confirm",
      iconType: "checkmark",
    },
  },
];

// Toggle examples with different variants and sizes
export const toggleExamples: ToggleData[] = [
  {
    id: "toggle-dark-mode",
    label: "Dark Mode",
    checked: true,
    variant: "primary",
    size: "medium",
    metadata: {
      action: "toggle-theme",
      setting: "dark-mode",
    },
  },
  {
    id: "toggle-notifications",
    label: "Notifications",
    checked: true,
    variant: "success",
    size: "medium",
    metadata: {
      action: "toggle-notifications",
      setting: "notifications",
    },
  },
  {
    id: "toggle-auto-save",
    label: "Auto Save",
    checked: false,
    variant: "primary",
    size: "small",
    metadata: {
      action: "toggle-auto-save",
      setting: "auto-save",
    },
  },
  {
    id: "toggle-sound",
    label: "Sound Effects",
    checked: true,
    variant: "custom",
    size: "large",
    metadata: {
      action: "toggle-sound",
      setting: "sound-effects",
    },
  },
  {
    id: "toggle-disabled",
    label: "Disabled Toggle",
    checked: false,
    disabled: true,
    variant: "primary",
    size: "medium",
    metadata: {
      action: "toggle-disabled",
      setting: "disabled-feature",
    },
  },
];

// Text field examples with different variants and features
export const textFieldExamples: InputData[] = [
  {
    id: "input-username",
    variant: "primary",
    type: "text",
    label: "Username",
    placeholder: "Enter username...",
    required: true,
    metadata: {
      validation: "required",
      category: "authentication",
    },
  },
  {
    id: "input-password",
    variant: "glass",
    type: "password",
    label: "Password",
    placeholder: "Enter password...",
    required: true,
    metadata: {
      validation: "password",
      category: "authentication",
      helperText: "Password must be at least 8 characters",
    },
  },
  {
    id: "input-email",
    variant: "outline",
    type: "email",
    label: "Email Address",
    placeholder: "Enter email...",
    required: true,
    metadata: {
      validation: "email",
      category: "contact",
    },
  },
  {
    id: "input-search",
    variant: "primary",
    type: "search",
    label: "Search",
    placeholder: "Search files...",
    metadata: {
      action: "search",
      category: "navigation",
    },
  },
  {
    id: "input-phone",
    variant: "outline",
    type: "text",
    label: "Phone Number",
    placeholder: "+1 (555) 000-0000",
    metadata: {
      validation: "phone",
      category: "contact",
      helperText: "Include country code",
    },
  },
  {
    id: "input-disabled",
    variant: "primary",
    type: "text",
    label: "Disabled Field",
    placeholder: "This field is disabled",
    disabled: true,
    value: "Read-only value",
    metadata: {
      state: "disabled",
      category: "example",
    },
  },
];
