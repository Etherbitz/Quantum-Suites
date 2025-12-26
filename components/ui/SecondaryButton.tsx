import Link from "next/link";
import type { ReactNode } from "react";

export interface SecondaryButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

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
    border-emerald-500/60
    px-6
    py-3
    font-medium
    text-sm
    text-emerald-400
    transition
    shadow-sm
    shadow-emerald-500/30
    hover:bg-emerald-500/10
    hover:text-emerald-300
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
