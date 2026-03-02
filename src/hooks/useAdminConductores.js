// src/hooks/useAdminConductores.js
import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export const useAdminConductores = () => {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const conductoresRef = collection(db, 'conductores');
    const q = query(
      conductoresRef, 
      where('estado', '==', 'pendiente'),
      orderBy('fechaRegistro', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendientes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaRegistro: doc.data().fechaRegistro?.toDate() || new Date()
      }));

      setConductores(pendientes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ===== FUNCIONES PARA ACTUALIZAR ESTADO =====
  const aprobarConductor = async (conductorId) => {
    try {
      const conductorRef = doc(db, 'conductores', conductorId);
      await updateDoc(conductorRef, {
        estado: 'aprobado',
        fechaActualizacion: new Date()
      });
      return { success: true };
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
        fechaActualizacion: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error al rechazar conductor:', error);
      return { success: false, error };
    }
  };

  return { 
    conductores, 
    loading,
    aprobarConductor,
    rechazarConductor 
  };
};