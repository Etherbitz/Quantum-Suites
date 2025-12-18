import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Props for the SecondaryButton component.
 */
export interface SecondaryButtonProps {
  /** Button label or content */
  children: ReactNode;

  /**
   * Optional href.
   * If provided, the button renders as a Next.js Link.
   */
  href?: string;

  /** Optional click handler */
  onClick?: () => void;

  /** Disable interaction */
  disabled?: boolean;
}

/**
 * Secondary call-to-action button.
 *
 * Used for:
 * - Non-primary navigation
 * - Pricing, learn more, secondary flows
 *
 * Styled as a ghost button with green accent for clarity
 * on both light and dark backgrounds.
 */
export function SecondaryButton({
  children,
  href,
  onClick,
  disabled = false,
}: SecondaryButtonProps) {
  const className = `
    inline-flex
    items-center
    justify-center
    rounded-xl
    border
    border-emerald-500/40
    px-6
    py-3
    font-medium
    text-emerald-500
    transition
    hover:bg-emerald-500/10
    hover:text-emerald-400
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-emerald-500
    ${disabled ? "opacity-60 pointer-events-none" : ""}
  `;

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
