import { CadastroPage, type Field } from '../../components/CadastroPage';
import { veiculoInicial, type Veiculo } from '../../models/Veiculo';
import { vehicleStatus } from '../../models/rules';
import { veiculoService } from '../../service/veiculoService';

const fields: Field<Veiculo>[] = [
  { key: 'placa', label: 'Placa', required: true },
  { key: 'chassi', label: 'Chassi', required: true },
  { key: 'modeloId', label: 'Modelo', type: 'select', required: true,
    options: (db) => db.modelos.map((item) => ({ value: item.id || '', label: item.nome })),
    format: (value, _row, db) => db.modelos.find((item) => item.id === value)?.nome || '—' },
  { key: 'anoFabricacao', label: 'Ano fabricação', type: 'number', required: true },
  { key: 'cor', label: 'Cor', required: true },
  { key: 'kmRodado', label: 'Quilometragem', type: 'number', required: true },
];

export function VeiculoList() {
  return <CadastroPage title="Veículos" collection="veiculos" initial={veiculoInicial}
    fields={fields} service={veiculoService} uniqueKeys={['placa', 'chassi']}
    validate={(item, db) => {
      if (!db.modelos.some((row) => row.id === item.modeloId)) throw new Error('Selecione um modelo cadastrado.');
      if (item.kmRodado < 0) throw new Error('Quilometragem inválida.');
      const current = db.veiculos.find((v) => v.id === item.id);
      if (current && item.kmRodado < current.kmRodado)
        throw new Error('A quilometragem não pode ser reduzida.');
    }}
    extraColumns={(db) => [{ title: 'Situação', render: (item) =>
      <span className={`badge ${vehicleStatus(db, item.id || '') === 'DISPONÍVEL' ? 'text-bg-success' :
        vehicleStatus(db, item.id || '') === 'LOCADO' ? 'text-bg-primary' : 'text-bg-warning'}`}>
        {vehicleStatus(db, item.id || '')}</span> }]}
    detailPath={(item) => `/veiculos/${item.id}`} />;
}
