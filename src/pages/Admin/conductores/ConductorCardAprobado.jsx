// src/pages/Admin/conductores/ConductorCardAprobado.jsx
import React from 'react';
import { User, Calendar, Phone, Eye, RotateCcw, CheckCircle, Car } from 'lucide-react'; // ← AGREGAMOS Car
import { useAdminConductores } from '../../../hooks/useAdminConductores';
import './ConductorCardAprobado.css';

const ConductorCardAprobado = ({ conductor, onVerDetalle }) => {
  const { revocarConductor } = useAdminConductores();

  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      if (fecha?.seconds) {
        const date = new Date(fecha.seconds * 1000);
        return date.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      if (fecha instanceof Date) {
        return fecha.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      const date = new Date(fecha);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      return 'Fecha no disponible';
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (conductor.telefono) {
      window.open(`https://wa.me/${conductor.telefono.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleRevocar = async (e) => {
    e.stopPropagation();
    const result = await revocarConductor(conductor.id);
    if (result.success) {
      console.log('Conductor revocado a pendiente');
    }
  };

  return (
    <div className="conductor-card aprobado" onClick={() => onVerDetalle(conductor)}>
      <div className="card-badge aprobado">
        <CheckCircle size={12} /> Aprobado
      </div>

      <div className="card-avatar">
        {conductor.fotos?.perfil ? (
          <img src={conductor.fotos.perfil} alt={conductor.nombreCompleto} />
        ) : (
          <User size={30} />
        )}
      </div>

      <div className="card-content">
        <h3 className="conductor-nombre">{conductor.nombreCompleto}</h3>
        
        <div className="conductor-detalles">
          <div className="detalle-item">
            <Calendar size={14} />
            <span>Aprobado: {formatFecha(conductor.fechaActualizacion || conductor.fechaRegistro)}</span>
          </div>
          
          {conductor.telefono && (
            <div className="detalle-item">
              <Phone size={14} />
              <span>{conductor.telefono}</span>
            </div>
          )}

          {/* ✅ NUEVO: Marca y Modelo del vehículo */}
          <div className="detalle-item vehiculo">
            <Car size={14} />
            <span>
              {conductor.vehiculo?.marca || '?'} {conductor.vehiculo?.modelo || '?'} - {conductor.vehiculo?.placa || 'Sin placa'}
            </span>
          </div>
          
          {/* ✅ NUEVO: Año y Color */}
          <div className="detalle-item vehiculo-detalle">
            <span>Año: {conductor.vehiculo?.año || '?'} | Color: {conductor.vehiculo?.color || '?'}</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="action-btn whatsapp"
          onClick={handleWhatsApp}
          title="Contactar por WhatsApp"
        >
          <i className="fab fa-whatsapp"></i>
        </button>
        
        <button 
          className="action-btn revocar"
          onClick={handleRevocar}
          title="Revocar (mover a pendiente)"
        >
          <RotateCcw size={18} />
        </button>
        
        <button 
          className="action-btn view"
          onClick={() => onVerDetalle(conductor)}
          title="Ver detalles"
        >
          <Eye size={18} />
        </button>
      </div>
    </div>
  );
};

export default ConductorCardAprobado;