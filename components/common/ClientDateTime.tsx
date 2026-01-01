"use client";

import { useMemo } from "react";

export function ClientDateTime({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const { formatted, title } = useMemo(() => {
    const date = new Date(value);
    const valid = !Number.isNaN(date.getTime());

    if (!valid) {
      return {
        formatted: "—",
        title: "",
      };
    }

    const formatted = new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);

    return {
      formatted,
      title: date.toISOString(),
    };
  }, [value]);

  return (
    <time dateTime={value} title={title} className={className}>
      {formatted}
    </time>
  );
}
