import type { NotaFiscal } from '../models/NotaFiscal';
import { createService } from './api';

export const notaFiscalService = createService<NotaFiscal>('notasFiscais');
