// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Створюємо контекст
const AuthContext = createContext();

// Створюємо провайдер, який буде обгортати наш додаток
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ця функція перевірить, чи є поточний користувач адміном
    const checkAdminStatus = async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single();
      
      // Якщо запис знайдено (немає помилки), користувач - адмін
      setIsAdmin(!error && data);
    };

    // 1. Отримуємо початкову сесію, щоб уникнути мерехтіння
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await checkAdminStatus(session?.user);
      setLoading(false); // Завершуємо початкове завантаження
    });

    // 2. Слухаємо зміни стану автентифікації
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        await checkAdminStatus(session?.user);
        // Не встановлюємо loading тут, бо це лише оновлення, а не початкове завантаження
      }
    );

    // Відписуємось при розмонтуванні компонента
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    isAdmin,
    loading, // Додаємо loading до контексту
  };

  // Надаємо дані всім дочірнім компонентам
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Створюємо кастомний хук для зручного доступу до контексту
export function useAuth() {
  return useContext(AuthContext);
}