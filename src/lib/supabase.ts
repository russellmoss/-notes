// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
// import { createServerClient } from '@supabase/ssr';

const supabaseUrl = 'https://ggfpkczvvnubjiuiqllv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Function to get Supabase client (initializes only when called)
export function getSupabaseClient() {
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Function to get Supabase admin client (initializes only when called)
export function getSupabaseAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_KEY is required');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Client-side Supabase client
export const supabase = supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Server-side admin client
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;
