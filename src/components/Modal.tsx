import { Button } from './Button';

export interface ModalProps {
  show: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  loading?: boolean;
}

export function Modal({ show, title, onClose, onConfirm, message, loading }: ModalProps) {
  if (!show) return null;
  return <div className="modal-backdrop-custom" role="presentation" onMouseDown={onClose}>
    <div className="modal-dialog modal-dialog-centered" role="dialog" aria-modal="true" aria-label={title}
      onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-content"><div className="modal-header">
        <h2 className="modal-title fs-5">{title}</h2></div>
        <div className="modal-body">{message || 'Deseja excluir este registro?'}</div>
        <div className="modal-footer"><Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label="Confirmar" variant="danger" disabled={loading} onClick={onConfirm} /></div>
      </div></div></div>;
}
