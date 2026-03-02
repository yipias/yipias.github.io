// src/pages/Admin/conductores/ConductoresPage.jsx
import React from 'react';
import { useAdminConductores } from '../../../hooks/useAdminConductores';
import ConductoresPendientes from './ConductoresPendientes';
import './ConductoresPage.css';

const ConductoresPage = () => {
  const { conductores, loading } = useAdminConductores();

  if (loading) {
    return (
      <div className="conductores-loading">
        <div className="spinner"></div>
        <p>Cargando solicitudes de conductores...</p>
      </div>
    );
  }

  return (
    <div className="conductores-page">
      <div className="page-header">
        <h1>Conductores Pendientes</h1>
        <span className="header-count">{conductores.length}</span>
      </div>

      <ConductoresPendientes conductores={conductores} />
    </div>
  );
};

export default ConductoresPage;