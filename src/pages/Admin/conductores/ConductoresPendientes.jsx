// src/pages/Admin/conductores/ConductoresPendientes.jsx
import React, { useState } from 'react';
import ConductorCard from './ConductorCard';
import ConductorDetalleModal from './ConductorDetalleModal';
import './ConductoresPendientes.css';

const ConductoresPendientes = ({ conductores }) => {
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleVerDetalle = (conductor) => {
    setSelectedConductor(conductor);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedConductor(null);
  };

  if (conductores.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No hay solicitudes pendientes</h3>
        <p>Los nuevos conductores aparecerán aquí cuando se registren.</p>
      </div>
    );
  }

  return (
    <>
      <div className="conductores-grid">
        {conductores.map(conductor => (
          <ConductorCard 
            key={conductor.id} 
            conductor={conductor} 
            onVerDetalle={handleVerDetalle}
          />
        ))}
      </div>

      {showModal && selectedConductor && (
        <ConductorDetalleModal 
          conductor={selectedConductor} 
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ConductoresPendientes;