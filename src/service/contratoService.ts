import type { Contrato } from '../models/Contrato';
import { createService } from './api';

export const contratoService = createService<Contrato>('contratos');
