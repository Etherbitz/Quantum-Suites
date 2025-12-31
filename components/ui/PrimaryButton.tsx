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
    text-sm
    transition-all
    transform
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-offset-2
  `;

  const colorClasses = inverted
    ? "border border-blue-200 bg-white text-blue-600 shadow-md shadow-blue-500/20 hover:bg-blue-50 hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-white"
    : "border-0 bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(37,99,235,0.7)] hover:shadow-[0_20px_55px_rgba(37,99,235,0.85)] hover:brightness-110 hover:-translate-y-0.5 focus-visible:ring-blue-600";

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
