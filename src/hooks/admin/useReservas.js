// src/hooks/admin/useReservas.js
import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';

export const useReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados que generan ingreso real
  const estadosValidos = [
    'confirmada', 
    'en camino', 
    'llegó', 
    'en transcurso', 
    'finalizada'
  ];

  // Cargar reservas
  useEffect(() => {
    const q = query(collection(db, 'reservas'), orderBy('fechaReserva', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaReserva: doc.data().fechaReserva?.toDate?.() || new Date(doc.data().fechaReserva)
      }));
      setReservas(reservasData);
      setLoading(false);
    }, (err) => {
      console.error('Error cargando reservas:', err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cargar conductores aprobados
  useEffect(() => {
    const q = query(
      collection(db, 'conductores'),
      where('estado', '==', 'aprobado')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conductoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaRegistro: doc.data().fechaRegistro?.toDate?.() || new Date()
      }));
      setConductores(conductoresData);
    });

    return () => unsubscribe();
  }, []);

  // Actualizar estado de reserva
  const actualizarEstado = async (reservaId, nuevoEstado) => {
    try {
      const reservaRef = doc(db, 'reservas', reservaId);
      await updateDoc(reservaRef, { estado: nuevoEstado });
      return { success: true };
    } catch (error) {
      console.error('Error actualizando estado:', error);
      return { success: false, error };
    }
  };

  // Asignar o quitar conductor de una reserva
  const asignarConductor = async (reservaId, conductorId) => {
    try {
      const reservaRef = doc(db, 'reservas', reservaId);
      
      // Si conductorId es null, quitamos el conductor
      if (conductorId === null) {
        await updateDoc(reservaRef, {
          conductorAsignado: null,
        });
        return { success: true };
      }

      // Si hay conductorId, asignamos el conductor
      const conductor = conductores.find(c => c.id === conductorId);
      
      if (!conductor) {
        console.error('Conductor no encontrado');
        return { success: false, error: 'Conductor no encontrado' };
      }

      await updateDoc(reservaRef, {
        conductorAsignado: {
          id: conductorId,
          nombre: conductor.nombreCompleto,
          telefono: conductor.telefono,
          vehiculo: {
            marca: conductor.vehiculo?.marca,
            modelo: conductor.vehiculo?.modelo,
            color: conductor.vehiculo?.color,
            placa: conductor.vehiculo?.placa,
            año: conductor.vehiculo?.año
          },
          fotos: {
            perfil: conductor.fotos?.perfil,
            vehiculoFrontal: conductor.fotos?.vehiculoFrontal
          }
        },
        estado: 'confirmada'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error asignando conductor:', error);
      return { success: false, error };
    }
  };

  // Calcular ingresos totales (solo estados válidos)
  const calcularIngresos = () => {
    return reservas.reduce((total, r) => {
      const estado = r.estado?.toLowerCase().trim();
      const precio = r.precio;
      
      if (estadosValidos.includes(estado) && precio) {
        const valor = parseFloat(precio.toString().replace('S/ ', '').replace(',', '.'));
        if (!isNaN(valor)) return total + valor;
      }
      return total;
    }, 0);
  };

  // Obtener estadísticas
  const getEstadisticas = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const reservasHoy = reservas.filter(r => {
      const fecha = new Date(r.fechaReserva);
      return fecha >= hoy && fecha < manana;
    });

    const canceladasHoy = reservasHoy.filter(r => r.estado === 'cancelada').length;

    const ingresosTotales = calcularIngresos();

    const conductoresDisponibles = conductores.length;

    const estadosEnServicio = ['confirmada', 'en camino', 'llegó', 'en transcurso'];
    const conductoresEnServicio = reservas.filter(r =>
      estadosEnServicio.includes(r.estado)
    ).length;

    return {
      conductoresDisponibles,
      conductoresEnServicio,
      reservasHoy: reservasHoy.length,
      canceladasHoy,
      ingresosTotales,
      ingresosNetos: ingresosTotales * 0.15,
      totalReservas: reservas.length
    };
  };

  return {
    reservas,
    conductores,
    loading,
    error,
    actualizarEstado,
    asignarConductor,
    getEstadisticas,
    calcularIngresos // Exportamos también esta función
  };
};