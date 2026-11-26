export interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  return <div role="alert" className={`alert alert-${type} py-2`}>{message}</div>;
}
