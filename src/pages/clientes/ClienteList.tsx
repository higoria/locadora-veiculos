import { CadastroPage, type Field } from '../../components/CadastroPage';
import { clienteInicial, type Cliente } from '../../models/Cliente';
import { clienteService } from '../../service/clienteService';

const fields: Field<Cliente>[] = [
  { key: 'nome', label: 'Nome', required: true },
  { key: 'cpf', label: 'CPF', required: true },
  { key: 'cnh', label: 'CNH', required: true },
  { key: 'validadeCnh', label: 'Validade da CNH', type: 'date', required: true },
  { key: 'telefone', label: 'Telefone', required: true },
  { key: 'email', label: 'E-mail', type: 'email', required: true },
  { key: 'endereco', label: 'Endereço', required: true, table: false },
];

export function ClienteList() {
  return <CadastroPage title="Clientes" collection="clientes" initial={clienteInicial}
    fields={fields} service={clienteService} uniqueKeys={['cpf', 'cnh']} />;
}
