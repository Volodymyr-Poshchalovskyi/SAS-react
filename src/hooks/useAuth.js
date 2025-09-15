import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Імпортуємо сам контекст

// Хук залишається таким самим, але тепер живе в окремому файлі
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};