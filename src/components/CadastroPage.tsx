import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { loadData, type DataSet } from '../service/data';
import { assertCanDelete, assertUnique } from '../models/rules';
import { Button } from './Button';
import { Input } from './Input';
import { Select, type SelectOption } from './Select';
import { TextArea } from './TextArea';
import { Table, type Column } from './Table';
import { Modal } from './Modal';
import { Alert } from './Alert';
import { Card } from './Card';

interface Row { id?: string }
interface CrudService<T> {
  criar: (obj: T) => Promise<T>;
  atualizar: (id: string, obj: T) => Promise<T>;
  excluir: (id: string) => Promise<void>;
}

export interface Field<T> {
  key: keyof T & string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select';
  required?: boolean;
  options?: (data: DataSet) => SelectOption[];
  table?: boolean;
  format?: (value: T[keyof T], item: T, data: DataSet) => ReactNode;
}

export interface CadastroPageProps<T extends Row> {
  title: string;
  collection: keyof DataSet;
  initial: T;
  fields: Field<T>[];
  service: CrudService<T>;
  uniqueKeys?: (keyof T)[];
  validate?: (item: T, data: DataSet) => void;
  detailPath?: (item: T) => string;
  extraColumns?: (data: DataSet) => Column<T>[];
}

export function CadastroPage<T extends Row>({ title, collection, initial, fields,
  service, uniqueKeys = [], validate, detailPath, extraColumns }: CadastroPageProps<T>) {
  const navigate = useNavigate();
  const [data, setData] = useState<DataSet | null>(null);
  const [form, setForm] = useState<T>(initial);
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    setData(await loadData());
  }
  useEffect(() => { void refresh().catch((err: unknown) => setError(String(err))); }, []);

  function startCreate() {
    setForm({ ...initial }); setEditing(false); setShowForm(true); setError('');
  }
  function startEdit(item: T) {
    setForm({ ...item }); setEditing(true); setShowForm(true); setError('');
  }
  function update(key: keyof T & string, value: string, numeric: boolean) {
    setForm((current) => ({ ...current, [key]: numeric ? Number(value) : value }) as T);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setWorking(true); setError(''); setMessage('');
    try {
      const latest = await loadData();
      assertUnique(latest[collection] as unknown as T[], form, uniqueKeys, title);
      validate?.(form, latest);
      if (editing && form.id) await service.atualizar(form.id, form);
      else await service.criar(form);
      await refresh(); setShowForm(false); setMessage('Registro salvo com sucesso.');
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setWorking(false); }
  }

  async function remove() {
    if (!toDelete?.id) return;
    setWorking(true); setError(''); setMessage('');
    try {
      const latest = await loadData();
      assertCanDelete(collection, toDelete.id, latest);
      await service.excluir(toDelete.id);
      await refresh(); setMessage('Registro excluído.');
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setToDelete(null); setWorking(false); }
  }

  const rows = data ? data[collection] as unknown as T[] : [];
  const columns: Column<T>[] = fields.filter((field) => field.table !== false).map((field) => ({
    title: field.label,
    render: (item) => field.format ? field.format(item[field.key], item, data as DataSet)
      : String(item[field.key] ?? '—'),
  }));
  if (data && extraColumns) columns.push(...extraColumns(data));

  return <div className="container py-4 py-lg-5">
    <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4">
      <div><span className="eyebrow">CADASTRO</span><h1 className="h2 fw-bold mb-0">{title}</h1></div>
      <Button label="Novo cadastro" onClick={startCreate} />
    </div>
    {error && <Alert type="danger" message={error} />}
    {message && <Alert type="success" message={message} />}
    {showForm && data && <Card title={editing ? 'Editar cadastro' : 'Novo cadastro'} className="mb-4">
      <form onSubmit={(event) => { void save(event); }}>
        <div className="row">{fields.map((field) => <div className="col-md-6" key={field.key}>
          {field.type === 'select' ? <Select label={field.label} name={field.key}
            value={String(form[field.key] ?? '')} options={field.options?.(data) || []}
            required={field.required} onChange={(value) => update(field.key, value, false)} />
            : field.type === 'textarea' ? <TextArea label={field.label} name={field.key}
              value={String(form[field.key] ?? '')} required={field.required}
              onChange={(value) => update(field.key, value, false)} />
              : <Input label={field.label} name={field.key} type={field.type || 'text'}
                value={String(form[field.key] ?? '')} required={field.required} min={field.type === 'number' ? 0 : undefined}
                step={field.type === 'number' ? '0.01' : undefined}
                onChange={(value) => update(field.key, value, field.type === 'number')} />}
        </div>)}</div>
        <div className="d-flex gap-2"><Button type="submit" label={working ? 'Salvando...' : 'Salvar'} disabled={working} />
          <Button label="Cancelar" variant="secondary" onClick={() => setShowForm(false)} /></div>
      </form></Card>}
    <Card title={`${title} cadastrados`}><Table columns={columns} data={rows}
      onEdit={startEdit} onDelete={setToDelete}
      extraAction={detailPath ? { label: 'Detalhes', onClick: (item) => navigate(detailPath(item)) } : undefined} />
    </Card>
    <Modal show={toDelete !== null} title="Confirmar exclusão" onClose={() => setToDelete(null)}
      onConfirm={() => { void remove(); }} loading={working}
      message="Deseja excluir este cadastro? Registros com dependentes são preservados." />
  </div>;
}
