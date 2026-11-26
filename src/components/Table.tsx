import type { ReactNode } from 'react';
import { Button } from './Button';

export interface Column<T> { title: string; render: (item: T) => ReactNode }
export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  canDelete?: (item: T) => boolean;
  deleteLabel?: string;
  extraAction?: { label: string; onClick: (item: T) => void };
  emptyMessage?: string;
}

export function Table<T>({ columns, data, onEdit, onDelete, canDelete, deleteLabel = 'Excluir', extraAction,
  emptyMessage = 'Nenhum registro encontrado.' }: TableProps<T>) {
  return <div className="table-responsive"><table className="table table-hover align-middle mb-0">
    <thead className="table-light"><tr>{columns.map((col) => <th scope="col" key={col.title}>{col.title}</th>)}
      {(onEdit || onDelete || extraAction) && <th scope="col">Ações</th>}</tr></thead>
    <tbody>{data.length ? data.map((row, index) => <tr key={(row as { id?: string }).id || index}>
      {columns.map((col) => <td key={col.title}>{col.render(row)}</td>)}
      {(onEdit || onDelete || extraAction) && <td><div className="d-flex flex-wrap gap-2">
        {extraAction && <Button label={extraAction.label} variant="outline-primary" onClick={() => extraAction.onClick(row)} />}
        {onEdit && <Button label="Editar" variant="outline-secondary" onClick={() => onEdit(row)} />}
        {onDelete && (!canDelete || canDelete(row)) && <Button label={deleteLabel} variant="danger" onClick={() => onDelete(row)} />}
      </div></td>}</tr>) : <tr><td colSpan={columns.length + (onEdit || onDelete || extraAction ? 1 : 0)}
      className="text-muted text-center py-4">{emptyMessage}</td></tr>}</tbody>
  </table></div>;
}
