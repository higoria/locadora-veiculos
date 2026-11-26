import type { Modelo } from '../models/Modelo';
import { createService } from './api';

export const modeloService = createService<Modelo>('modelos');
