import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';
import { loadData, type DataSet } from '../service/data';
import { currency, vehicleStatus } from '../models/rules';

export function Home() {
  const [db, setDb] = useState<DataSet | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { void loadData().then(setDb).catch((err: unknown) => setError(String(err))); }, []);
  const open = db?.locacoes.filter((r) => r.status === 'ABERTA') || [];
  const available = db?.veiculos.filter((r) => vehicleStatus(db, r.id || '') === 'DISPONÍVEL') || [];
  const revenue = db?.pagamentos.filter((p) => p.status === 'PAGO').reduce((sum, p) => sum + p.valor, 0) || 0;
  return <div className="container py-4 py-lg-5">
    <div className="hero p-4 p-lg-5 mb-4"><span className="eyebrow text-info">PAINEL DA LOCADORA</span>
      <h1 className="display-6 fw-bold mt-2">Frota, clientes e locações em um lugar.</h1>
      <p className="opacity-75 mb-4">Acompanhe a disponibilidade dos veículos e cada etapa da locação.</p>
      <Link className="btn btn-light fw-semibold" to="/locacoes/nova">Criar locação</Link>
    </div>
    {error && <Alert type="danger" message={error} />}
    <div className="row g-3 mb-4">
      {[["Veículos disponíveis", String(available.length), '/veiculos'],
        ['Locações abertas', String(open.length), '/locacoes'],
        ['Clientes', String(db?.clientes.length || 0), '/clientes'],
        ['Pagamentos recebidos', currency(revenue), '/locacoes']].map(([label, value, href]) =>
        <div className="col-md-6 col-xl-3" key={label}><Link to={href} className="text-decoration-none text-reset">
          <Card title={label}><div className="display-6 fw-bold text-primary">{value}</div></Card>
        </Link></div>)}
    </div>
    <Card title="Locações em andamento">
      {open.length ? <div className="list-group list-group-flush">{open.map((r) =>
        <Link to={`/locacoes/${r.id}`} key={r.id} className="list-group-item list-group-item-action d-flex justify-content-between">
          <span>{db?.clientes.find((c) => c.id === r.clienteId)?.nome || 'Cliente'} · {db?.veiculos.find((v) => v.id === r.veiculoId)?.placa}</span>
          <strong>{currency(r.valorTotal)}</strong></Link>)}</div> :
        <p className="text-muted mb-0">Nenhuma locação em aberto.</p>}
    </Card>
  </div>;
}
