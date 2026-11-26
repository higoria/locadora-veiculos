import type { Pagamento } from '../models/Pagamento';
import { createService } from './api';

export const pagamentoService = createService<Pagamento>('pagamentos');
