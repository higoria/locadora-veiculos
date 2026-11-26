import { CadastroPage, type Field } from '../../components/CadastroPage';
import { categoriaInicial, type Categoria } from '../../models/Categoria';
import { categoriaService } from '../../service/categoriaService';
import { currency } from '../../models/rules';

const fields: Field<Categoria>[] = [
  { key: 'nome', label: 'Categoria', required: true },
  { key: 'valorLocacao', label: 'Valor da diária (R$)', type: 'number', required: true,
    format: (value) => currency(Number(value)) },
];

export function CategoriaList() {
  return <CadastroPage title="Categorias" collection="categorias" initial={categoriaInicial}
    fields={fields} service={categoriaService}
    validate={(item) => { if (item.valorLocacao <= 0) throw new Error('A diária deve ser maior que zero.'); }} />;
}
