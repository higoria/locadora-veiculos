export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline-primary' | 'outline-secondary';
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({ label, variant = 'primary', type = 'button', disabled,
  onClick, className = '' }: ButtonProps) {
  return <button type={type} className={`btn btn-${variant} ${className}`.trim()}
    disabled={disabled} onClick={onClick}>{label}</button>;
}
