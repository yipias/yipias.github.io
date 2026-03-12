// src/pages/Admin/reservas/ReservasPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useReservas } from '../../../hooks/admin/useReservas';
import { Calendar, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import ReservasStats from '../../../components/Admin/Reservas/ReservasStats';
import ReservasFiltros from '../../../components/Admin/Reservas/ReservasFiltros';
import ReservasTabla from '../../../components/Admin/Reservas/ReservasTabla';
import './ReservasPage.css';

const ReservasPage = () => {
  const { reservas, conductores, loading, error, actualizarEstado, asignarConductor, getEstadisticas } = useReservas();
  const [usuariosMap, setUsuariosMap] = useState({});
  const [filtros, setFiltros] = useState({
    fechaServicio: '',
    tipoReserva: 'todos',
    busqueda: ''
  });

  // Estados que generan ingreso real
  const estadosValidos = [
    'confirmada', 
    'en camino', 
    'llegó', 
    'en transcurso', 
    'finalizada'
  ];

  // Cargar usuarios para cruzar datos
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../../firebase/config');
        
        const querySnapshot = await getDocs(collection(db, 'usuarios'));
        const map = {};
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.email) {
            map[data.email] = {
              nombreCompleto: data.nombreCompleto,
              telefono: data.telefono,
              dni: data.dni
            };
          }
        });
        setUsuariosMap(map);
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      }
    };
    
    fetchUsuarios();
  }, []);

  // Calcular ingresos en tiempo real (solo estados válidos)
  const ingresosTotales = useMemo(() => {
    return reservas.reduce((total, reserva) => {
      const estado = reserva.estado?.toLowerCase().trim();
      const precio = reserva.precio;
      
      if (estadosValidos.includes(estado) && precio) {
        const valor = parseFloat(precio.toString().replace('S/ ', '').replace(',', '.'));
        if (!isNaN(valor)) return total + valor;
      }
      return total;
    }, 0);
  }, [reservas]); // Se actualiza cuando cambian las reservas

  const ingresosNetos = ingresosTotales * 0.15;

  // ===== FILTRADO =====
  const reservasFiltradas = useMemo(() => {
    return reservas.filter(reserva => {
      const cliente = usuariosMap[reserva.email] || {};
      
      if (filtros.fechaServicio) {
        const fechaReserva = reserva.fechaViaje || reserva.fechaServicio;
        if (fechaReserva !== filtros.fechaServicio) return false;
      }

      if (filtros.tipoReserva !== 'todos' && reserva.tipoReserva !== filtros.tipoReserva) {
        return false;
      }

      if (filtros.busqueda) {
        const texto = filtros.busqueda.toLowerCase().trim();
        
        const nombreReserva = (reserva.nombreCompleto || '').toLowerCase();
        const emailReserva = (reserva.email || '').toLowerCase();
        const telefonoReserva = (reserva.telefono || '').toLowerCase();
        const nombreCliente = (cliente.nombreCompleto || '').toLowerCase();
        const telefonoCliente = (cliente.telefono || '').toLowerCase();
        const dniCliente = (cliente.dni || '').toLowerCase();
        const nombreConductor = (reserva.conductorAsignado?.nombre || '').toLowerCase();

        const coincide =
          nombreReserva.includes(texto) ||
          emailReserva.includes(texto) ||
          telefonoReserva.includes(texto) ||
          nombreCliente.includes(texto) ||
          telefonoCliente.includes(texto) ||
          dniCliente.includes(texto) ||
          nombreConductor.includes(texto);

        if (!coincide) return false;
      }

      return true;
    });
  }, [reservas, filtros, usuariosMap]);

  const handleExportarExcel = () => {
    const datos = reservasFiltradas.map(r => {
      const cliente = usuariosMap[r.email] || {};
      return {
        'Fecha reserva': new Date(r.fechaReserva).toLocaleString('es-PE'),
        'Fecha servicio': r.fechaViaje || r.fechaServicio || '',
        'Hora': r.horaOriginal || r.horaInicio || '',
        'Cliente': cliente.nombreCompleto || r.nombreCompleto || r.email || '',
        'DNI': cliente.dni || '',
        'Teléfono': cliente.telefono || r.telefono || '',
        'Conductor': r.conductorAsignado?.nombre || '',
        'Origen': r.lugarRecojo || '',
        'Destino': r.destino || '',
        'Distancia': r.distancia || '',
        'Pasajeros': r.pasajeros || 1,
        'Precio': r.precio || '',
        'Estado': r.estado || '',
        'Tipo': r.tipoReserva || '',
        'Observaciones': r.observaciones || ''
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
    XLSX.writeFile(wb, `reservas_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Exportado',
      text: `${datos.length} reservas exportadas`,
      timer: 2000,
      background: '#1e1e2e',
      color: '#f1f5f9'
    });
  };

  if (loading) {
    return (
      <div className="reservas-loading">
        <div className="spinner"></div>
        <p>Cargando reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservas-error">
        <p>Error: {error.message}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  const stats = getEstadisticas();

  return (
    <div className="reservas-page">
      <div className="reservas-header">
        <h2><Calendar size={28} style={{ color: '#dc2626', marginRight: '10px' }} /> Gestión de Reservas</h2>
        <button className="btn-exportar" onClick={handleExportarExcel}>
          <Download size={16} />
          Exportar Excel
        </button>
      </div>

      <ReservasStats 
        stats={stats}
        conductoresActivos={conductores.length}
        ingresosTotales={ingresosTotales}
        ingresosNetos={ingresosNetos}
      />

      <ReservasFiltros filtros={filtros} setFiltros={setFiltros} />

      <div className="reservas-total">
        Total: <strong>{reservasFiltradas.length}</strong> reservas
      </div>

      <ReservasTabla
        reservas={reservasFiltradas}
        conductores={conductores}
        onActualizarEstado={actualizarEstado}
        onAsignarConductor={asignarConductor}
      />
    </div>
  );
};

export default ReservasPage;