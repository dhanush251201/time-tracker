const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:4000';

const buildUrl = (path: string): string => {
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL.replace(/\/$/, '')}${trimmed}`;
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const apiPost = async <TBody, TResult>(path: string, body: TBody): Promise<TResult> => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`POST ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as TResult;
};

export const apiPut = async <TBody, TResult>(path: string, body: TBody): Promise<TResult> => {
  const response = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`PUT ${path} failed with status ${response.status}`);
  }

  return (await response.json()) as TResult;
};

export const apiDelete = async (path: string): Promise<void> => {
  const response = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`DELETE ${path} failed with status ${response.status}`);
  }
};
