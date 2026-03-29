// src/hooks/useRegistroConductor.js
import { useState } from 'react';
import { db, storage } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useRegistroConductor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const registrarConductor = async (datos, fotos) => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Crear objeto para almacenar las URLs de las fotos
      const fotosUrls = {};

      // 2. Subir cada foto a Storage y obtener su URL
      for (const [campo, file] of Object.entries(fotos)) {
        if (file) {
          const fileName = `${Date.now()}_${campo}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const storageRef = ref(storage, `conductores/${fileName}`);
          
          await uploadBytes(storageRef, file);
          
          const url = await getDownloadURL(storageRef);
          
          fotosUrls[campo] = url;
        }
      }

      // 3. Separar datos del vehículo del resto
      const { vehiculo, fotos: _fotos, ...restoDatos } = datos;

      // 4. Preparar datos para Firestore
      const conductorData = {
        ...restoDatos,          // incluye dni, nombreCompleto, telefono, etc.
        dni: datos.dni || '',   // ✅ explícito para que quede claro en Firestore
        vehiculo: {
          marca: vehiculo.marca || '',
          modelo: vehiculo.modelo || '',
          año: vehiculo.año || '',
          color: vehiculo.color || '',
          placa: vehiculo.placa || '',
          aireAcondicionado: vehiculo.aireAcondicionado || '',
          aireAcondicionadoOtro: vehiculo.aireAcondicionadoOtro || ''
        },
        fotos: fotosUrls,
        fechaRegistro: serverTimestamp(),
        estado: 'pendiente',
        disponible: false
      };

      // 5. Guardar en Firestore
      const docRef = await addDoc(collection(db, 'conductores'), conductorData);
      
      setSuccess(true);
      setLoading(false);
      return { success: true, id: docRef.id };
      
    } catch (error) {
      console.error('Error al registrar conductor:', error);
      setError('Error al enviar la solicitud. Intenta nuevamente.');
      setLoading(false);
      return { success: false, error };
    }
  };

  return { registrarConductor, loading, error, success };
};