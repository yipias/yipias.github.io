// src/hooks/useAdminConductores.js
import { useState, useEffect } from 'react';
import { db, storage } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useAdminConductores = () => {
  const [conductores, setConductores] = useState({
    pendientes: [],
    aprobados: [],
    rechazados: []
  });
  const [loading, setLoading] = useState(true);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    const conductoresRef = collection(db, 'conductores');
    const q = query(conductoresRef, orderBy('fechaRegistro', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendientes = [];
      const aprobados = [];
      const rechazados = [];

      snapshot.docs.forEach(doc => {
        const data = {
          id: doc.id,
          ...doc.data(),
          fechaRegistro: doc.data().fechaRegistro?.toDate() || new Date()
        };

        switch(data.estado) {
          case 'pendiente':
            pendientes.push(data);
            break;
          case 'aprobado':
            aprobados.push(data);
            break;
          case 'rechazado':
            rechazados.push(data);
            break;
          default:
            pendientes.push(data);
        }
      });

      setConductores({ pendientes, aprobados, rechazados });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ===== GENERAR CÓDIGO YPP CORRELATIVO =====
  const generarCodigoYPP = async () => {
    const conductoresRef = collection(db, 'conductores');
    const snapshot = await getDocs(conductoresRef);

    let maxNumero = 100; // Empieza desde YPP101

    snapshot.docs.forEach(doc => {
      const codigo = doc.data().codigoYPP;
      if (codigo) {
        const numero = parseInt(codigo.replace('YPP', ''), 10);
        if (!isNaN(numero) && numero > maxNumero) {
          maxNumero = numero;
        }
      }
    });

    return `YPP${maxNumero + 1}`;
  };

  const aprobarConductor = async (conductorId) => {
    try {
      const conductorRef = doc(db, 'conductores', conductorId);
      const codigoYPP = await generarCodigoYPP();

      await updateDoc(conductorRef, {
        estado: 'aprobado',
        codigoYPP: codigoYPP,
        fechaActualizacion: new Date()
      });
      return { success: true, codigoYPP };
    } catch (error) {
      console.error('Error al aprobar conductor:', error);
      return { success: false, error };
    }
  };

  const rechazarConductor = async (conductorId) => {
    try {
      const conductorRef = doc(db, 'conductores', conductorId);
      await updateDoc(conductorRef, {
        estado: 'rechazado',
        codigoYPP: null,
        fechaActualizacion: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error al rechazar conductor:', error);
      return { success: false, error };
    }
  };

  const revocarConductor = async (conductorId) => {
    try {
      const conductorRef = doc(db, 'conductores', conductorId);
      await updateDoc(conductorRef, {
        estado: 'pendiente',
        codigoYPP: null,
        fechaActualizacion: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error al revocar conductor:', error);
      return { success: false, error };
    }
  };

  // ===== COMPRIMIR IMAGEN =====
  const comprimirImagenAdmin = (file) => {
    return new Promise((resolve, reject) => {
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

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg'
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error al crear blob'));
            }
          }, 'image/jpeg', 0.8);
        };

        img.onerror = () => reject(new Error('Error al cargar la imagen'));
      };

      reader.onerror = () => reject(new Error('Error al leer el archivo'));
    });
  };

  // ===== SUBIR FOTO A STORAGE =====
  const subirFoto = async (conductorId, campo, file) => {
    if (!file) return { success: false, error: 'No se proporcionó archivo' };

    setSubiendoFoto(true);

    try {
      const compressedFile = await comprimirImagenAdmin(file);

      const fileName = `${Date.now()}_${campo}_${compressedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `conductores/${conductorId}/${fileName}`);

      await uploadBytes(storageRef, compressedFile);
      const url = await getDownloadURL(storageRef);

      setSubiendoFoto(false);
      return { success: true, url };
    } catch (error) {
      console.error('Error al subir foto:', error);
      setSubiendoFoto(false);
      return { success: false, error };
    }
  };

  // ===== ACTUALIZAR CONDUCTOR =====
  const actualizarConductor = async (conductorId, nuevosDatos, fotosNuevas = {}) => {
    try {
      let ultimaUrl = null;

      const conductorRef = doc(db, 'conductores', conductorId);
      const conductorSnapshot = await getDoc(conductorRef);
      const conductorActual = conductorSnapshot.data();

      const fotosActualizadas = { ...(conductorActual?.fotos || {}) };

      for (const [campo, file] of Object.entries(fotosNuevas)) {
        if (file) {
          const result = await subirFoto(conductorId, campo, file);
          if (result.success) {
            fotosActualizadas[campo] = result.url;
            ultimaUrl = result.url;
          }
        }
      }

      const { id, fechaRegistro, fotos, ...datosParaActualizar } = nuevosDatos;

      await updateDoc(conductorRef, {
        ...datosParaActualizar,
        fotos: fotosActualizadas,
        fechaActualizacion: new Date()
      });

      return { success: true, url: ultimaUrl };
    } catch (error) {
      console.error('Error al actualizar conductor:', error);
      return { success: false, error };
    }
  };

  return {
    conductores,
    loading,
    subiendoFoto,
    aprobarConductor,
    rechazarConductor,
    revocarConductor,
    actualizarConductor
  };
};