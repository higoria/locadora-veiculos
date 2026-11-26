export interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  min?: string | number;
  step?: string;
}

export function Input({ label, name, type = 'text', value, onChange, placeholder,
  error, required, min, step }: InputProps) {
  return <div className="mb-3"><label className="form-label fw-semibold" htmlFor={name}>{label}</label>
    <input id={name} name={name} type={type} value={value} placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)} required={required} min={min} step={step}
      className={`form-control ${error ? 'is-invalid' : ''}`} />
    {error && <div className="invalid-feedback">{error}</div>}</div>;
}
