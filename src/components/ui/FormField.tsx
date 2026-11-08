import type { ReactNode } from "react";
import { cn } from "@/shared/cn";

export type ControlProps = {
  id: string;
  name: string;
  required?: boolean;
  autoComplete?: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  defaultValue?: string;
  className: string;
};

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  textarea?: boolean;
  error?: string;
  /** Keeps what the visitor typed when the server sends the form back with errors. */
  defaultValue?: string;
  describedBy?: string;
  children?: (props: ControlProps) => ReactNode;
};

export function FormField({
  id,
  label,
  type = "text",
  autoComplete,
  required,
  textarea,
  error,
  defaultValue,
  describedBy,
  children,
}: FieldProps) {
  const errorId = `${id}-error`;
  // text-base (16px) stops iOS Safari zooming in when a field is focused.
  // The scroll margin keeps a focused field clear of the fixed nav.
  const props: ControlProps = {
    id,
    name: id,
    required,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [error ? errorId : undefined, describedBy].filter(Boolean).join(" ") || undefined,
    defaultValue,
    className: cn(
      "min-h-11.5 w-full scroll-mt-28 rounded-md border bg-white px-3 py-2.5 font-body text-base text-on-light",
      error ? "border-2 border-maroon" : "border-on-light-dim/70"
    ),
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.94rem] font-semibold">
        {label}
      </label>
      {children ? (
        children(props)
      ) : textarea ? (
        <textarea {...props} rows={5} className={cn(props.className, "resize-y")} />
      ) : (
        <input {...props} type={type} />
      )}
      {error && (
        <span id={errorId} className="text-[0.88rem] font-semibold text-maroon">
          {error}
        </span>
      )}
    </div>
  );
}
