import type { Marca } from '../models/Marca';
import type { Categoria } from '../models/Categoria';
import type { Modelo } from '../models/Modelo';
import type { Veiculo } from '../models/Veiculo';
import type { Manutencao } from '../models/Manutencao';
import type { Cliente } from '../models/Cliente';
import type { Locacao } from '../models/Locacao';
import type { Contrato } from '../models/Contrato';
import type { Vistoria } from '../models/Vistoria';
import type { Pagamento } from '../models/Pagamento';
import type { NotaFiscal } from '../models/NotaFiscal';
import { marcaService } from './marcaService';
import { categoriaService } from './categoriaService';
import { modeloService } from './modeloService';
import { veiculoService } from './veiculoService';
import { manutencaoService } from './manutencaoService';
import { clienteService } from './clienteService';
import { locacaoService } from './locacaoService';
import { contratoService } from './contratoService';
import { vistoriaService } from './vistoriaService';
import { pagamentoService } from './pagamentoService';
import { notaFiscalService } from './notaFiscalService';

export interface DataSet {
  marcas: Marca[];
  categorias: Categoria[];
  modelos: Modelo[];
  veiculos: Veiculo[];
  manutencoes: Manutencao[];
  clientes: Cliente[];
  locacoes: Locacao[];
  contratos: Contrato[];
  vistorias: Vistoria[];
  pagamentos: Pagamento[];
  notasFiscais: NotaFiscal[];
}

export async function loadData(): Promise<DataSet> {
  const [marcas, categorias, modelos, veiculos, manutencoes, clientes,
    locacoes, contratos, vistorias, pagamentos, notasFiscais] = await Promise.all([
    marcaService.listar(), categoriaService.listar(), modeloService.listar(),
    veiculoService.listar(), manutencaoService.listar(), clienteService.listar(),
    locacaoService.listar(), contratoService.listar(), vistoriaService.listar(),
    pagamentoService.listar(), notaFiscalService.listar(),
  ]);
  return { marcas, categorias, modelos, veiculos, manutencoes, clientes,
    locacoes, contratos, vistorias, pagamentos, notasFiscais };
}
