import { CadastroPage, type Field } from '../../components/CadastroPage';
import { marcaInicial, type Marca } from '../../models/Marca';
import { marcaService } from '../../service/marcaService';

const fields: Field<Marca>[] = [{ key: 'nome', label: 'Nome da marca', required: true }];

export function MarcaList() {
  return <CadastroPage title="Marcas" collection="marcas" initial={marcaInicial}
    fields={fields} service={marcaService} />;
}
