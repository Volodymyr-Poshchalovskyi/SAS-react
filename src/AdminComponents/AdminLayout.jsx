import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; 

function AdminLayout() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        console.log("--- AdminLayout: useEffect запущено ---");

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            
            // --- ЛОГ 1: Яка подія сталася і чи є сесія ---
            console.log(`%cAuth Event: ${event}`, 'color: yellow;', { session });

            if (!session) {
                console.log("--- AdminLayout: Сесії немає, перенаправлення на /login ---");
                navigate('/login');
                setLoading(false);
                return;
            }

            // --- ЛОГ 2: Який ID користувача ми перевіряємо ---
            const userId = session.user.id;
            console.log(`--- AdminLayout: Сесія є. Перевіряємо адмін-статус для User ID: ${userId} ---`);

            const { data: adminRecord, error: adminError } = await supabase
                .from('admins')
                .select('id')
                .eq('id', userId)
                .single();
            
            // --- ЛОГ 3: Який результат запиту до бази даних (НАЙВАЖЛИВІШИЙ) ---
            console.log('%cAdmin Check Result:', 'color: cyan;', { adminRecord, adminError });

            if (adminError || !adminRecord) {
                console.error("--- AdminLayout: Перевірка адміна провалена. Причина: запис не знайдено або сталася помилка. Починаємо вихід... ---", adminError);
                await supabase.auth.signOut();
                navigate('/login', { 
                    state: { message: 'Доступ заборонено: Ви не є адміністратором.' } 
                });
                return;
            }
            
            console.log("%c--- AdminLayout: Перевірка успішна! Користувач - адмін. ---", 'color: green;');
            setLoading(false);
        });

        return () => {
            console.log("--- AdminLayout: Відписка від onAuthStateChange ---");
            subscription.unsubscribe();
        };
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100"> 
                <p>Перевірка доступу...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
            <aside className="w-64 flex-shrink-0 bg-gray-800 p-6">
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <nav className="mt-8"></nav>
            </aside>
            <main className="flex-1 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;