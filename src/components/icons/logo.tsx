import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
    style={{ transform: "rotate(-2deg)" }}
  >
    <path d="M3.5 9.5l7-7 8 8" />
    <path d="M3.5 9.5v10h16v-12" />
    <path d="M11.5 14.5a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2" />
    <path d="M15.5 16.5a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2" />
    <path d="M13.5 12.5a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2" />
    <path d="M9.5 16.5A2.5 2.5 0 0012 19a2.5 2.5 0 002.5-2.5" />
    <path d="M14.5 16.5a2.5 2.5 0 01-2.5 2.5 2.5 2.5 0 01-2.5-2.5" />
  </svg>
);
