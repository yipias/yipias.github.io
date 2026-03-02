// src/pages/Admin/conductores/ConductorCard.jsx
import React from 'react';
import { User, Calendar, Phone, Eye } from 'lucide-react';
import './ConductorCard.css';

const ConductorCard = ({ conductor, onVerDetalle }) => {
  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (conductor.telefono) {
      window.open(`https://wa.me/${conductor.telefono.replace(/\D/g, '')}`, '_blank');
    }
  };

  return (
    <div className="conductor-card" onClick={() => onVerDetalle(conductor)}>
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
            <span>{formatFecha(conductor.fechaRegistro)}</span>
          </div>
          
          {conductor.telefono && (
            <div className="detalle-item">
              <Phone size={14} />
              <span>{conductor.telefono}</span>
            </div>
          )}
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

export default ConductorCard;