import { CadastroPage, type Field } from '../../components/CadastroPage';
import { manutencaoInicial, type Manutencao } from '../../models/Manutencao';
import { currency, vehicleLabel } from '../../models/rules';
import { manutencaoService } from '../../service/manutencaoService';

const fields: Field<Manutencao>[] = [
  { key: 'veiculoId', label: 'Veículo', type: 'select', required: true,
    options: (db) => db.veiculos.map((row) => ({ value: row.id || '', label: vehicleLabel(db, row) })),
    format: (value, _item, db) => vehicleLabel(db, db.veiculos.find((r) => r.id === value) ||
      { placa: '—', modeloId: '', chassi: '', anoFabricacao: 0, cor: '', kmRodado: 0 }) },
  { key: 'data', label: 'Data', type: 'date', required: true },
  { key: 'descricao', label: 'Descrição', type: 'textarea', required: true },
  { key: 'valor', label: 'Valor (R$)', type: 'number', required: true,
    format: (value) => currency(Number(value)) },
  { key: 'status', label: 'Status', type: 'select', required: true,
    options: () => [{ value: 'EM_ANDAMENTO', label: 'Em manutenção' },
      { value: 'CONCLUIDA', label: 'Concluída' }],
    format: (value) => value === 'EM_ANDAMENTO' ? 'Em manutenção' : 'Concluída' },
];

export function ManutencaoList() {
  return <CadastroPage title="Manutenções" collection="manutencoes" initial={manutencaoInicial}
    fields={fields} service={manutencaoService} validate={(item, db) => {
      if (!db.veiculos.some((row) => row.id === item.veiculoId)) throw new Error('Selecione um veículo válido.');
      if (item.valor < 0) throw new Error('O valor não pode ser negativo.');
    }} />;
}
