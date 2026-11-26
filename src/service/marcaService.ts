import type { Marca } from '../models/Marca';
import { createService } from './api';

export const marcaService = createService<Marca>('marcas');
