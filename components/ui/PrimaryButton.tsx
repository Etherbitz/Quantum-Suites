import Link from "next/link";
import type { ReactNode } from "react";

export interface PrimaryButtonProps {
  children: ReactNode;
  href?: string;
  fullWidth?: boolean;
  inverted?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

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
