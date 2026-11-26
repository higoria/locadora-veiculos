export interface Entity { id?: string }

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new Error('API indisponível. Execute npm run server na porta 3001.');
  }
  if (!response.ok) {
    throw new Error(`Falha na API (${response.status}) ao acessar ${path}.`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function createService<T extends Entity>(collection: string) {
  const base = `/${collection}`;
  return {
    listar: (): Promise<T[]> => request<T[]>(base),
    buscarPorId: (id: string): Promise<T> => request<T>(`${base}/${encodeURIComponent(id)}`),
    criar: (obj: T): Promise<T> => request<T>(base, {
      method: 'POST', body: JSON.stringify({ ...obj, id: obj.id || newId() }),
    }),
    atualizar: (id: string, obj: T): Promise<T> => request<T>(`${base}/${encodeURIComponent(id)}`, {
      method: 'PUT', body: JSON.stringify({ ...obj, id }),
    }),
    excluir: (id: string): Promise<void> => request<void>(`${base}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  };
}
