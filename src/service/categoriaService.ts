import type { Categoria } from '../models/Categoria';
import { createService } from './api';

export const categoriaService = createService<Categoria>('categorias');
