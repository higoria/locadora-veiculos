export interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}

export function TextArea({ label, name, value, onChange, rows = 3, required }: TextAreaProps) {
  return <div className="mb-3"><label className="form-label fw-semibold" htmlFor={name}>{label}</label>
    <textarea id={name} name={name} className="form-control" rows={rows} required={required}
      value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}
