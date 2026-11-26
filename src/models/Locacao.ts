export type StatusLocacao = "ABERTA" | "FINALIZADA" | "CANCELADA";
export interface Locacao {
  id?: string;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal?: string | undefined;
  kmRetirada: number;
  kmDevolucao?: number | undefined;
  valorTotal: number;
  status: StatusLocacao;
  clienteId: string;
  veiculoId: string;
}

export const locacaoInicial: Locacao = {
  dataRetirada: "",
  dataDevolucaoPrevista: "",
  kmRetirada: 0,
  valorTotal: 0,
  status: "ABERTA",
  clienteId: "",
  veiculoId: "",
};

export function calcularValorLocacao(diarias: number, valorDiaria: number): number {
  return Math.round(diarias * valorDiaria * 100) / 100;
}
