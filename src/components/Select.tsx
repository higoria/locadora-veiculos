export interface SelectOption { value: string; label: string }
export interface SelectProps {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export function Select({ label, name, value, options, onChange, required, error }: SelectProps) {
  return <div className="mb-3"><label className="form-label fw-semibold" htmlFor={name}>{label}</label>
    <select id={name} name={name} value={value} required={required}
      onChange={(event) => onChange(event.target.value)} className={`form-select ${error ? 'is-invalid' : ''}`}>
      <option value="">Selecione...</option>
      {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
    </select>{error && <div className="invalid-feedback">{error}</div>}</div>;
}
