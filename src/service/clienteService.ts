import type { Cliente } from '../models/Cliente';
import { createService } from './api';

export const clienteService = createService<Cliente>('clientes');
