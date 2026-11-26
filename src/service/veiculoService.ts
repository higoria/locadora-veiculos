import type { Veiculo } from '../models/Veiculo';
import { createService } from './api';

export const veiculoService = createService<Veiculo>('veiculos');
