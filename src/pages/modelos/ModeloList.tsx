import { CadastroPage, type Field } from '../../components/CadastroPage';
import { modeloInicial, type Modelo } from '../../models/Modelo';
import { modeloService } from '../../service/modeloService';

const fields: Field<Modelo>[] = [
  { key: 'nome', label: 'Modelo', required: true },
  { key: 'ano', label: 'Ano', type: 'number', required: true },
  { key: 'marcaId', label: 'Marca', type: 'select', required: true,
    options: (db) => db.marcas.map((item) => ({ value: item.id || '', label: item.nome })),
    format: (value, _item, db) => db.marcas.find((brand) => brand.id === value)?.nome || '—' },
  { key: 'categoriaId', label: 'Categoria', type: 'select', required: true,
    options: (db) => db.categorias.map((item) => ({ value: item.id || '', label: item.nome })),
    format: (value, _item, db) => db.categorias.find((category) => category.id === value)?.nome || '—' },
];

export function ModeloList() {
  return <CadastroPage title="Modelos" collection="modelos" initial={modeloInicial}
    fields={fields} service={modeloService} validate={(item, db) => {
      if (!db.marcas.some((row) => row.id === item.marcaId) ||
        !db.categorias.some((row) => row.id === item.categoriaId))
        throw new Error('Selecione uma marca e uma categoria cadastradas.');
    }} />;
}
