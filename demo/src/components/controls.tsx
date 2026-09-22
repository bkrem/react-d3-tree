import { useId, useState, type ReactNode } from 'react';

interface GroupProps {
  title: string;
  modified: boolean;
  onReset: () => void;
  children: ReactNode;
}

/** An inspector section. The reset button appears only when a prop in the group is modified. */
export function Group({ title, modified, onReset, children }: GroupProps) {
  const headingId = useId();
  return (
    <section className="group" aria-labelledby={headingId}>
      <header className="group__head">
        <h2 id={headingId}>{title}</h2>
        {modified && (
          <button type="button" className="group__reset" onClick={onReset}>
            Reset
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

interface RowProps {
  /** Shown in code font when it names a prop. */
  label: string;
  code?: boolean;
  htmlFor?: string;
  modified?: boolean;
  /** Puts the control under the label instead of beside it. */
  stack?: boolean;
  children: ReactNode;
}

export function Row({
  label,
  code = true,
  htmlFor,
  modified = false,
  stack = false,
  children,
}: RowProps) {
  const text = code ? <code>{label}</code> : label;
  const mark = modified && <span className="row__mod" title="Differs from the default" />;
  return (
    <div className={stack ? 'row row--stack' : 'row'}>
      {htmlFor ? (
        <label className="row__label" htmlFor={htmlFor}>
          {text}
          {mark}
        </label>
      ) : (
        <span className="row__label">
          {text}
          {mark}
        </span>
      )}
      {children}
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="hint">{children}</p>;
}

interface SegmentedProps<T extends string> {
  name: string;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** A radio group drawn as connected segments. */
export function Segmented<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset className="seg">
      <legend className="sr-only">{label}</legend>
      {options.map(option => (
        <label
          key={option.value}
          className={option.value === value ? 'seg__opt seg__opt--on' : 'seg__opt'}
        >
          <input
            type="radio"
            className="sr-only"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ id, checked, onChange }: ToggleProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      aria-checked={checked}
      className="tog"
      id={id}
      checked={checked}
      onChange={evt => onChange(evt.target.checked)}
    />
  );
}

interface NumberFieldProps {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  /** What an empty field means, shown as the placeholder. Empty is only allowed when set. */
  emptyMeans?: string;
  modified?: boolean;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  ariaLabel?: string;
}

/** A numeric input that reports finite numbers, and `null` for an empty field when that's allowed. */
export function NumberField({
  id,
  value,
  onChange,
  emptyMeans,
  modified = false,
  step,
  min,
  max,
  unit,
  ariaLabel,
}: NumberFieldProps) {
  // The field keeps its own text while typing, and follows `value` when that changes elsewhere
  // (a group reset, a URL load). Tracking the last seen value avoids a setState in an effect.
  const [text, setText] = useState(value === null ? '' : String(value));
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setText(value === null ? '' : String(value));
  }

  const commit = (next: string) => {
    setText(next);
    if (next.trim() === '') {
      if (emptyMeans !== undefined) onChange(null);
      return;
    }
    const n = Number(next);
    if (Number.isFinite(n)) onChange(n);
  };

  return (
    <span className="num">
      <input
        type="number"
        id={id}
        className={modified ? 'num__input' : 'num__input num__input--default'}
        value={text}
        placeholder={emptyMeans}
        step={step}
        min={min}
        max={max}
        aria-label={ariaLabel}
        onChange={evt => commit(evt.target.value)}
        onBlur={() => setText(value === null ? '' : String(value))}
      />
      {unit && <span className="num__unit">{unit}</span>}
    </span>
  );
}

interface SelectProps<T extends string> {
  id: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function Select<T extends string>({ id, value, options, onChange }: SelectProps<T>) {
  return (
    <select id={id} className="sel" value={value} onChange={evt => onChange(evt.target.value as T)}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
