// src/pages/Admin/AdminDashboard.jsx
import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>
      <p>Bienvenido al panel de control de YipiAs</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Conductores pendientes</h3>
          <div className="stat-number">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Reservas hoy</h3>
          <div className="stat-number">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Clientes registrados</h3>
          <div className="stat-number">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Ingresos del mes</h3>
          <div className="stat-number">S/ 0</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;