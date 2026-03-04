// src/hooks/useIndexedDB.js
import { useCallback } from 'react';

const DB_NAME = 'YipiAsDB';
const DB_VERSION = 1;
const STORE_NAME = 'conductorForm';

export const useIndexedDB = () => {
  // ===== ABRIR CONEXIÓN A INDEXEDDB =====
  const abrirDB = useCallback(() => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.error('Error abriendo IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Crear store si no existe
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Store con keyPath 'id' para acceso directo
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          
          // Índices para búsquedas más rápidas
          store.createIndex('tipo', 'tipo', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('campo', 'campo', { unique: false });
          
          console.log('✅ Store creado en IndexedDB');
        }
      };
    });
  }, []);

  // ===== GUARDAR DATOS DE TEXTO =====
  const guardarTexto = useCallback(async (datosTexto) => {
    try {
      const db = await abrirDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Guardar con ID fijo para texto
        const textoData = {
          id: 'formulario_texto',
          tipo: 'texto',
          ...datosTexto,
          timestamp: Date.now()
        };
        
        const request = store.put(textoData);
        
        request.onsuccess = () => {
          console.log('✅ Texto guardado en IndexedDB');
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Error guardando texto:', request.error);
          reject(request.error);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error en guardarTexto:', error);
      return false;
    }
  }, [abrirDB]);

  // ===== GUARDAR UNA FOTO =====
  const guardarFoto = useCallback(async (campo, file) => {
    if (!file) return false;
    
    try {
      const db = await abrirDB();
      
      return new Promise((resolve, reject) => {
        // Leer el archivo como ArrayBuffer
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
          
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          
          // Guardar foto con ID = 'foto_[campo]'
          const fotoData = {
            id: `foto_${campo}`,
            tipo: 'foto',
            campo: campo,
            data: arrayBuffer,        // Los datos binarios
            type: file.type || 'image/jpeg', // Aseguramos tipo MIME
            name: file.name || `${campo}.jpg`,
            timestamp: Date.now()
          };
          
          const request = store.put(fotoData);
          
          request.onsuccess = () => {
            console.log(`✅ Foto guardada en IndexedDB: ${campo}`);
            resolve(true);
          };
          
          request.onerror = () => {
            console.error('Error guardando foto:', request.error);
            reject(request.error);
          };
          
          transaction.oncomplete = () => {
            db.close();
          };
        };
        
        reader.onerror = () => {
          console.error('Error leyendo archivo:', reader.error);
          reject(reader.error);
        };
        
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error('Error en guardarFoto:', error);
      return false;
    }
  }, [abrirDB]);

  // ===== RECUPERAR DATOS DE TEXTO =====
  const cargarTexto = useCallback(async () => {
    try {
      const db = await abrirDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.get('formulario_texto');
        
        request.onsuccess = () => {
          if (request.result) {
            // Eliminar propiedades internas antes de devolver
            const { id, tipo, timestamp, ...datosTexto } = request.result;
            resolve(datosTexto);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => {
          console.error('Error cargando texto:', request.error);
          reject(request.error);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error en cargarTexto:', error);
      return null;
    }
  }, [abrirDB]);

  // ===== RECUPERAR UNA FOTO =====
  const cargarFoto = useCallback(async (campo) => {
    try {
      const db = await abrirDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.get(`foto_${campo}`);
        
        request.onsuccess = () => {
          if (request.result && request.result.data) {
            // Convertir ArrayBuffer a Blob con el tipo correcto
            const blob = new Blob([request.result.data], { type: request.result.type || 'image/jpeg' });
            // Crear URL para preview
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => {
          console.error('Error cargando foto:', request.error);
          reject(request.error);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error en cargarFoto:', error);
      return null;
    }
  }, [abrirDB]);

  // ===== RECUPERAR TODAS LAS FOTOS =====
  const cargarTodasLasFotos = useCallback(async () => {
    try {
      const db = await abrirDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        // Usar índice para buscar solo fotos
        const index = store.index('tipo');
        const request = index.getAll('foto');
        
        request.onsuccess = () => {
          const fotos = {};
          const fotosPreviews = {};
          
          request.result.forEach(item => {
            if (item.data) {
              // Guardar el Blob completo para enviar después
              const blob = new Blob([item.data], { type: item.type || 'image/jpeg' });
              fotos[item.campo] = blob;  // Guardamos el Blob, no el item
              
              // Crear URL para preview
              const url = URL.createObjectURL(blob);
              fotosPreviews[item.campo] = url;
            }
          });
          
          resolve({ fotos, fotosPreviews });
        };
        
        request.onerror = () => {
          console.error('Error cargando fotos:', request.error);
          reject(request.error);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error en cargarTodasLasFotos:', error);
      return { fotos: {}, fotosPreviews: {} };
    }
  }, [abrirDB]);

  // ===== RECUPERAR FORMULARIO COMPLETO =====
  const cargarFormulario = useCallback(async () => {
    try {
      const [datosTexto, { fotos, fotosPreviews }] = await Promise.all([
        cargarTexto(),
        cargarTodasLasFotos()
      ]);
      
      return {
        datosTexto: datosTexto || {},
        fotos,           // Blobs para enviar a Firebase
        fotosPreviews    // URLs para mostrar en pantalla
      };
    } catch (error) {
      console.error('Error cargando formulario:', error);
      return {
        datosTexto: {},
        fotos: {},
        fotosPreviews: {}
      };
    }
  }, [cargarTexto, cargarTodasLasFotos]);

  // ===== ELIMINAR UNA FOTO =====
  const eliminarFoto = useCallback(async (campo) => {
    try {
      const db = await abrirDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.delete(`foto_${campo}`);
        
        request.onsuccess = () => {
          console.log(`🗑️ Foto eliminada: ${campo}`);
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Error eliminando foto:', request.error);
          reject(request.error);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error en eliminarFoto:', error);
      return false;
    }
  }, [abrirDB]);

  // ===== LIMPIAR TODO EL FORMULARIO =====
  const limpiarFormulario = useCallback(async () => {
    try {
      const db = await abrirDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log('🧹 Formulario limpiado de IndexedDB');
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Error limpiando formulario:', request.error);
          reject(request.error);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error en limpiarFormulario:', error);
      return false;
    }
  }, [abrirDB]);

  // ===== VERIFICAR SI HAY DATOS GUARDADOS =====
  const hayDatosGuardados = useCallback(async () => {
    try {
      const db = await abrirDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.count();
        
        request.onsuccess = () => {
          resolve(request.result > 0);
        };
        
        request.onerror = () => {
          console.error('Error verificando datos:', request.error);
          reject(request.error);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Error en hayDatosGuardados:', error);
      return false;
    }
  }, [abrirDB]);

  return {
    guardarTexto,
    guardarFoto,
    cargarTexto,
    cargarFoto,
    cargarTodasLasFotos,
    cargarFormulario,
    eliminarFoto,
    limpiarFormulario,
    hayDatosGuardados
  };
};