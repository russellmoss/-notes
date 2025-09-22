// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
// import { createServerClient } from '@supabase/ssr';

const supabaseUrl = 'https://ggfpkczvvnubjiuiqllv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_jj9F6VThgsV_c79cQiIhJQ_ZHwhj2RA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
