// src/data/icons.tsx

import {
  Bell,
  Volume2,
  User,
  Lock,
  Mail,
  Phone,
  Search,
  Moon,
  Sun,
  Loader2,
} from "lucide-react";

// Icon components using Lucide React
export const icons = {
  // Notification and system icons
  bell: <Bell className="w-full h-full text-white" />,
  sound: <Volume2 className="w-full h-full text-white" />,

  // User and security icons
  user: <User className="w-full h-full" />,
  lock: <Lock className="w-full h-full" />,

  // Communication icons
  email: <Mail className="w-full h-full" />,
  phone: <Phone className="w-full h-full" />,

  // Action icons
  search: <Search className="w-full h-full" />,
  loader: <Loader2 className="animate-spin w-full h-full" />,

  // Theme icons
  moon: <Moon className="w-full h-full text-white" />,
  sun: <Sun className="w-full h-full text-white" />,
} as const;

// Helper functions for getting icons by component ID
export const getToggleIcons = (toggleId: string) => {
  switch (toggleId) {
    case "toggle-notifications":
      return { iconRight: icons.bell };
    case "toggle-sound":
      return { iconRight: icons.sound };
    default:
      return {};
  }
};

export const getInputIcons = (inputId: string) => {
  switch (inputId) {
    case "input-username":
      return { leftIcon: icons.user };
    case "input-password":
      return { leftIcon: icons.lock };
    case "input-email":
      return { leftIcon: icons.email };
    case "input-search":
      return { rightIcon: icons.search };
    case "input-phone":
      return { leftIcon: icons.phone };
    default:
      return {};
  }
};

// Export individual icons for direct access
export const {
  bell,
  sound,
  user,
  lock,
  email,
  phone,
  search,
  loader,
  moon,
  sun,
} = icons;
