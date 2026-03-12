// src/pages/Admin/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../../components/Admin/Sidebar';
import { useAdminAccess } from '../../hooks/useAdminAccess';
import { Monitor } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const { isAdmin } = useAdminAccess();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024); // 👈 CAMBIADO A 1024px

  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // 👈 CAMBIADO A 1024px
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'flex';
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Detectar mouse cerca del borde izquierdo (solo en desktop)
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      if (e.clientX < 20) {
        setShowSidebar(true);
      } else if (!e.target.closest('.sidebar-container')) {
        setShowSidebar(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isMobile) {
    return (
      <div className="admin-mobile-block">
        <Monitor size={64} className="mobile-icon" />
        <h2>Acceso restringido</h2>
        <p>El panel administrativo solo está disponible para computadoras o laptops.</p>
        <p className="small">Por favor, accede desde una pantalla más grande para gestionar el sistema.</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div 
        className={`sidebar-container ${showSidebar ? 'visible' : ''}`}
        onMouseEnter={() => setShowSidebar(true)}
        onMouseLeave={() => setShowSidebar(false)}
      >
        <Sidebar />
      </div>
      
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;