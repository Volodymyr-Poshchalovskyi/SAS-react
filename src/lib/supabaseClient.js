import { createClient } from '@supabase/supabase-js';

// З міркувань безпеки, ці значення потрібно зберігати в .env файлі
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);