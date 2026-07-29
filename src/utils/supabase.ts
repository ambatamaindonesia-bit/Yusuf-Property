import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default env variables or saved credentials in localStorage
const metaEnv = (import.meta as any).env || {};
const DEFAULT_SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || localStorage.getItem('yp_supabase_url') || '';
const DEFAULT_SUPABASE_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || localStorage.getItem('yp_supabase_key') || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseInstance) {
    const url = localStorage.getItem('yp_supabase_url') || metaEnv.VITE_SUPABASE_URL;
    const key = localStorage.getItem('yp_supabase_key') || metaEnv.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      try {
        supabaseInstance = createClient(url, key);
      } catch (err) {
        console.error('Failed to create Supabase client:', err);
      }
    }
  }
  return supabaseInstance;
}

export function isSupabaseConnected(): boolean {
  const url = localStorage.getItem('yp_supabase_url') || metaEnv.VITE_SUPABASE_URL;
  const key = localStorage.getItem('yp_supabase_key') || metaEnv.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}


export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem('yp_supabase_url', url.trim());
  localStorage.setItem('yp_supabase_key', key.trim());
  supabaseInstance = createClient(url.trim(), key.trim());
}

export async function saveToSupabase<T>(key: string, data: T): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payloadStr = JSON.stringify(data);
    const { error } = await client
      .from('erp_data')
      .upsert({ key, payload: payloadStr, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.warn(`Supabase save notice for ${key}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Supabase save error for ${key}:`, err);
    return false;
  }
}

export async function loadFromSupabase<T>(key: string): Promise<T | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('erp_data')
      .select('payload')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    
    if (typeof data.payload === 'string') {
      return JSON.parse(data.payload) as T;
    }
    return data.payload as T;
  } catch (err) {
    console.error(`Supabase load error for ${key}:`, err);
    return null;
  }
}

export function subscribeToSupabaseKey<T>(key: string, callback: (data: T) => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel(`erp_${key}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'erp_data', filter: `key=eq.${key}` },
        (payload) => {
          if (payload.new && (payload.new as any).payload) {
            try {
              const raw = (payload.new as any).payload;
              const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
              callback(parsed as T);
            } catch (e) {
              console.error(`Failed to parse Supabase payload for ${key}:`, e);
            }
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.error(`Supabase subscription error for ${key}:`, err);
    return () => {};
  }
}
