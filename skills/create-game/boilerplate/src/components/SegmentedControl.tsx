import "./SegmentedControl.css";

interface Option<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  small?: boolean;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  small,
  className,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`segmented-control${small ? " segmented-control-sm" : ""}${className ? ` ${className}` : ""}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`segmented-control-option${value === opt.value ? " segmented-control-option-active" : ""}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
