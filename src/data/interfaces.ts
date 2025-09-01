// src/data/interfaces.ts

// Button Types and Variants
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "glass"
  | "outline"
  | "icon";
export type ButtonSize = "small" | "medium" | "large";

// Icon configuration
export interface IconConfig {
  type: "dot" | "custom"; // dot for simple colored circles, custom for SVG/other
  color?: string;
  size?: string;
  content?: React.ReactNode; // For custom icons like SVG
}

// Button data interface
export interface ButtonData {
  id: string;
  variant: ButtonVariant;
  size?: ButtonSize;
  label: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconConfig;
  className?: string; // Additional custom classes
  metadata?: Record<string, unknown>; // For passing additional data through callbacks
}

// Generic callback function type
export type ButtonCallback = (
  buttonData: ButtonData,
  event?: React.MouseEvent<HTMLButtonElement>
) => void;

// Input Types
export type InputVariant = "primary" | "glass" | "outline";
export type InputType = "text" | "password" | "email" | "search" | "number";

export interface InputData {
  id: string;
  variant: InputVariant;
  type: InputType;
  label?: string;
  placeholder: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: IconConfig;
  className?: string;
  metadata?: Record<string, unknown>;
}

export type InputCallback = (
  inputData: InputData,
  value: string,
  event?: React.ChangeEvent<HTMLInputElement>
) => void;

// Toggle/Switch Types
export interface ToggleData {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  variant?: "primary" | "success" | "custom";
  size?: "small" | "medium" | "large";
  className?: string;
  metadata?: Record<string, unknown>;
}

export type ToggleCallback = (
  toggleData: ToggleData,
  checked: boolean,
  event?: React.ChangeEvent<HTMLInputElement>
) => void;

// Card Types
export type CardVariant = "glass" | "solid" | "gradient";

export interface CardData {
  id: string;
  variant: CardVariant;
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  clickable?: boolean;
  className?: string;
  metadata?: Record<string, unknown>;
}

export type CardCallback = (
  cardData: CardData,
  event?: React.MouseEvent<HTMLDivElement>
) => void;

// Progress Bar Types
export interface ProgressData {
  id: string;
  label: string;
  value: number; // 0-100
  max?: number;
  variant?: "blue" | "green" | "red" | "yellow" | "custom";
  size?: "small" | "medium" | "large";
  animated?: boolean;
  showValue?: boolean;
  className?: string;
  metadata?: Record<string, unknown>;
}

// Theme Types
export type ThemeMode = "light" | "dark";

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor?: string;
  accentColor?: string;
  customVariables?: Record<string, string>;
}

// Generic UI Component Props
export interface BaseUIProps {
  id: string;
  className?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

// Status Types for System Monitoring
export interface SystemStatus {
  component: string;
  status: "online" | "offline" | "warning" | "error";
  value?: number;
  max?: number;
  unit?: string;
  lastUpdate?: Date;
}
