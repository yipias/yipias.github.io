// src/hooks/useAdminAccess.js
import { useAuth } from '../context/AuthContext';

export const useAdminAccess = () => {
  const { currentUser } = useAuth();
  
  // Solo ensegcor@gmail.com puede acceder
  const isAdmin = currentUser?.email === 'ensegcor@gmail.com';
  
  return { isAdmin, currentUser };
};