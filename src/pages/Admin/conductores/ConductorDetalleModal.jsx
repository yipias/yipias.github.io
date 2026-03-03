// src/pages/Admin/conductores/ConductorDetalleModal.jsx
import React, { useState, useCallback, memo } from 'react';
import { 
  X, Phone, CheckCircle, XCircle, User, Car, 
  Calendar, MapPin, Home, Wifi, Briefcase,
  CalendarDays, Hash, Palette, Camera, RotateCcw, Edit2, Save
} from 'lucide-react';
import { useAdminConductores } from '../../../hooks/useAdminConductores';
import './ConductorDetalleModal.css';

// Componente CampoInfo memoizado para evitar re-renders innecesarios
const CampoInfo = memo(({ icon: Icon, label, field, value, editMode, tipo, onUpdate }) => {
  const handleChange = useCallback((e) => {
    onUpdate(field, e.target.value);
  }, [field, onUpdate]);

  return (
    <div className="campo-info">
      <div className="campo-label">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      {editMode && tipo === 'aprobado' ? (
        <input
          type="text"
          className="campo-input"
          value={value || ''}
          onChange={handleChange}
          placeholder={label}
          autoComplete="off"
        />
      ) : (
        <div className="campo-valor">{value || 'No especificado'}</div>
      )}
    </div>
  );
});

