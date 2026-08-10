import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendUrl, readError } from '../utils/api';

export type ApiRequest = (
  path: string,
  init?: RequestInit,
) => Promise<Response | null>;

export function useApiRequest(): ApiRequest {
  const navigate = useNavigate();

  return useCallback(
    async (path, init) => {
      const response = await fetch(`${backendUrl}${path}`, {
        credentials: 'include',
        ...init,
      });
      if (response.status === 401) {
        navigate(`/?return_to=${encodeURIComponent(window.location.href)}`);
        return null;
      }
      if (!response.ok) throw new Error(await readError(response));
      return response;
    },
    [navigate],
  );
}

export function jsonBody(body: unknown, method = 'POST'): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
