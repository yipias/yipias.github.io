// src/components/Conductores/FormularioConductor.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, Phone, Car, Calendar, MapPin, 
  Upload, CheckCircle, X, Camera, Home, Wifi, Briefcase,
  CalendarDays, Hash, Palette, Save
} from 'lucide-react';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import './FormularioConductor.css';

const DEBOUNCE_TIME = 1000; // 1 segundo

const FormularioConductor = ({ onSubmit, loading }) => {
  // ===== HOOK DE INDEXEDDB =====
  const { 
    guardarTexto,
    guardarFoto,
    cargarTexto,
    cargarTodasLasFotos,
    eliminarFoto,
    limpiarFormulario,
  } = useIndexedDB();

  // ===== ESTADOS =====
  const [formData, setFormData] = useState({
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

  const [uploadingPhotos, setUploadingPhotos] = useState({});
  const [terminos, setTerminos] = useState(false);
  const [comprimiendo, setComprimiendo] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  
  const timeoutRef = useRef(null);
  const fileInputRefs = useRef({});

  const ciudades = ['Lima', 'Tacna', 'Piura', 'Chachapoyas'];
  const opcionesAire = ['Sí', 'No', 'Otros'];

  // ===== CARGAR DATOS GUARDADOS AL INICIAR =====
  useEffect(() => {
    const cargarDatosGuardados = async () => {
      try {
        setCargandoDatos(true);
        
        // 1. Cargar texto
        const textoGuardado = await cargarTexto();
        if (textoGuardado) {
          setFormData(prev => ({
            ...prev,
            ...textoGuardado
          }));
        }

        // 2. Cargar todas las fotos y sus previews
        const { fotos, fotosPreviews } = await cargarTodasLasFotos();
        
        // Actualizar fotos en formData (ahora son Blobs)
        setFormData(prev => ({
          ...prev,
          fotos: {
            ...prev.fotos,
            ...fotos
          }
        }));

        // Actualizar previews
        setFotoPreviews(prev => ({
          ...prev,
          ...fotosPreviews
        }));

        console.log('✅ Datos cargados desde IndexedDB');
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatosGuardados();
  }, []);

  // ===== NOTIFICACIÓN DE GUARDADO =====
  const mostrarNotificacionGuardado = () => {
    setShowSaveNotification(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowSaveNotification(false);
    }, 2000);
  };

  // ===== GUARDAR DATOS EN INDEXEDDB (con debounce) =====
  const guardarDatos = useCallback(async () => {
    try {
      // Guardar solo texto en IndexedDB
      const datosTexto = {
        nombreCompleto: formData.nombreCompleto,
        ciudadOperacion: formData.ciudadOperacion,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        direccion: formData.direccion,
        vehiculo: formData.vehiculo,
        codigoVestimenta: formData.codigoVestimenta,
        manejoClienteExigente: formData.manejoClienteExigente,
        significadoPremium: formData.significadoPremium
      };
      
      await guardarTexto(datosTexto);
      mostrarNotificacionGuardado();
      
    } catch (error) {
      console.error('Error guardando en IndexedDB:', error);
    }
  }, [formData]);

  // Debounce para guardar automáticamente
  useEffect(() => {
    const handler = setTimeout(() => {
      guardarDatos();
    }, DEBOUNCE_TIME);

    return () => {
      clearTimeout(handler);
    };
  }, [formData, guardarDatos]);

  // ===== COMPRESIÓN DE IMÁGENES =====
  const comprimirImagen = useCallback((file) => {
    return new Promise((resolve, reject) => {
      setComprimiendo(true);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1200;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height / width) * MAX_SIZE);
              width = MAX_SIZE;
            } else {
              width = Math.round((width / height) * MAX_SIZE);
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a blob directamente (más confiable)
          canvas.toBlob((blob) => {
            if (blob) {
              // Crear File a partir del blob
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg'
              });
              setComprimiendo(false);
              resolve(compressedFile);
            } else {
              setComprimiendo(false);
              reject(new Error('Error al crear blob'));
            }
          }, 'image/jpeg', 0.8);
        };
        
        img.onerror = () => {
          setComprimiendo(false);
          reject(new Error('Error al cargar la imagen'));
        };
      };
      
      reader.onerror = () => {
        setComprimiendo(false);
        reject(new Error('Error al leer el archivo'));
      };
    });
  }, []);

  // ===== MANEJAR CAMBIO DE FOTOS =====
  const handleFotoChange = async (campo, file) => {
    if (!file) return;

    setUploadingPhotos(prev => ({ ...prev, [campo]: true }));

    const input = fileInputRefs.current[campo];
    if (input) input.disabled = true;

    try {
      // Mostrar preview inmediato
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreviews(prev => ({
          ...prev,
          [campo]: reader.result
        }));
      };
      reader.readAsDataURL(file);

      // Comprimir imagen
      const compressedFile = await comprimirImagen(file);
      
      // Guardar EN INDEXEDDB
      await guardarFoto(campo, compressedFile);
      
      // Actualizar formData con el File comprimido
      setFormData(prev => ({
        ...prev,
        fotos: {
          ...prev.fotos,
          [campo]: compressedFile
        }
      }));

      setTimeout(() => {
        setUploadingPhotos(prev => ({ ...prev, [campo]: false }));
        if (input) input.disabled = false;
      }, 800);

    } catch (error) {
      console.error('Error al procesar imagen:', error);
      alert('Error al procesar la imagen. Intenta con otra.');
      setUploadingPhotos(prev => ({ ...prev, [campo]: false }));
      if (input) input.disabled = false;
    }
  };

  // ===== ELIMINAR FOTO =====
  const removeFoto = async (campo) => {
    // Eliminar de IndexedDB
    await eliminarFoto(campo);
    
    // Eliminar de estados
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
    
    // Limpiar input
    if (fileInputRefs.current[campo]) {
      fileInputRefs.current[campo].value = '';
    }
  };

  // ===== MANEJAR CAMBIO DE INPUTS =====
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

  // ===== ENVIAR FORMULARIO =====
  const handleSubmit = async (e) => {
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

    // ✅ RECONSTRUIR FOTOS COMO FILES ANTES DE ENVIAR
    const fotosParaEnviar = {};
    
    for (const campo of fotosRequeridas) {
      const foto = formData.fotos[campo];
      
      if (foto instanceof File) {
        // Ya es un File, lo usamos directo
        fotosParaEnviar[campo] = foto;
      } else if (foto instanceof Blob) {
        // Es un Blob de IndexedDB, lo convertimos a File con nombre
        const fileName = `${campo}_${Date.now()}.jpg`;
        const file = new File([foto], fileName, { type: 'image/jpeg' });
        fotosParaEnviar[campo] = file;
      }
    }
    
    // Limpiar IndexedDB después de enviar
    await limpiarFormulario();
    
    // Enviar con los Files reconstruidos
    onSubmit(formData, fotosParaEnviar);
  };

  // ===== COMPONENTE FOTO UPLOADER =====
  const FotoUploader = ({ campo, label, required = true }) => {
    const inputRef = (el) => {
      fileInputRefs.current[campo] = el;
    };

    const handleClick = () => {
      if (uploadingPhotos[campo]) return;
      fileInputRefs.current[campo]?.click();
    };

    return (
      <div className="foto-uploader">
        <label>{label} {required && <span className="required">*</span>}</label>
        <div className="foto-input-container">
          {uploadingPhotos[campo] ? (
            <div className="foto-uploading">
              <div className="spinner-small"></div>
              <span>Comprimiendo...</span>
            </div>
          ) : fotoPreviews[campo] ? (
            <div className="foto-preview-wrapper" onClick={handleClick}>
              <img src={fotoPreviews[campo]} alt={label} />
              <div className="foto-status success">
                <CheckCircle size={16} />
              </div>
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
            disabled={uploadingPhotos[campo]}
          />
        </div>
      </div>
    );
  };

  if (cargandoDatos) {
    return (
      <div className="conductor-form-loading">
        <div className="spinner"></div>
        <p>Cargando datos guardados...</p>
      </div>
    );
  }

  return (
    <form className="conductor-form" onSubmit={handleSubmit}>
      {/* NOTIFICACIÓN DE PROGRESO GUARDADO */}
      <div className={`save-notification ${showSaveNotification ? 'visible' : ''}`}>
        <Save size={18} className="save-icon" />
        <span>Progreso guardado</span>
        <CheckCircle size={16} className="check-icon" />
      </div>

      <h2>Únete a YipiAs como conductor</h2>
      <p className="form-subtitle">Completa todos los datos para ser parte de nuestra flota Premium</p>

      {/* Mensaje de compresión */}
      <div className="compression-info">
        <p>Las imágenes se comprimirán automáticamente para optimizar el envío</p>
        {Object.values(uploadingPhotos).some(v => v) && (
          <p className="comprimiendo">Comprimiendo imagen...</p>
        )}
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
      <button type="submit" className="submit-btn" disabled={loading || Object.values(uploadingPhotos).some(v => v)}>
        {loading || Object.values(uploadingPhotos).some(v => v) ? 'Procesando...' : 'Enviar solicitud'}
      </button>
    </form>
  );
};

export default FormularioConductor;