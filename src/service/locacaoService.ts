import type { Locacao } from '../models/Locacao';
import { createService } from './api';

export const locacaoService = createService<Locacao>('locacoes');
