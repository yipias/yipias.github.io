// src/components/Auth/PerfilModal.jsx
import React from 'react';
import { User, Mail, Phone, CreditCard, Calendar, X } from 'lucide-react';
import './PerfilModal.css';

const PerfilModal = ({ userData, onClose }) => {
  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="perfil-modal-overlay" onClick={onClose}>
      <div className="perfil-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="perfil-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="perfil-header">
          <div className="perfil-avatar">
            {userData?.nombreCompleto?.charAt(0) || 'U'}
          </div>
          <h2>Mi Perfil</h2>
        </div>

        <div className="perfil-info">
          <div className="perfil-field">
            <User size={18} className="field-icon" />
            <div className="field-content">
              <span className="field-label">Nombre completo</span>
              <span className="field-value">{userData?.nombreCompleto || '—'}</span>
            </div>
          </div>

          <div className="perfil-field">
            <Mail size={18} className="field-icon" />
            <div className="field-content">
              <span className="field-label">Correo electrónico</span>
              <span className="field-value">{userData?.email || '—'}</span>
            </div>
          </div>

          <div className="perfil-field">
            <Phone size={18} className="field-icon" />
            <div className="field-content">
              <span className="field-label">Teléfono</span>
              <span className="field-value">{userData?.telefono || '—'}</span>
            </div>
          </div>

          <div className="perfil-field">
            <CreditCard size={18} className="field-icon" />
            <div className="field-content">
              <span className="field-label">DNI</span>
              <span className="field-value">{userData?.dni || '—'}</span>
            </div>
          </div>

          <div className="perfil-field">
            <Calendar size={18} className="field-icon" />
            <div className="field-content">
              <span className="field-label">Fecha de registro</span>
              <span className="field-value">{formatFecha(userData?.fechaRegistro)}</span>
            </div>
          </div>
        </div>

        <div className="perfil-footer">
          <button className="perfil-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfilModal;