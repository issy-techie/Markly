import React from "react";

interface IconButtonProps {
  onClick: (e: React.MouseEvent) => void;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Generic icon button component for toolbars.
 * - Icon-only button with active/disabled states
 * - Active: blue-500, Normal: slate-400, Hover: blue-500
 */
const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  title,
  active = false,
  disabled = false,
  className = "",
  children,
}) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1.5 transition-colors ${
      active
        ? "text-blue-500"
        : "text-slate-400 hover:text-blue-500"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
  >
    {children}
  </button>
);

export default IconButton;
