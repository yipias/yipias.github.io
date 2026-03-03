// src/components/Conductores/FormularioConductor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Phone, Car, Calendar, MapPin, 
  Upload, CheckCircle, X, Camera, Home, Wifi, Briefcase,
  CalendarDays, Hash, Palette
} from 'lucide-react';
import './FormularioConductor.css';

const STORAGE_KEY = 'yipias_conductor_form';

const FormularioConductor = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error cargando datos guardados:', e);
      }
    }
    return {
      nombreCompleto: '',
      ciudadOperacion: '',
      telefono: '',
      fechaNacimiento: '',
      direccion: '',
      vehiculo: {
        marca: '',
        modelo: '',
        año: '',
        color: '',
        placa: '',
        aireAcondicionado: '',
        aireAcondicionadoOtro: ''
      },
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
      codigoVestimenta: '',
      manejoClienteExigente: '',
      significadoPremium: ''
    };
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
  const [comprimiendo, setComprimiendo] = useState(false);

  const ciudades = ['Lima', 'Tacna', 'Piura', 'Chachapoyas'];
  const opcionesAire = ['Sí', 'No', 'Otros'];

  // Guardar solo datos de texto (sin fotos)
  useEffect(() => {
    const datosParaGuardar = {
      nombreCompleto: formData.nombreCompleto,
      ciudadOperacion: formData.ciudadOperacion,
      telefono: formData.telefono,
      fechaNacimiento: formData.fechaNacimiento,
      direccion: formData.direccion,
      vehiculo: {
        marca: formData.vehiculo.marca,
        modelo: formData.vehiculo.modelo,
        año: formData.vehiculo.año,
        color: formData.vehiculo.color,
        placa: formData.vehiculo.placa,
        aireAcondicionado: formData.vehiculo.aireAcondicionado,
        aireAcondicionadoOtro: formData.vehiculo.aireAcondicionadoOtro
      },
      codigoVestimenta: formData.codigoVestimenta,
      manejoClienteExigente: formData.manejoClienteExigente,
      significadoPremium: formData.significadoPremium
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(datosParaGuardar));
  }, [formData]);

  // Función para comprimir imágenes
  const comprimirImagen = useCallback((file, campo) => {
    return new Promise((resolve) => {
      setComprimiendo(true);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          // Crear canvas
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Redimensionar si es muy grande (máximo 1200px)
          const MAX_SIZE = 1200;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = (height / width) * MAX_SIZE;
              width = MAX_SIZE;
            } else {
              width = (width / height) * MAX_SIZE;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Dibujar imagen redimensionada
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Comprimir a JPEG calidad 0.8 (80%)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          
          // Convertir base64 a File
          fetch(compressedBase64)
            .then(res => res.blob())
            .then(blob => {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg'
              });
              
              setComprimiendo(false);
              resolve(compressedFile);
            });
        };
      };
    });
  }, []);

  const handleFotoChange = async (campo, file) => {
    if (!file) return;

    try {
      // Mostrar preview original mientras se comprime
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreviews(prev => ({
          ...prev,
          [campo]: reader.result
        }));
      };
      reader.readAsDataURL(file);

      // Comprimir imagen en segundo plano
      const compressedFile = await comprimirImagen(file, campo);
      
      // Actualizar formData con la imagen comprimida
      setFormData(prev => ({
        ...prev,
        fotos: {
          ...prev.fotos,
          [campo]: compressedFile
        }
      }));
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      alert('Error al procesar la imagen. Intenta con otra.');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!terminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    
    const fotosRequeridas = [
      'perfil', 'vehiculoFrontal', 'vehiculoLateral', 'vehiculoInterior',
      'tarjetaPropiedadFrente', 'tarjetaPropiedadTrasero', 'breveteFrente',
      'breveteTrasero', 'soat', 'reciboLuz'
    ];
    
    const fotosFaltantes = fotosRequeridas.filter(campo => !formData.fotos[campo]);
    
    if (fotosFaltantes.length > 0) {
      alert(`Faltan las siguientes fotos: ${fotosFaltantes.join(', ')}`);
      return;
    }
    
    sessionStorage.removeItem(STORAGE_KEY);
    
    onSubmit(formData, formData.fotos);
  };

  const FotoUploader = ({ campo, label, required = true }) => {
    const inputRef = React.useRef(null);

    const handleClick = () => {
      inputRef.current?.click();
    };

    return (
      <div className="foto-uploader">
        <label>{label} {required && <span className="required">*</span>}</label>
        <div className="foto-input-container">
          {fotoPreviews[campo] ? (
            <div className="foto-preview-wrapper" onClick={handleClick}>
              <img src={fotoPreviews[campo]} alt={label} />
              <button 
                type="button" 
                className="remove-foto"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFoto(campo);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="foto-upload-placeholder"
              onClick={handleClick}
            >
              <Camera size={24} />
              <span>Subir foto</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            id={`foto-${campo}`}
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFotoChange(campo, e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    );
  };

  return (
    <form className="conductor-form" onSubmit={handleSubmit}>
      <h2>Únete a YipiAs como conductor</h2>
      <p className="form-subtitle">Completa todos los datos para ser parte de nuestra flota Premium</p>

      {/* Mensaje de compresión */}
      <div className="compression-info">
        <p>Las imágenes se comprimirán automáticamente para optimizar el envío</p>
        {comprimiendo && <p className="comprimiendo">Comprimiendo imagen...</p>}
      </div>

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
        {/* MARCA */}
        <div className="input-group">
          <Car size={18} className="input-icon" />
          <input
            type="text"
            name="vehiculo.marca"
            value={formData.vehiculo.marca}
            onChange={handleChange}
            placeholder="Marca"
            required
          />
        </div>

        {/* MODELO */}
        <div className="input-group">
          <Car size={18} className="input-icon" />
          <input
            type="text"
            name="vehiculo.modelo"
            value={formData.vehiculo.modelo}
            onChange={handleChange}
            placeholder="Modelo"
            required
          />
        </div>

        {/* AÑO */}
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

        {/* COLOR */}
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

        {/* PLACA */}
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

        {/* AIRE ACONDICIONADO */}
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
      <button type="submit" className="submit-btn" disabled={loading || comprimiendo}>
        {loading || comprimiendo ? 'Procesando...' : 'Enviar solicitud'}
      </button>
    </form>
  );
};

export default FormularioConductor;