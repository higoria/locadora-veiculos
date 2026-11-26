import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadData, type DataSet } from '../../service/data';
import { locacaoService } from '../../service/locacaoService';
import { currency, dateLabel, vehicleLabel } from '../../models/rules';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import type { Locacao } from '../../models/Locacao';

export function LocacaoList() {
  const navigate = useNavigate();
  const [db, setDb] = useState<DataSet | null>(null);
  const [status, setStatus] = useState('');
  const [cliente, setCliente] = useState('');
  const [cancel, setCancel] = useState<Locacao | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function refresh() { setDb(await loadData()); }
  useEffect(() => { void refresh().catch((err: unknown) => setError(String(err))); }, []);
  async function cancelRental() {
    if (!cancel?.id) return;
    try {
      const current = await locacaoService.buscarPorId(cancel.id);
      if (current.status !== 'ABERTA') throw new Error('Somente locações abertas podem ser canceladas.');
      await locacaoService.atualizar(cancel.id, { ...current, status: 'CANCELADA' });
      await refresh(); setSuccess('Locação cancelada.'); setError('');
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setCancel(null); }
  }
  const rows = db?.locacoes.filter((r) => (!status || r.status === status) && (!cliente || r.clienteId === cliente)) || [];
  return <div className="container py-4 py-lg-5"><div className="d-flex justify-content-between flex-wrap gap-2 mb-4">
    <div><span className="eyebrow">OPERAÇÃO</span><h1 className="h2 fw-bold">Locações</h1></div>
    <Link className="btn btn-primary align-self-start" to="/locacoes/nova">Nova locação</Link></div>
    {error && <Alert type="danger" message={error} />}{success && <Alert type="success" message={success} />}
    <Card title="Pesquisar locações"><div className="row">
      <div className="col-md-4"><Select label="Status" name="status" value={status} onChange={setStatus}
        options={[{value:'ABERTA',label:'Aberta'}, {value:'FINALIZADA',label:'Finalizada'},
          {value:'CANCELADA',label:'Cancelada'}]} /></div>
      <div className="col-md-5"><Select label="Cliente" name="cliente" value={cliente} onChange={setCliente}
        options={(db?.clientes || []).map((r) => ({ value:r.id || '', label:r.nome }))} /></div>
    </div></Card>
    <div className="mt-4"><Card title="Histórico"><Table data={rows} columns={[
      { title: 'Cliente', render: (r) => db?.clientes.find((c) => c.id === r.clienteId)?.nome || '—' },
      { title: 'Veículo', render: (r) => { const vehicle = db?.veiculos.find((v) => v.id === r.veiculoId);
        return vehicle && db ? vehicleLabel(db, vehicle) : '—'; } },
      { title: 'Retirada', render: (r) => dateLabel(r.dataRetirada) },
      { title: 'Status', render: (r) => <span className={`badge ${r.status === 'ABERTA' ?
        'text-bg-primary' : r.status === 'FINALIZADA' ? 'text-bg-success' : 'text-bg-secondary'}`}>{r.status}</span> },
      { title: 'Total', render: (r) => currency(r.valorTotal) },
    ]} extraAction={{ label:'Detalhes', onClick:(r) => navigate(`/locacoes/${r.id}`) }}
      onDelete={setCancel} canDelete={(r) => r.status === 'ABERTA'}
      emptyMessage="Nenhuma locação corresponde aos filtros." /></Card></div>
    <Modal show={cancel !== null} title="Cancelar locação" message="Deseja cancelar esta locação aberta?"
      onClose={() => setCancel(null)} onConfirm={() => { void cancelRental(); }} />
    <p className="small text-muted mt-3">A ação Excluir cancela apenas locações abertas; o histórico permanece preservado.</p>
  </div>;
}
