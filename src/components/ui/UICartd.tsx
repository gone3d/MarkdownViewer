// src/components/ui/UICard.tsx

// Not really working at the moment, we'll need to make specific cards instead.

import React from "react";
import { CardData, CardCallback } from "../../data/interfaces";

interface UICardProps {
  data: CardData;
  onClick?: CardCallback;
  children?: React.ReactNode; // Override content if needed
  glowOnHover?: boolean; // Option to enable glow effect
}

const UICard: React.FC<UICardProps> = ({
  data,
  onClick,
  children,
  glowOnHover = false,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (data.clickable && onClick) {
      onClick(data, event);
    }
  };

  // Base classes that apply to all cards
  const baseClasses = "relative rounded-2xl p-6 transition-all duration-300";

  // Variant-specific classes
  const variantClasses = {
    glass: "card-theme-glass",
    solid: "bg-theme-secondary border border-theme-tertiary",
    gradient:
      "bg-gradient-to-br from-theme-secondary to-theme-tertiary border border-theme-tertiary",
  };

  // Clickable classes
  const clickableClasses = data.clickable
    ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    : "";

  // Glow effect classes
  const glowClasses = glowOnHover ? "group" : "";

  // Combine all classes
  const cardClasses = [
    baseClasses,
    variantClasses[data.variant],
    clickableClasses,
    glowClasses,
    data.className || "",
  ].join(" ");

  return (
    <div
      className={cardClasses}
      onClick={data.clickable ? handleClick : undefined}
    >
      {/* Glow effect overlay */}
      {glowOnHover && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}

      {/* Card content */}
      <div className="relative z-10">
        {/* Header section */}
        {(data.title || data.subtitle) && (
          <div className="mb-4">
            {data.title && (
              <h3 className="text-xl font-bold text-theme-primary mb-2">
                {data.title}
              </h3>
            )}
            {data.subtitle && (
              <p className="text-sm text-theme-tertiary">{data.subtitle}</p>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1">{children || data.content}</div>

        {/* Footer section */}
        {data.footer && (
          <div className="mt-4 pt-4 border-t border-theme-tertiary">
            {data.footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default UICard;
