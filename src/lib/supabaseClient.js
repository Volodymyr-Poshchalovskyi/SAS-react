import { createClient } from '@supabase/supabase-js'

// Отримуємо змінні середовища за допомогою синтаксису Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Перевіряємо, чи змінні існують, щоб уникнути помилок
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

// Створюємо та експортуємо клієнт
export const supabase = createClient(supabaseUrl, supabaseAnonKey);