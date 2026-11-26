import type { Vistoria } from '../models/Vistoria';
import { createService } from './api';

export const vistoriaService = createService<Vistoria>('vistorias');
