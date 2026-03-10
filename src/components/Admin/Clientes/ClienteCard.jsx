// src/components/Admin/Clientes/ClienteCard.jsx
import React from 'react';
import { Mail, Phone, Calendar, MessageCircle, User, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import './ClienteCard.css';

const ClienteCard = ({ cliente, onDelete }) => {  // ← RECIBIR onDelete

  const getInitials = (nombre) => {
    if (!nombre) return '?';
    return nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (email) => {
    if (!email) return '#dc2626';
    const colors = ['#dc2626', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777'];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).replace('.', '');
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (cliente.telefono) {
      const mensaje = `Hola ${cliente.nombreCompleto || ''}, te contactamos de YipiAs.`;
      window.open(`https://wa.me/${cliente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: '¿Eliminar cliente?',
      text: `Esta acción eliminará permanentemente a ${cliente.nombreCompleto || 'este cliente'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1e1e2e',
      color: '#f1f5f9',
      iconColor: '#ef4444'
    });

    if (result.isConfirmed && onDelete) {
      const res = await onDelete(cliente.id);  // ← USAR onDelete
      if (res?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Cliente eliminado',
          text: 'El cliente ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false,
          background: '#1e1e2e',
          color: '#f1f5f9'
        });
      }
    }
  };

  return (
    <div className="cliente-card">
      <div className="card-header">
        <div className="card-avatar" style={{ background: getAvatarColor(cliente.email) }}>
          {getInitials(cliente.nombreCompleto)}
        </div>
        <h3 className="cliente-nombre">{cliente.nombreCompleto || '—'}</h3>
        <button className="btn-delete-card" onClick={handleDelete} title="Eliminar cliente">
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="cliente-info">
        <div className="info-item">
          <Mail size={14} />
          <span>{cliente.email || '—'}</span>
        </div>
        
        <div className="info-item">
          <Phone size={14} />
          <span>{cliente.telefono || '—'}</span>
        </div>
        
        <div className="info-item">
          <User size={14} />
          <span className="dni-value">{cliente.dni || '—'}</span>
        </div>
        
        <div className="info-item">
          <Calendar size={14} />
          <span>{formatFecha(cliente.fechaRegistro)}</span>
        </div>
      </div>

      {cliente.telefono && (
        <button className="btn-whatsapp-card" onClick={handleWhatsApp}>
          <MessageCircle size={16} />
          Contactar por WhatsApp
        </button>
      )}
    </div>
  );
};

export default ClienteCard;