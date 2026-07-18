"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

interface NavLinksProps {
  links: NavLink[];
  /** Rendered after the links (e.g. the sign-out button form). */
  children?: ReactNode;
}

export function NavLinks({ links, children }: NavLinksProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex items-center gap-1">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive(link.href)
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </a>
        ))}
        <div className="ml-3">{children}</div>
      </nav>

      {/* Mobile */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
          {open ? (
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="md:hidden absolute inset-x-0 top-full border-b border-gray-200 bg-white shadow-sm">
          <nav className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 border-t border-gray-100 pt-3 pb-1">{children}</div>
          </nav>
        </div>
      )}
    </>
  );
}
