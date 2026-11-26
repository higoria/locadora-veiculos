import type { DataSet } from '../service/data';
import type { Veiculo } from './Veiculo';
import type { Cliente } from './Cliente';
import type { Locacao } from './Locacao';

export type EstadoVeiculo = 'DISPONÍVEL' | 'LOCADO' | 'EM MANUTENÇÃO';

export function vehicleStatus(db: DataSet, id: string): EstadoVeiculo {
  if (db.locacoes.some((r) => r.veiculoId === id && r.status === 'ABERTA')) return 'LOCADO';
  if (db.manutencoes.some((r) => r.veiculoId === id && r.status === 'EM_ANDAMENTO')) return 'EM MANUTENÇÃO';
  return 'DISPONÍVEL';
}

export function rentalDays(start: string, end: string): number {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) {
    throw new Error('A devolução deve ocorrer depois da retirada.');
  }
  return Math.max(1, Math.ceil((b - a) / 86_400_000));
}

export function categoryRate(db: DataSet, vehicleId: string): number {
  const vehicle = db.veiculos.find((v) => v.id === vehicleId);
  const model = db.modelos.find((m) => m.id === vehicle?.modeloId);
  const category = db.categorias.find((c) => c.id === model?.categoriaId);
  if (!category || category.valorLocacao <= 0) throw new Error('Categoria ou diária do veículo inválida.');
  return category.valorLocacao;
}

export function validLicense(cliente: Cliente, withdrawal: string): boolean {
  return new Date(`${cliente.validadeCnh}T23:59:59`).getTime() >= new Date(withdrawal).getTime();
}

export function assertReturnKm(km: number, pickupKm: number, currentVehicleKm: number): void {
  if (!Number.isFinite(km) || km < pickupKm || km < currentVehicleKm) {
    throw new Error(`KM de devolução deve ser ao menos ${Math.max(pickupKm, currentVehicleKm)}.`);
  }
}

export function canIssueInvoice(rental: Locacao | undefined, db: DataSet): boolean {
  return Boolean(rental?.id && rental.status === 'FINALIZADA' &&
    !db.notasFiscais.some((invoice) => invoice.locacaoId === rental.id));
}

export function assertUnique<T extends { id?: string }>(
  rows: T[], item: T, keys: (keyof T)[], label: string,
): void {
  for (const key of keys) {
    const value = String(item[key] ?? '').trim().toLowerCase();
    if (value && rows.some((row) => row.id !== item.id && String(row[key] ?? '').trim().toLowerCase() === value)) {
      throw new Error(`${label}: ${String(key)} já está cadastrado.`);
    }
  }
}

export function assertCanDelete(collection: keyof DataSet, id: string, db: DataSet): void {
  const relations: Partial<Record<keyof DataSet, Array<[keyof DataSet, string]>>> = {
    marcas: [['modelos', 'marcaId']],
    categorias: [['modelos', 'categoriaId']],
    modelos: [['veiculos', 'modeloId']],
    veiculos: [['manutencoes', 'veiculoId'], ['locacoes', 'veiculoId']],
    clientes: [['locacoes', 'clienteId']],
    locacoes: [['contratos', 'locacaoId'], ['vistorias', 'locacaoId'], ['pagamentos', 'locacaoId'], ['notasFiscais', 'locacaoId']],
  };
  for (const [table, foreignKey] of relations[collection] || []) {
    const dependent = db[table] as unknown as Record<string, unknown>[];
    if (dependent.some((row) => row[foreignKey] === id)) {
      throw new Error(`Não é possível excluir: há registros dependentes em ${table}.`);
    }
  }
}

export function vehicleLabel(db: DataSet, vehicle: Veiculo): string {
  const model = db.modelos.find((m) => m.id === vehicle.modeloId);
  const brand = db.marcas.find((m) => m.id === model?.marcaId);
  return `${brand?.nome || 'Marca'} ${model?.nome || 'Modelo'} · ${vehicle.placa}`;
}

export function currency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function dateLabel(value?: string): string {
  return value ? new Date(value).toLocaleString('pt-BR') : '—';
}

export function localDateTime(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
