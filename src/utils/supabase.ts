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

// ----------------------------------------------------
// Specific Supabase "users" Table & Login Functions
// ----------------------------------------------------

export function mapRowToAppUser(row: any): any {
  if (!row) return null;
  return {
    id: String(row.id || row.user_id || `usr-${Date.now()}`),
    username: String(row.username || ''),
    password: String(row.password || '123456'),
    name: String(row.name || row.full_name || row.username || 'User'),
    email: String(row.email || ''),
    phone: String(row.phone || row.phone_number || ''),
    role: row.role || 'Sales Marketing',
    marketingType: row.marketing_type || row.marketingType || 'Inhouse',
    agencyName: row.agency_name || row.agencyName || '',
    status: row.status || 'Aktif',
    notes: row.notes || '',
    allowedTabs: typeof row.allowed_tabs === 'string'
      ? (() => { try { return JSON.parse(row.allowed_tabs); } catch (e) { return []; } })()
      : (Array.isArray(row.allowed_tabs) ? row.allowed_tabs : (Array.isArray(row.allowedTabs) ? row.allowedTabs : []))
  };
}

export function mapAppUserToRow(user: any): any {
  return {
    id: user.id,
    username: user.username,
    password: user.password || '123456',
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role,
    marketing_type: user.marketingType,
    agency_name: user.agencyName || null,
    status: user.status,
    notes: user.notes || null,
    allowed_tabs: JSON.stringify(user.allowedTabs || []),
    updated_at: new Date().toISOString()
  };
}

/**
 * Save user list directly to Supabase "users" table & "erp_data" key
 */
export async function saveUsersToSupabase(users: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  
  // 1. Always save to erp_data document in Supabase
  await saveToSupabase('yp_erp_users', users);

  if (!client) return false;

  // 2. Also upsert into dedicated "users" table in Supabase
  try {
    const rows = users.map(mapAppUserToRow);
    const { error } = await client.from('users').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('Notice upserting to Supabase "users" table (using erp_data fallback):', error.message);
    } else {
      console.log('Successfully saved user data to Supabase "users" table.');
    }
  } catch (err) {
    console.warn('Supabase "users" table write notice:', err);
  }

  return true;
}

/**
 * Fetch all users directly from Supabase "users" table or "erp_data" fallback
 */
export async function fetchUsersFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  // Try fetching directly from "users" table in Supabase
  try {
    const { data, error } = await client.from('users').select('*');
    if (!error && data && data.length > 0) {
      console.log(`Fetched ${data.length} user records from Supabase "users" table.`);
      return data.map(mapRowToAppUser);
    }
  } catch (err) {
    console.warn('Could not read from Supabase "users" table, attempting key fallback:', err);
  }

  // Fallback to "erp_data" table in Supabase
  return loadFromSupabase<any[]>('yp_erp_users');
}

/**
 * Directly query Supabase "users" table for username or email for Login verification
 */
export async function verifyUserLoginFromSupabase(identifier: string): Promise<any | null> {
  const client = getSupabaseClient();
  const cleanId = identifier.trim().toLowerCase();
  if (!cleanId) return null;

  if (client) {
    try {
      // Query "users" table in Supabase
      const { data, error } = await client
        .from('users')
        .select('*')
        .or(`username.ilike.${cleanId},email.ilike.${cleanId}`);

      if (!error && data && data.length > 0) {
        return mapRowToAppUser(data[0]);
      }
    } catch (err) {
      console.warn('Error querying Supabase "users" table directly during login:', err);
    }
  }

  // Fallback: fetch user list from Supabase/Cloud
  const cloudUsers = await fetchUsersFromSupabase();
  if (cloudUsers && Array.isArray(cloudUsers)) {
    const found = cloudUsers.find(
      (u) =>
        (u.username && u.username.trim().toLowerCase() === cleanId) ||
        (u.email && u.email.trim().toLowerCase() === cleanId)
    );
    if (found) return found;
  }

  return null;
}

