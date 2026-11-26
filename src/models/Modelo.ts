export interface Modelo {
  id?: string;
  nome: string;
  ano: number;
  marcaId: string;
  categoriaId: string;
}

export const modeloInicial: Modelo = {
  nome: "",
  ano: 2025,
  marcaId: "",
  categoriaId: "",
};
