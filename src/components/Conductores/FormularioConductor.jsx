// src/components/Conductores/FormularioConductor.jsx
import React, { useState } from 'react';
import { 
  User, Phone, Car, Calendar, MapPin, 
  Upload, CheckCircle, X, Camera, Home, Wifi, Briefcase,
  CalendarDays, Hash, Palette
} from 'lucide-react';
import './FormularioConductor.css';

const FormularioConductor = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    // Datos personales
    nombreCompleto: '',
    ciudadOperacion: '',
    telefono: '',
    fechaNacimiento: '',
    direccion: '',
    
    // Datos del vehículo
    vehiculo: {
      año: '',
      color: '',
      placa: '',
      aireAcondicionado: '',
      aireAcondicionadoOtro: ''
    },
    
    // Documentos (fotos)
    fotos: {
      perfil: null,
      vehiculoFrontal: null,
      vehiculoLateral: null,
      vehiculoInterior: null,
      tarjetaPropiedadFrente: null,
      tarjetaPropiedadTrasero: null,
      breveteFrente: null,
      breveteTrasero: null,
      soat: null,
      reciboLuz: null
    },
    
    // Preguntas
    codigoVestimenta: '',
    manejoClienteExigente: '',
    significadoPremium: ''
  });

  const [fotoPreviews, setFotoPreviews] = useState({
    perfil: '',
    vehiculoFrontal: '',
    vehiculoLateral: '',
    vehiculoInterior: '',
    tarjetaPropiedadFrente: '',
    tarjetaPropiedadTrasero: '',
    breveteFrente: '',
    breveteTrasero: '',
    soat: '',
    reciboLuz: ''
  });

  const [terminos, setTerminos] = useState(false);

  const ciudades = ['Lima', 'Tacna', 'Piura', 'Chachapoyas'];
  const opcionesAire = ['Sí', 'No', 'Otros'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFotoChange = (campo, file) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        fotos: {
          ...prev.fotos,
          [campo]: file
        }
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreviews(prev => ({
          ...prev,
          [campo]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = (campo) => {
    setFormData(prev => ({
      ...prev,
      fotos: {
        ...prev.fotos,
        [campo]: null
      }
    }));
    setFotoPreviews(prev => ({
      ...prev,
      [campo]: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!terminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    
    // Verificar que todas las fotos requeridas estén presentes
    const fotosRequeridas = [
      'perfil', 'vehiculoFrontal', 'vehiculoLateral', 'vehiculoInterior',
      'tarjetaPropiedadFrente', 'tarjetaPropiedadTrasero', 'breveteFrente',
      'breveteTrasero', 'soat', 'reciboLuz'
    ];
    
    const fotosFaltantes = [];
    for (let campo of fotosRequeridas) {
      if (!formData.fotos[campo]) {
        fotosFaltantes.push(campo);
      }
    }
    
    if (fotosFaltantes.length > 0) {
      alert(`Faltan las siguientes fotos: ${fotosFaltantes.join(', ')}`);
      return;
    }
    
    // Enviar datos al hook
    onSubmit(formData, formData.fotos);
  };

  const FotoUploader = ({ campo, label, required = true }) => (
    <div className="foto-uploader">
      <label>{label} {required && <span className="required">*</span>}</label>
      <div className="foto-input-container">
        {fotoPreviews[campo] ? (
          <div className="foto-preview-wrapper">
            <img src={fotoPreviews[campo]} alt={label} />
            <button 
              type="button" 
              className="remove-foto"
              onClick={() => removeFoto(campo)}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div 
            className="foto-upload-placeholder"
            onClick={() => document.getElementById(`foto-${campo}`).click()}
          >
            <Camera size={24} />
            <span>Subir foto</span>
          </div>
        )}
        <input
          type="file"
          id={`foto-${campo}`}
          accept="image/*"
          onChange={(e) => handleFotoChange(campo, e.target.files[0])}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );

  return (
    <form className="conductor-form" onSubmit={handleSubmit}>
      <h2>Únete a YipiAs como conductor</h2>
      <p className="form-subtitle">Completa todos los datos para ser parte de nuestra flota Premium</p>

      {/* ===== FOTO DE PERFIL ===== */}
      <div className="foto-perfil-section">
        <FotoUploader campo="perfil" label="Foto de perfil" />
      </div>

      {/* ===== DATOS PERSONALES ===== */}
      <h3>Datos personales</h3>
      <div className="form-grid">
        <div className="input-group">
          <User size={18} className="input-icon" />
          <input
            type="text"
            name="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={handleChange}
            placeholder="Nombres y apellidos"
            required
          />
        </div>

        <div className="input-group">
          <MapPin size={18} className="input-icon" />
          <select
            name="ciudadOperacion"
            value={formData.ciudadOperacion}
            onChange={handleChange}
            required
          >
            <option value="">Ciudad de operación</option>
            {ciudades.map(ciudad => (
              <option key={ciudad} value={ciudad}>{ciudad}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <Phone size={18} className="input-icon" />
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Número de celular"
            required
          />
        </div>

        <div className="input-group">
          <CalendarDays size={18} className="input-icon" />
          <input
            type="text"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            placeholder="DD/MM/AAAA"
            required
          />
        </div>

        <div className="input-group full-width">
          <Home size={18} className="input-icon" />
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Dirección con referencia"
            required
          />
        </div>
      </div>

      {/* ===== DATOS DEL VEHÍCULO ===== */}
      <h3>Datos del vehículo</h3>
      <div className="form-grid">
        <div className="input-group">
          <Hash size={18} className="input-icon" />
          <input
            type="text"
            name="vehiculo.año"
            value={formData.vehiculo.año}
            onChange={handleChange}
            placeholder="Año"
            required
          />
        </div>

        <div className="input-group">
          <Palette size={18} className="input-icon" />
          <input
            type="text"
            name="vehiculo.color"
            value={formData.vehiculo.color}
            onChange={handleChange}
            placeholder="Color"
            required
          />
        </div>

        <div className="input-group">
          <Hash size={18} className="input-icon" />
          <input
            type="text"
            name="vehiculo.placa"
            value={formData.vehiculo.placa}
            onChange={handleChange}
            placeholder="Placa"
            required
          />
        </div>

        <div className="input-group">
          <Wifi size={18} className="input-icon" />
          <select
            name="vehiculo.aireAcondicionado"
            value={formData.vehiculo.aireAcondicionado}
            onChange={handleChange}
            required
          >
            <option value="">¿Aire acondicionado?</option>
            {opcionesAire.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        {formData.vehiculo.aireAcondicionado === 'Otros' && (
          <div className="input-group full-width">
            <input
              type="text"
              name="vehiculo.aireAcondicionadoOtro"
              value={formData.vehiculo.aireAcondicionadoOtro}
              onChange={handleChange}
              placeholder="Especificar"
              required
            />
          </div>
        )}
      </div>

      {/* ===== FOTOS DEL VEHÍCULO ===== */}
      <h3>Fotos del vehículo</h3>
      <div className="fotos-grid">
        <FotoUploader campo="vehiculoFrontal" label="Frontal (placa visible)" />
        <FotoUploader campo="vehiculoLateral" label="Lateral" />
        <FotoUploader campo="vehiculoInterior" label="Interior (desde atrás)" />
      </div>

      {/* ===== DOCUMENTOS ===== */}
      <h3>Documentos</h3>
      <div className="fotos-grid">
        <FotoUploader campo="tarjetaPropiedadFrente" label="Tarjeta propiedad (Frente)" />
        <FotoUploader campo="tarjetaPropiedadTrasero" label="Tarjeta propiedad (Trasero)" />
        <FotoUploader campo="breveteFrente" label="Brevete (Frente)" />
        <FotoUploader campo="breveteTrasero" label="Brevete (Trasero)" />
        <FotoUploader campo="soat" label="SOAT (Vigente)" />
        <FotoUploader campo="reciboLuz" label="Recibo de luz/agua" />
      </div>

      {/* ===== PREGUNTAS ===== */}
      <h3>Preguntas</h3>
      <div className="form-grid">
        <div className="input-group full-width">
          <Briefcase size={18} className="input-icon" />
          <select
            name="codigoVestimenta"
            value={formData.codigoVestimenta}
            onChange={handleChange}
            required
          >
            <option value="">¿Cumplirías código de vestimenta formal?</option>
            <option value="si">Sí, estoy de acuerdo</option>
            <option value="no">No, prefiero informal</option>
            <option value="duda">Tengo dudas</option>
          </select>
        </div>

        <div className="input-group full-width">
          <textarea
            name="manejoClienteExigente"
            value={formData.manejoClienteExigente}
            onChange={handleChange}
            placeholder="¿Cómo manejarías a un cliente exigente?"
            rows="2"
            required
          />
        </div>

        <div className="input-group full-width">
          <textarea
            name="significadoPremium"
            value={formData.significadoPremium}
            onChange={handleChange}
            placeholder="¿Qué significa para ti un servicio premium?"
            rows="2"
            required
          />
        </div>
      </div>

      {/* Términos */}
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={terminos}
          onChange={(e) => setTerminos(e.target.checked)}
        />
        <CheckCircle size={16} className={`checkbox-icon ${terminos ? 'checked' : ''}`} />
        <span>Confirmo que la información es verídica</span>
      </label>

      {/* Botón */}
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  );
};

export default FormularioConductor;