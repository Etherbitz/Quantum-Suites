import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Props for the PrimaryButton component.
 */
export interface PrimaryButtonProps {
  /** Button label or content */
  children: ReactNode;

  /**
   * Optional href.
   * If provided, the button renders as a Next.js Link.
   */
  href?: string;

  /** Makes the button span full width */
  fullWidth?: boolean;

  /** Inverts colors for dark backgrounds */
  inverted?: boolean;

  /** Optional click handler */
  onClick?: () => void;

  /** Disable interaction */
  disabled?: boolean;
}

/**
 * Primary call-to-action button.
 *
 * Usage:
 * - Primary conversion actions
 * - Main user intent flows
 *
 * Automatically renders as a <Link> when `href` is provided,
 * otherwise renders a <button>.
 */
export function PrimaryButton({
  children,
  href,
  fullWidth = false,
  inverted = false,
  onClick,
  disabled = false,
}: PrimaryButtonProps) {
  const baseClasses = `
    inline-flex
    items-center
    justify-center
    rounded-xl
    px-6
    py-3
    font-semibold
    border
    text-sm
    transition
    shadow-sm
    shadow-blue-500/40
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-offset-2
  `;

  const colorClasses = inverted
    ? "border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-400 focus-visible:ring-white"
    : "border-blue-500 bg-blue-600 text-white hover:bg-blue-500 hover:border-blue-400 focus-visible:ring-blue-600";

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClasses = disabled
    ? "opacity-60 pointer-events-none"
    : "";

  const className = `${baseClasses} ${colorClasses} ${widthClass} ${disabledClasses}`;

  // Render as link if href is provided
  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
