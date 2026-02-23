import { ChangeEvent } from 'react';

interface MarkdownEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  required?: boolean;
  rows?: number;
  disabled?: boolean;
}

export const MarkdownEditor = ({
  id,
  label,
  value,
  onChange,
  helperText,
  required = false,
  rows = 8,
  disabled = false,
}: MarkdownEditorProps): JSX.Element => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400" htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-neutral-500">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        required={required}
        rows={rows}
        disabled={disabled}
        className="w-full resize-y rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 shadow-inner focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
      />
      {helperText ? <p className="text-xs text-neutral-500">{helperText}</p> : null}
    </div>
  );
};
