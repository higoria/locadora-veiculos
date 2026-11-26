import type { Manutencao } from '../models/Manutencao';
import { createService } from './api';

export const manutencaoService = createService<Manutencao>('manutencoes');
