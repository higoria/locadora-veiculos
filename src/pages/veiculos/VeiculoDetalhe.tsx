import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadData, type DataSet } from '../../service/data';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { Table } from '../../components/Table';
import { currency, vehicleLabel, vehicleStatus } from '../../models/rules';

export function VeiculoDetalhe() {
  const { id } = useParams();
  const [db, setDb] = useState<DataSet | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { void loadData().then(setDb).catch((err: unknown) => setError(String(err))); }, []);
  const vehicle = db?.veiculos.find((v) => v.id === id);
  return <div className="container py-4 py-lg-5"><Link to="/veiculos">← Voltar aos veículos</Link>
    <h1 className="h2 fw-bold mt-3">{vehicle && db ? vehicleLabel(db, vehicle) : 'Detalhes do veículo'}</h1>
    {error && <Alert type="danger" message={error} />}
    {db && !vehicle && <Alert type="warning" message="Veículo não encontrado." />}
    {db && vehicle && <div className="row g-3 mt-1">
      <div className="col-md-4"><Card title="Situação atual"><p className="h4">{vehicleStatus(db, vehicle.id || '')}</p>
        <p>Cor: {vehicle.cor}<br />Quilometragem: {vehicle.kmRodado.toLocaleString('pt-BR')} km</p></Card></div>
      <div className="col-md-8"><Card title="Histórico de manutenções"><Table
        data={db.manutencoes.filter((m) => m.veiculoId === id)} columns={[
          { title: 'Data', render: (m) => m.data }, { title: 'Descrição', render: (m) => m.descricao },
          { title: 'Valor', render: (m) => currency(m.valor) },
          { title: 'Status', render: (m) => m.status === 'CONCLUIDA' ? 'Concluída' : 'Em andamento' },
        ]} /></Card></div>
    </div>}
  </div>;
}
