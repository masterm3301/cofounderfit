import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${className}`} />;
}
