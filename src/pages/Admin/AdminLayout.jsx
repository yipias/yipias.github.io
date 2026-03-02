// src/pages/Admin/AdminLayout.jsx
import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../../components/Admin/Sidebar';
import { useAdminAccess } from '../../hooks/useAdminAccess';
import './AdminLayout.css';

const AdminLayout = () => {
  const { isAdmin } = useAdminAccess();

  useEffect(() => {
    // Guardar referencia al header
    const header = document.querySelector('header');
    
    // Si existe header, ocultarlo
    if (header) {
      header.style.display = 'none';
    }

    // Cleanup: cuando el componente se desmonte, restaurar header
    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'flex'; // Ajusta según tu header
      }
    };
  }, []);

  // Si no es admin, redirigir al inicio
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;