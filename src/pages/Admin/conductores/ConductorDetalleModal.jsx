// src/pages/Admin/conductores/ConductorDetalleModal.jsx
import React, { useState } from 'react';
import { 
  X, Phone, CheckCircle, XCircle, User, Car, 
  Calendar, MapPin, Home, Wifi, Briefcase,
  CalendarDays, Hash, Palette, Camera
} from 'lucide-react';
import { useAdminConductores } from '../../../hooks/useAdminConductores';
import './ConductorDetalleModal.css';

const ConductorDetalleModal = ({ conductor, onClose }) => {
  const { aprobarConductor, rechazarConductor } = useAdminConductores();
  const [selectedFoto, setSelectedFoto] = useState(null);

  const handleAprobar = async () => {
    const result = await aprobarConductor(conductor.id);
    if (result.success) onClose();
  };

  const handleRechazar = async () => {
    const result = await rechazarConductor(conductor.id);
    if (result.success) onClose();
  };

  const handleWhatsApp = () => {
    if (conductor.telefono) {
      window.open(`https://wa.me/${conductor.telefono.replace(/\D/g, '')}`, '_blank');
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Componente para mostrar fotos con label visible
  const FotoVisualizador = ({ src, label }) => (
    <div className="foto-visualizador">
      <label>{label}</label>
      <div 
        className="foto-contenedor"
        onClick={() => src && setSelectedFoto(src)}
      >
        {src ? (
          <img src={src} alt={label} />
        ) : (
          <div className="foto-placeholder">
            <Camera size={24} />
            <span>Sin imagen</span>
          </div>
        )}
      </div>
    </div>
  );

  // Componente para campo con label visible
  const CampoInfo = ({ icon: Icon, label, value }) => (
    <div className="campo-info">
      <div className="campo-label">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <div className="campo-valor">{value || 'No especificado'}</div>
    </div>
  );

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content conductor-modal" onClick={(e) => e.stopPropagation()}>
          
          {/* HEADER */}
          <div className="modal-header">
            <h2>Detalles del Conductor</h2>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            
            {/* FECHA DE POSTULACIÓN DESTACADA */}
            <div className="fecha-postulacion-destacada">
              <Calendar size={18} />
              <span>Postuló: {formatFecha(conductor.fechaRegistro)}</span>
            </div>

            {/* FOTO DE PERFIL */}
            <div className="foto-perfil-section">
              <FotoVisualizador 
                src={conductor.fotos?.perfil} 
                label="Foto de perfil"
              />
            </div>

            {/* DATOS PERSONALES */}
            <h3>Datos personales</h3>
            <div className="campos-grid">
              <CampoInfo 
                icon={User} 
                label="Nombre completo" 
                value={conductor.nombreCompleto} 
              />
              <CampoInfo 
                icon={MapPin} 
                label="Ciudad de operación" 
                value={conductor.ciudadOperacion} 
              />
              <CampoInfo 
                icon={Phone} 
                label="Teléfono" 
                value={conductor.telefono} 
              />
              <CampoInfo 
                icon={CalendarDays} 
                label="Fecha de nacimiento" 
                value={conductor.fechaNacimiento} 
              />
              <CampoInfo 
                icon={Home} 
                label="Dirección" 
                value={conductor.direccion} 
                className="full-width"
              />
            </div>

            {/* DATOS DEL VEHÍCULO */}
            <h3>Datos del vehículo</h3>
            <div className="campos-grid">
              <CampoInfo 
                icon={Hash} 
                label="Año" 
                value={conductor.vehiculo?.año} 
              />
              <CampoInfo 
                icon={Palette} 
                label="Color" 
                value={conductor.vehiculo?.color} 
              />
              <CampoInfo 
                icon={Hash} 
                label="Placa" 
                value={conductor.vehiculo?.placa} 
              />
              <CampoInfo 
                icon={Wifi} 
                label="Aire acondicionado" 
                value={conductor.vehiculo?.aireAcondicionado === 'Otros' 
                  ? `${conductor.vehiculo.aireAcondicionado} (${conductor.vehiculo.aireAcondicionadoOtro})`
                  : conductor.vehiculo?.aireAcondicionado
                } 
              />
            </div>

            {/* FOTOS DEL VEHÍCULO */}
            <h3>Fotos del vehículo</h3>
            <div className="fotos-grid">
              <FotoVisualizador 
                src={conductor.fotos?.vehiculoFrontal} 
                label="Frontal (placa visible)"
              />
              <FotoVisualizador 
                src={conductor.fotos?.vehiculoLateral} 
                label="Lateral"
              />
              <FotoVisualizador 
                src={conductor.fotos?.vehiculoInterior} 
                label="Interior (desde atrás)"
              />
            </div>

            {/* DOCUMENTOS */}
            <h3>Documentos</h3>
            <div className="fotos-grid">
              <FotoVisualizador 
                src={conductor.fotos?.tarjetaPropiedadFrente} 
                label="Tarjeta propiedad (Frente)"
              />
              <FotoVisualizador 
                src={conductor.fotos?.tarjetaPropiedadTrasero} 
                label="Tarjeta propiedad (Trasero)"
              />
              <FotoVisualizador 
                src={conductor.fotos?.breveteFrente} 
                label="Brevete (Frente)"
              />
              <FotoVisualizador 
                src={conductor.fotos?.breveteTrasero} 
                label="Brevete (Trasero)"
              />
              <FotoVisualizador 
                src={conductor.fotos?.soat} 
                label="SOAT (Vigente)"
              />
              <FotoVisualizador 
                src={conductor.fotos?.reciboLuz} 
                label="Recibo de luz/agua"
              />
            </div>

            {/* PREGUNTAS */}
            <h3>Evaluación</h3>
            <div className="preguntas-grid">
              <div className="pregunta-item">
                <div className="pregunta-label">Código de vestimenta</div>
                <div className="pregunta-valor">{conductor.codigoVestimenta || 'No respondió'}</div>
              </div>
              <div className="pregunta-item">
                <div className="pregunta-label">Manejo de cliente exigente</div>
                <div className="pregunta-valor">{conductor.manejoClienteExigente || 'No respondió'}</div>
              </div>
              <div className="pregunta-item">
                <div className="pregunta-label">Significado de premium</div>
                <div className="pregunta-valor">{conductor.significadoPremium || 'No respondió'}</div>
              </div>
            </div>
          </div>

          {/* FOOTER CON BOTONES */}
          <div className="modal-footer">
            <button className="btn-rechazar" onClick={handleRechazar}>
              <XCircle size={18} /> Rechazar
            </button>
            <button className="btn-aprobar" onClick={handleAprobar}>
              <CheckCircle size={18} /> Aprobar
            </button>
          </div>

        </div>
      </div>

      {/* Modal para ver foto en grande */}
      {selectedFoto && (
        <div className="foto-modal" onClick={() => setSelectedFoto(null)}>
          <div className="foto-modal-content">
            <img src={selectedFoto} alt="Foto ampliada" />
            <button className="close-foto" onClick={() => setSelectedFoto(null)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ConductorDetalleModal;