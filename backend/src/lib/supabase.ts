import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure .env is loaded before reading env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.\n' +
    'Set them in backend/.env (get them from Supabase Dashboard → Settings → API).'
  );
}

/**
 * Backend Supabase client — uses the SERVICE_ROLE key.
 * This bypasses Row Level Security (RLS) so the backend can
 * read/write any row without per-user policies.
 *
 *  NEVER expose this client or its key to the frontend.
 */
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // We manage our own JWT auth; disable Supabase's built-in auth persistence
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;
