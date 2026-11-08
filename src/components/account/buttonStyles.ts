// Plain values, kept out of client component files: a server page that imports a value
// from a "use client" file gets a reference to it, not the value itself.

export const PRIMARY_BUTTON =
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md bg-maroon px-6 font-bold text-paper transition-colors hover:bg-maroon-bright disabled:cursor-not-allowed disabled:opacity-60";
export const OUTLINE_BUTTON =
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-maroon px-6 font-bold text-maroon transition-colors hover:bg-maroon hover:text-paper disabled:cursor-not-allowed disabled:opacity-60";
