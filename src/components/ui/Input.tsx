import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className = "", ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${inputId}-error`;

  return (
    <label className="grid gap-2 text-body-sm font-semibold text-text-primary" htmlFor={inputId}>
      {label}
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className={`min-h-[46px] w-full border bg-bg-surface px-3 text-body text-text-primary placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
          error ? "border-status-error" : "border-border-strong"
        } ${className}`}
        id={inputId}
        {...props}
      />
      {error ? <span className="text-body-sm font-medium text-status-error" id={errorId}>{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, id, className = "", ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${textareaId}-error`;

  return (
    <label className="grid gap-2 text-body-sm font-semibold text-text-primary" htmlFor={textareaId}>
      {label}
      <textarea
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className={`min-h-24 w-full resize-none rounded-sm border bg-bg-surface p-3 text-body text-text-primary placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring md:resize-y ${
          error ? "border-status-error" : "border-border-subtle"
        } ${className}`}
        id={textareaId}
        {...props}
      />
      {error ? <span className="text-body-sm font-medium text-status-error" id={errorId}>{error}</span> : null}
    </label>
  );
}
