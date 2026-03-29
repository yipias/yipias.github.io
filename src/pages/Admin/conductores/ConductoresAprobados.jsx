// src/pages/Admin/conductores/ConductoresAprobados.jsx
import React, { useState } from 'react';
import { CheckCircle, FileDown } from 'lucide-react';
import ConductorCardAprobado from './ConductorCardAprobado';
import ConductorDetalleModal from './ConductorDetalleModal';
import './ConductoresAprobados.css';

const exportarExcel = (conductores) => {
  const encabezados = [
    'Código YPP',
    'Nombre Completo',
    'DNI',
    'Teléfono',
    'Dirección',
    'Placa',
    'Marca',
    'Modelo',
    'Color',
    'Ciudad de Operación'
  ];

  const filas = conductores.map(c => [
    c.codigoYPP || '-',
    c.nombreCompleto || '-',
    c.dni || '-',
    c.telefono || '-',
    c.direccion || '-',
    c.vehiculo?.placa || '-',
    c.vehiculo?.marca || '-',
    c.vehiculo?.modelo || '-',
    c.vehiculo?.color || '-',
    c.ciudadOperacion || '-'
  ]);

  // Construir contenido CSV con BOM para que Excel lo abra bien con tildes
  const BOM = '\uFEFF';
  const csvContent = BOM + [encabezados, ...filas]
    .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `conductores_aprobados_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const ConductoresAprobados = ({ conductores }) => {
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
        <div className="empty-icon">
          <CheckCircle size={48} />
        </div>
        <h3>No hay conductores aprobados</h3>
        <p>Los conductores que apruebes aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <>
      <div className="aprobados-toolbar">
        <span className="aprobados-count">{conductores.length} conductor{conductores.length !== 1 ? 'es' : ''} aprobado{conductores.length !== 1 ? 's' : ''}</span>
        <button
          className="btn-exportar-excel"
          onClick={() => exportarExcel(conductores)}
        >
          <FileDown size={16} />
          Exportar Excel
        </button>
      </div>

      <div className="conductores-grid">
        {conductores.map(conductor => (
          <ConductorCardAprobado
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
          tipo="aprobado"
        />
      )}
    </>
  );
};

export default ConductoresAprobados;