// Componente FotoVisualizador MEJORADO con manejo de errores
const FotoVisualizador = memo(({ src, label, onClick }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Si no hay src o hubo error, mostrar placeholder
  if (!src || error) {
    return (
      <div className="foto-visualizador">
        <label>{label}</label>
        <div className="foto-contenedor">
          <div className="foto-placeholder">
            <Camera size={24} />
            <span>{error ? 'Error al cargar' : 'Sin imagen'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="foto-visualizador">
      <label>{label}</label>
      <div className="foto-contenedor" onClick={() => onClick(src)}>
        {loading && <div className="foto-loading">Cargando...</div>}
        <img 
          src={src} 
          alt={label}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
});

const ConductorDetalleModal = ({ conductor, onClose, tipo = 'pendiente' }) => {
  const { aprobarConductor, rechazarConductor, revocarConductor, actualizarConductor } = useAdminConductores();
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({ ...conductor });

  const handleAprobar = async () => {
    const result = await aprobarConductor(conductor.id);
    if (result.success) onClose();
  };

  const handleRechazar = async () => {
    const result = await rechazarConductor(conductor.id);
    if (result.success) onClose();
  };

  const handleRevocar = async () => {
    const result = await revocarConductor(conductor.id);
    if (result.success) onClose();
  };

  const handleGuardarCambios = async () => {
    const result = await actualizarConductor(conductor.id, editedData);
    if (result.success) {
      setEditMode(false);
    }
  };

  const handleWhatsApp = () => {
    if (conductor.telefono) {
      window.open(`https://wa.me/${conductor.telefono.replace(/\D/g, '')}`, '_blank');
    }
  };

  // Función estable para actualizar campos
  const handleFieldUpdate = useCallback((field, value) => {
    setEditedData(prev => {
      const newData = { ...prev };
      const keys = field.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  }, []);

  const formatFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    
    try {
      if (fecha?.seconds) {
        const date = new Date(fecha.seconds * 1000);
        return date.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      if (fecha instanceof Date) {
        return fecha.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      const date = new Date(fecha);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Fecha no disponible';
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  // Función para obtener valor anidado
  const getNestedValue = useCallback((obj, path) => {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value === undefined || value === null) return '';
      value = value[key];
    }
    return value || '';
  }, []);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content conductor-modal" onClick={(e) => e.stopPropagation()}>
          
          {/* HEADER */}
          <div className="modal-header">
            <h2>Detalles del Conductor</h2>
            <div className="header-actions">
              {tipo === 'aprobado' && (
                <button 
                  className={`edit-mode-btn ${editMode ? 'active' : ''}`}
                  onClick={() => editMode ? handleGuardarCambios() : setEditMode(true)}
                >
                  {editMode ? <Save size={18} /> : <Edit2 size={18} />}
                  {editMode ? 'Guardar' : 'Editar'}
                </button>
              )}
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="modal-body">
            
            {/* FECHA DE POSTULACIÓN */}
            <div className="fecha-postulacion-destacada">
              <Calendar size={18} />
              <span>Postuló: {formatFecha(conductor.fechaRegistro)}</span>
              {tipo === 'aprobado' && conductor.fechaActualizacion && (
                <span className="fecha-aprobado">
                  <CheckCircle size={14} /> Aprobado: {formatFecha(conductor.fechaActualizacion)}
                </span>
              )}
            </div>

            {/* FOTO DE PERFIL */}
            <div className="foto-perfil-section">
              <FotoVisualizador 
                src={conductor.fotos?.perfil} 
                label="Foto de perfil"
                onClick={setSelectedFoto}
              />
            </div>

            {/* DATOS PERSONALES */}
            <h3>Datos personales</h3>
            <div className="campos-grid">
              <CampoInfo 
                icon={User} 
                label="Nombre completo" 
                field="nombreCompleto"
                value={getNestedValue(editMode ? editedData : conductor, 'nombreCompleto')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
              <CampoInfo 
                icon={MapPin} 
                label="Ciudad de operación" 
                field="ciudadOperacion"
                value={getNestedValue(editMode ? editedData : conductor, 'ciudadOperacion')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
              <CampoInfo 
                icon={Phone} 
                label="Teléfono" 
                field="telefono"
                value={getNestedValue(editMode ? editedData : conductor, 'telefono')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
              <CampoInfo 
                icon={CalendarDays} 
                label="Fecha de nacimiento" 
                field="fechaNacimiento"
                value={getNestedValue(editMode ? editedData : conductor, 'fechaNacimiento')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
              <CampoInfo 
                icon={Home} 
                label="Dirección" 
                field="direccion"
                value={getNestedValue(editMode ? editedData : conductor, 'direccion')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
            </div>

            {/* DATOS DEL VEHÍCULO */}
            <h3>Datos del vehículo</h3>
            <div className="campos-grid">
              {/* ✅ MARCA - NUEVO */}
              <CampoInfo 
                icon={Car} 
                label="Marca" 
                field="vehiculo.marca"
                value={getNestedValue(editMode ? editedData : conductor, 'vehiculo.marca')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
              
              {/* ✅ MODELO - NUEVO */}
              <CampoInfo 
                icon={Car} 
                label="Modelo" 
                field="vehiculo.modelo"
                value={getNestedValue(editMode ? editedData : conductor, 'vehiculo.modelo')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
              
              <CampoInfo 
                icon={Hash} 
                label="Año" 
                field="vehiculo.año"
                value={getNestedValue(editMode ? editedData : conductor, 'vehiculo.año')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
              <CampoInfo 
                icon={Palette} 
                label="Color" 
                field="vehiculo.color"
                value={getNestedValue(editMode ? editedData : conductor, 'vehiculo.color')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
              <CampoInfo 
                icon={Hash} 
                label="Placa" 
                field="vehiculo.placa"
                value={getNestedValue(editMode ? editedData : conductor, 'vehiculo.placa')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
              <CampoInfo 
                icon={Wifi} 
                label="Aire acondicionado" 
                field="vehiculo.aireAcondicionado"
                value={getNestedValue(editMode ? editedData : conductor, 'vehiculo.aireAcondicionado')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
            </div>

            {/* FOTOS DEL VEHÍCULO */}
            <h3>Fotos del vehículo</h3>
            <div className="fotos-grid">
              <FotoVisualizador 
                src={conductor.fotos?.vehiculoFrontal} 
                label="Frontal (placa visible)"
                onClick={setSelectedFoto}
              />
              <FotoVisualizador 
                src={conductor.fotos?.vehiculoLateral} 
                label="Lateral"
                onClick={setSelectedFoto}
              />
              <FotoVisualizador 
                src={conductor.fotos?.vehiculoInterior} 
                label="Interior (desde atrás)"
                onClick={setSelectedFoto}
              />
            </div>

            {/* DOCUMENTOS */}
            <h3>Documentos</h3>
            <div className="fotos-grid">
              <FotoVisualizador 
                src={conductor.fotos?.tarjetaPropiedadFrente} 
                label="Tarjeta propiedad (Frente)"
                onClick={setSelectedFoto}
              />
              <FotoVisualizador 
                src={conductor.fotos?.tarjetaPropiedadTrasero} 
                label="Tarjeta propiedad (Trasero)"
                onClick={setSelectedFoto}
              />
              <FotoVisualizador 
                src={conductor.fotos?.breveteFrente} 
                label="Brevete (Frente)"
                onClick={setSelectedFoto}
              />
              <FotoVisualizador 
                src={conductor.fotos?.breveteTrasero} 
                label="Brevete (Trasero)"
                onClick={setSelectedFoto}
              />
              <FotoVisualizador 
                src={conductor.fotos?.soat} 
                label="SOAT (Vigente)"
                onClick={setSelectedFoto}
              />
              <FotoVisualizador 
                src={conductor.fotos?.reciboLuz} 
                label="Recibo de luz/agua"
                onClick={setSelectedFoto}
              />
            </div>

            {/* PREGUNTAS */}
            <h3>Evaluación</h3>
            <div className="preguntas-grid">
              <div className="pregunta-item">
                <div className="pregunta-label">Código de vestimenta</div>
                {editMode && tipo === 'aprobado' ? (
                  <select
                    className="campo-input"
                    value={editedData.codigoVestimenta || ''}
                    onChange={(e) => handleFieldUpdate('codigoVestimenta', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="si">Sí, estoy de acuerdo</option>
                    <option value="no">No, prefiero informal</option>
                    <option value="duda">Tengo dudas</option>
                  </select>
                ) : (
                  <div className="pregunta-valor">{conductor.codigoVestimenta || 'No respondió'}</div>
                )}
              </div>
              <div className="pregunta-item">
                <div className="pregunta-label">Manejo de cliente exigente</div>
                {editMode && tipo === 'aprobado' ? (
                  <textarea
                    className="campo-input"
                    value={editedData.manejoClienteExigente || ''}
                    onChange={(e) => handleFieldUpdate('manejoClienteExigente', e.target.value)}
                    rows="3"
                  />
                ) : (
                  <div className="pregunta-valor">{conductor.manejoClienteExigente || 'No respondió'}</div>
                )}
              </div>
              <div className="pregunta-item">
                <div className="pregunta-label">Significado de Premium</div>
                {editMode && tipo === 'aprobado' ? (
                  <textarea
                    className="campo-input"
                    value={editedData.significadoPremium || ''}
                    onChange={(e) => handleFieldUpdate('significadoPremium', e.target.value)}
                    rows="3"
                  />
                ) : (
                  <div className="pregunta-valor">{conductor.significadoPremium || 'No respondió'}</div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            {tipo === 'aprobado' ? (
              <>
                {!editMode && (
                  <button className="btn-revocar" onClick={handleRevocar}>
                    <RotateCcw size={18} /> Revocar
                  </button>
                )}
                <button className="btn-whatsapp-footer" onClick={handleWhatsApp}>
                  <Phone size={18} /> WhatsApp
                </button>
              </>
            ) : tipo === 'pendiente' && (
              <>
                <button className="btn-rechazar" onClick={handleRechazar}>
                  <XCircle size={18} /> Rechazar
                </button>
                <button className="btn-aprobar" onClick={handleAprobar}>
                  <CheckCircle size={18} /> Aprobar
                </button>
              </>
            )}
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