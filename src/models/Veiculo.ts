export interface Veiculo {
  id?: string;
  chassi: string;
  placa: string;
  anoFabricacao: number;
  cor: string;
  kmRodado: number;
  modeloId: string;
}

export const veiculoInicial: Veiculo = {
  chassi: "",
  placa: "",
  anoFabricacao: 2025,
  cor: "",
  kmRodado: 0,
  modeloId: "",
};
