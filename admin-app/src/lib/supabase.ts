// Knight Admin — Generic DB query helper via IPC

import type { QueryResult } from './types';

declare global {
  interface Window {
    electronAPI: {
      onWorkerLog: (cb: (msg: string) => void) => void;
      onWorkerError: (cb: (msg: string) => void) => void;
      onWorkerStatus: (cb: (msg: string) => void) => void;
      windowMinimize: () => void;
      windowMaximize: () => void;
      windowClose: () => void;
      getEnv: () => Promise<Record<string, string>>;
      saveEnv: (data: Record<string, string>) => Promise<{ success: boolean }>;
      getUsers: () => Promise<{ data: any[] | null; error: string | null }>;
      getLogs: () => Promise<string[]>;
      dbQuery: (query: {
        table: string;
        action: 'select' | 'insert' | 'update' | 'delete' | 'count';
        filters?: Record<string, any>;
        select?: string;
        order?: { column: string; ascending?: boolean };
        limit?: number;
        offset?: number;
        data?: Record<string, any>;
        match?: Record<string, any>;
      }) => Promise<QueryResult<any>>;
      workerStatus: () => Promise<any>;
      workerRestart: () => Promise<{ success: boolean }>;
      workerStop: () => Promise<{ success: boolean }>;
    };
  }
}

export async function dbQuery(query: {
  table: string;
  action: 'select' | 'insert' | 'update' | 'delete' | 'count';
  filters?: Record<string, any>;
  select?: string;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  data?: Record<string, any>;
  match?: Record<string, any>;
}): Promise<QueryResult<any>> {
  if (!window.electronAPI?.dbQuery) {
    return { data: null, error: 'electronAPI not available' };
  }
  return window.electronAPI.dbQuery(query);
}

export async function dbSelect<T>(
  table: string,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }
): Promise<QueryResult<T[]>> {
  return dbQuery({ table, action: 'select', ...options });
}

export async function dbSelectSingle<T>(
  table: string,
  filters: Record<string, any>
): Promise<QueryResult<T>> {
  const result = await dbQuery({ table, action: 'select', filters, limit: 1 });
  if (result.error) return { data: null, error: result.error };
  return { data: result.data?.[0] || null, error: null };
}

export async function dbInsert(
  table: string,
  data: Record<string, any>
): Promise<QueryResult<any>> {
  return dbQuery({ table, action: 'insert', data });
}

export async function dbUpdate(
  table: string,
  data: Record<string, any>,
  match: Record<string, any>
): Promise<QueryResult<any>> {
  return dbQuery({ table, action: 'update', data, match });
}

export async function dbDelete(
  table: string,
  match: Record<string, any>
): Promise<QueryResult<any>> {
  return dbQuery({ table, action: 'delete', match });
}

export async function dbCount(
  table: string,
  filters?: Record<string, any>
): Promise<QueryResult<number>> {
  const result = await dbQuery({ table, action: 'count', filters });
  if (result.error) return { data: null, error: result.error };
  return { data: result.count || 0, error: null };
}
