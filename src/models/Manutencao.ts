export type StatusManutencao = "EM_ANDAMENTO" | "CONCLUIDA";
export interface Manutencao {
  id?: string;
  data: string;
  descricao: string;
  valor: number;
  status: StatusManutencao;
  veiculoId: string;
}

export const manutencaoInicial: Manutencao = {
  data: "",
  descricao: "",
  valor: 0,
  status: "EM_ANDAMENTO",
  veiculoId: "",
};
