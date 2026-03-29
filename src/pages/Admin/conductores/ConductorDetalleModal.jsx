// src/pages/Admin/conductores/ConductorDetalleModal.jsx
import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { 
  X, Phone, CheckCircle, XCircle, User, Car, 
  Calendar, MapPin, Home, Wifi, Briefcase,
  CalendarDays, Hash, Palette, Camera, RotateCcw, Edit2, Save, CreditCard
} from 'lucide-react';
import { useAdminConductores } from '../../../hooks/useAdminConductores';
import './ConductorDetalleModal.css';

const CampoInfo = memo(({ icon: Icon, label, field, value, editMode, tipo, onUpdate }) => {
  const handleChange = useCallback((e) => {
    onUpdate(field, e.target.value);
  }, [field, onUpdate]);

  return (
    <div className="conductor-detalle-campo">
      <div className="conductor-detalle-campo-label">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      {editMode && tipo === 'aprobado' ? (
        <input
          type="text"
          className="conductor-detalle-input"
          value={value || ''}
          onChange={handleChange}
          placeholder={label}
          autoComplete="off"
        />
      ) : (
        <div className="conductor-detalle-campo-valor">{value || 'No especificado'}</div>
      )}
    </div>
  );
});

const FotoVisualizador = memo(({ src, label, onClick }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className="conductor-detalle-foto-visualizador">
        <label>{label}</label>
        <div className="conductor-detalle-foto-contenedor">
          <div className="conductor-detalle-foto-placeholder">
            <Camera size={24} />
            <span>{error ? 'Error al cargar' : 'Sin imagen'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="conductor-detalle-foto-visualizador">
      <label>{label}</label>
      <div className="conductor-detalle-foto-contenedor" onClick={() => onClick(src)}>
        {loading && <div className="conductor-detalle-foto-loading">Cargando...</div>}
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

const FotoReemplazable = ({ src, label, campo, conductorId, onFotoActualizada }) => {
  const [editando, setEditando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [comprimiendo, setComprimiendo] = useState(false);
  const { actualizarConductor } = useAdminConductores();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(src);

  useEffect(() => {
    setPreview(src);
  }, [src]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(true);
    setComprimiendo(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setComprimiendo(false);
    };
    reader.readAsDataURL(file);

    const fotosNuevas = { [campo]: file };
    const result = await actualizarConductor(conductorId, {}, fotosNuevas);

    if (result.success && result.url) {
      setPreview(result.url);
      onFotoActualizada?.(campo, result.url);
      setEditando(false);
    }
    
    setSubiendo(false);
  };

  return (
    <div className="conductor-detalle-foto-reemplazable">
      <div className="conductor-detalle-foto-visualizador">
        <label>{label}</label>
        <div className="conductor-detalle-foto-contenedor">
          {preview ? (
            <img src={preview} alt={label} />
          ) : (
            <div className="conductor-detalle-foto-placeholder">
              <Camera size={24} />
              <span>Sin imagen</span>
            </div>
          )}
        </div>
      </div>
      
      {editando ? (
        <div className="conductor-detalle-foto-edit-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button 
            className="conductor-detalle-btn-subir"
            onClick={handleClick}
            disabled={subiendo || comprimiendo}
          >
            {comprimiendo ? 'Comprimiendo...' : subiendo ? 'Subiendo...' : 'Seleccionar archivo'}
          </button>
          <button 
            className="conductor-detalle-btn-cancelar"
            onClick={() => {
              setEditando(false);
              setPreview(src);
            }}
            disabled={subiendo || comprimiendo}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button 
          className="conductor-detalle-btn-reemplazar"
          onClick={() => setEditando(true)}
        >
          <Camera size={14} /> Reemplazar
        </button>
      )}
    </div>
  );
};

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
      Object.assign(conductor, editedData);
      setEditMode(false);
    }
  };

  const handleWhatsApp = () => {
    if (conductor.telefono) {
      window.open(`https://wa.me/${conductor.telefono.replace(/\D/g, '')}`, '_blank');
    }
  };

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
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      }
      if (fecha instanceof Date) {
        return fecha.toLocaleDateString('es-PE', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      }
      const date = new Date(fecha);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-PE', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      }
      return 'Fecha no disponible';
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

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
      <div className="conductor-detalle-overlay" onClick={onClose}>
        <div className="conductor-detalle-content" onClick={(e) => e.stopPropagation()}>
          
          <div className="conductor-detalle-header">
            <h2>Detalles del Conductor</h2>
            <div className="conductor-detalle-header-actions">
              {tipo === 'aprobado' && (
                <button 
                  className={`conductor-detalle-edit-btn ${editMode ? 'active' : ''}`}
                  onClick={() => editMode ? handleGuardarCambios() : setEditMode(true)}
                >
                  {editMode ? <Save size={18} /> : <Edit2 size={18} />}
                  {editMode ? 'Guardar' : 'Editar'}
                </button>
              )}
              <button className="conductor-detalle-close" onClick={onClose}>
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="conductor-detalle-body">
            
            <div className="conductor-detalle-fecha">
              <Calendar size={18} />
              <span>Postuló: {formatFecha(conductor.fechaRegistro)}</span>
              {tipo === 'aprobado' && conductor.fechaActualizacion && (
                <span className="conductor-detalle-fecha-aprobado">
                  <CheckCircle size={14} /> Aprobado: {formatFecha(conductor.fechaActualizacion)}
                </span>
              )}
            </div>

            <div className="conductor-detalle-foto-perfil">
              {editMode && tipo === 'aprobado' ? (
                <FotoReemplazable 
                  src={conductor.fotos?.perfil}
                  label="Foto de perfil"
                  campo="perfil"
                  conductorId={conductor.id}
                  onFotoActualizada={(campo, url) => {
                    setEditedData(prev => ({
                      ...prev,
                      fotos: { ...(prev.fotos || {}), [campo]: url }
                    }));
                  }}
                />
              ) : (
                <FotoVisualizador 
                  src={(editMode ? editedData : conductor).fotos?.perfil}
                  label="Foto de perfil"
                  onClick={setSelectedFoto}
                />
              )}
            </div>

            <h3>Datos personales</h3>
            <div className="conductor-detalle-grid">
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
              {/* ✅ NUEVO: DNI */}
              <CampoInfo 
                icon={CreditCard} 
                label="DNI" 
                field="dni"
                value={getNestedValue(editMode ? editedData : conductor, 'dni')}
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

            <h3>Datos del vehículo</h3>
            <div className="conductor-detalle-grid">
              <CampoInfo 
                icon={Car} 
                label="Marca" 
                field="vehiculo.marca"
                value={getNestedValue(editMode ? editedData : conductor, 'vehiculo.marca')}
                editMode={editMode}
                tipo={tipo}
                onUpdate={handleFieldUpdate}
              />
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

            <h3>Fotos del vehículo</h3>
            <div className="conductor-detalle-fotos-grid">
              {['vehiculoFrontal', 'vehiculoLateral', 'vehiculoInterior'].map(campo => (
                <div key={campo}>
                  {editMode && tipo === 'aprobado' ? (
                    <FotoReemplazable 
                      src={conductor.fotos?.[campo]}
                      label={campo === 'vehiculoFrontal' ? 'Frontal (placa visible)' : 
                             campo === 'vehiculoLateral' ? 'Lateral' : 'Interior (desde atrás)'}
                      campo={campo}
                      conductorId={conductor.id}
                      onFotoActualizada={(campo, url) => {
                        setEditedData(prev => ({
                          ...prev,
                          fotos: { ...(prev.fotos || {}), [campo]: url }
                        }));
                      }}
                    />
                  ) : (
                    <FotoVisualizador 
                      src={conductor.fotos?.[campo]} 
                      label={campo === 'vehiculoFrontal' ? 'Frontal (placa visible)' : 
                             campo === 'vehiculoLateral' ? 'Lateral' : 'Interior (desde atrás)'}
                      onClick={setSelectedFoto}
                    />
                  )}
                </div>
              ))}
            </div>

            <h3>Documentos</h3>
            <div className="conductor-detalle-fotos-grid">
              {['tarjetaPropiedadFrente', 'tarjetaPropiedadTrasero', 'breveteFrente', 'breveteTrasero', 'soat', 'reciboLuz'].map(campo => (
                <div key={campo}>
                  {editMode && tipo === 'aprobado' ? (
                    <FotoReemplazable 
                      src={conductor.fotos?.[campo]}
                      label={campo.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      campo={campo}
                      conductorId={conductor.id}
                      onFotoActualizada={(campo, url) => {
                        setEditedData(prev => ({
                          ...prev,
                          fotos: { ...(prev.fotos || {}), [campo]: url }
                        }));
                      }}
                    />
                  ) : (
                    <FotoVisualizador 
                      src={conductor.fotos?.[campo]} 
                      label={campo.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      onClick={setSelectedFoto}
                    />
                  )}
                </div>
              ))}
            </div>

            <h3>Evaluación</h3>
            <div className="conductor-detalle-preguntas-grid">
              <div className="conductor-detalle-pregunta-item">
                <div className="conductor-detalle-pregunta-label">Código de vestimenta</div>
                {editMode && tipo === 'aprobado' ? (
                  <select
                    className="conductor-detalle-input"
                    value={editedData.codigoVestimenta || ''}
                    onChange={(e) => handleFieldUpdate('codigoVestimenta', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="si">Sí, estoy de acuerdo</option>
                    <option value="no">No, prefiero informal</option>
                    <option value="duda">Tengo dudas</option>
                  </select>
                ) : (
                  <div className="conductor-detalle-pregunta-valor">{conductor.codigoVestimenta || 'No respondió'}</div>
                )}
              </div>
              <div className="conductor-detalle-pregunta-item">
                <div className="conductor-detalle-pregunta-label">Manejo de cliente exigente</div>
                {editMode && tipo === 'aprobado' ? (
                  <textarea
                    className="conductor-detalle-input"
                    value={editedData.manejoClienteExigente || ''}
                    onChange={(e) => handleFieldUpdate('manejoClienteExigente', e.target.value)}
                    rows="3"
                  />
                ) : (
                  <div className="conductor-detalle-pregunta-valor">{conductor.manejoClienteExigente || 'No respondió'}</div>
                )}
              </div>
              <div className="conductor-detalle-pregunta-item">
                <div className="conductor-detalle-pregunta-label">Significado de Premium</div>
                {editMode && tipo === 'aprobado' ? (
                  <textarea
                    className="conductor-detalle-input"
                    value={editedData.significadoPremium || ''}
                    onChange={(e) => handleFieldUpdate('significadoPremium', e.target.value)}
                    rows="3"
                  />
                ) : (
                  <div className="conductor-detalle-pregunta-valor">{conductor.significadoPremium || 'No respondió'}</div>
                )}
              </div>
            </div>
          </div>

          <div className="conductor-detalle-footer">
            {tipo === 'aprobado' ? (
              <>
                {!editMode && (
                  <button className="conductor-detalle-btn conductor-detalle-btn-revocar" onClick={handleRevocar}>
                    <RotateCcw size={18} /> Revocar
                  </button>
                )}
                <button className="conductor-detalle-btn conductor-detalle-btn-whatsapp" onClick={handleWhatsApp}>
                  <Phone size={18} /> WhatsApp
                </button>
              </>
            ) : tipo === 'pendiente' && (
              <>
                <button className="conductor-detalle-btn conductor-detalle-btn-rechazar" onClick={handleRechazar}>
                  <XCircle size={18} /> Rechazar
                </button>
                <button className="conductor-detalle-btn conductor-detalle-btn-aprobar" onClick={handleAprobar}>
                  <CheckCircle size={18} /> Aprobar
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {selectedFoto && (
        <div className="conductor-detalle-foto-modal" onClick={() => setSelectedFoto(null)}>
          <div className="conductor-detalle-foto-modal-content">
            <img src={selectedFoto} alt="Foto ampliada" />
            <button className="conductor-detalle-foto-modal-close" onClick={() => setSelectedFoto(null)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ConductorDetalleModal;