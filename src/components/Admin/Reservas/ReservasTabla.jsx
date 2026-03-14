// src/components/Admin/Reservas/ReservasTabla.jsx
import React, { useState, useEffect } from 'react';
import { Eye, Car, Phone } from 'lucide-react';
import AsignarConductorDropdown from './AsignarConductorDropdown';
import EstadoDropdown from './EstadoDropdown';
import ModalCliente from './ModalCliente';
import ModalConductor from './ModalConductor';
import './ReservasTabla.css';

const ReservasTabla = ({ reservas, conductores, onActualizarEstado, onAsignarConductor }) => {
  const [modalCliente, setModalCliente] = useState(null);
  const [modalConductor, setModalConductor] = useState(null);
  const [usuariosMap, setUsuariosMap] = useState({});

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

  const reservasOrdenadas = [...reservas].sort((a, b) => {
    const estadoA = a.estado || 'pendiente';
    const estadoB = b.estado || 'pendiente';
    
    const getPrioridad = (estado) => {
      if (estado === 'cancelada') return 2;
      if (estado === 'finalizada') return 1;
      return 0;
    };
    
    const prioridadA = getPrioridad(estadoA);
    const prioridadB = getPrioridad(estadoB);
    
    if (prioridadA !== prioridadB) return prioridadA - prioridadB;
    
    const fechaA = a.fechaViaje || a.fechaServicio || '9999-99-99';
    const fechaB = b.fechaViaje || b.fechaServicio || '9999-99-99';
    return fechaA.localeCompare(fechaB);
  });

  const formatFechaServicio = (reserva) => {
    const fechaServicio = reserva.fechaViaje || reserva.fechaServicio;
    if (fechaServicio) {
      const [year, month, day] = fechaServicio.split('-');
      return `${day}/${month}/${year}`;
    }
    return '—';
  };

  const formatHoraServicio = (reserva) => {
    return reserva.horaOriginal || reserva.horaInicio || '—';
  };

  const getClienteData = (reserva) => {
    if (reserva.nombreCompleto || reserva.telefono || reserva.dni) {
      return {
        nombre: reserva.nombreCompleto || reserva.email || '—',
        telefono: reserva.telefono || '—',
        dni: reserva.dni || '—'
      };
    }
    const usuario = usuariosMap[reserva.email];
    return {
      nombre: usuario?.nombreCompleto || reserva.email || '—',
      telefono: usuario?.telefono || '—',
      dni: usuario?.dni || '—'
    };
  };

  const handleWhatsApp = (telefono) => {
    if (telefono && telefono !== '—') {
      window.open(`https://wa.me/${telefono.replace(/\D/g, '')}`, '_blank');
    }
  };

  return (
    <div className="reservas-tabla-container">
      <table className="reservas-tabla">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha / Hora</th>
            <th>Cliente</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Conductor</th>
            <th>Estado</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {reservasOrdenadas.map((reserva, index) => {
            const cliente = getClienteData(reserva);
            return (
              <tr key={reserva.id}>
                <td className="numero-cell">{index + 1}</td>
                
                <td>
                  <div className="fecha-servicio-cell">
                    <span className="fecha-dia">{formatFechaServicio(reserva)}</span>
                    <span className="fecha-hora">{formatHoraServicio(reserva)}</span>
                  </div>
                </td>
                
                {/* Cliente con botones */}
                <td>
                  <div className="cliente-info">
                    <strong title={cliente.nombre}>{cliente.nombre}</strong>
                    <div className="cliente-buttons">
                      <button 
                        className="rt-btn-icono rt-btn-ver-cliente"
                        onClick={() => setModalCliente(reserva)}
                        title="Ver detalles del servicio"
                      >
                        <Eye size={14} />
                      </button>
                      {cliente.telefono !== '—' && (
                        <button 
                          className="rt-btn-icono rt-btn-wp-cliente"
                          onClick={() => handleWhatsApp(cliente.telefono)}
                          title="WhatsApp del cliente"
                        >
                          <Phone size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="dni-cell">{cliente.dni}</td>
                <td className="telefono-cell">{cliente.telefono}</td>
                
                {/* Conductor con botones */}
                <td>
                  <div className="conductor-cell">
                    <AsignarConductorDropdown 
                      reserva={reserva}
                      conductores={conductores}
                      onAsignar={onAsignarConductor}
                    />
                    {reserva.conductorAsignado && (
                      <>
                        <button 
                          className="rt-btn-icono rt-btn-ver-conductor"
                          onClick={() => setModalConductor(reserva)}
                          title="Ver datos del conductor"
                        >
                          <Car size={14} />
                        </button>
                        {reserva.conductorAsignado.telefono && (
                          <button 
                            className="rt-btn-icono rt-btn-wp-conductor"
                            onClick={() => handleWhatsApp(reserva.conductorAsignado.telefono)}
                            title="WhatsApp del conductor"
                          >
                            <Phone size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
                
                <td>
                  <EstadoDropdown 
                    reserva={reserva}
                    onCambiarEstado={onActualizarEstado}
                  />
                </td>
                
                <td className="precio-cell">{reserva.precio || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modalCliente && (
        <ModalCliente 
          reserva={modalCliente}
          onClose={() => setModalCliente(null)}
        />
      )}

      {modalConductor && (
        <ModalConductor 
          reserva={modalConductor}
          onClose={() => setModalConductor(null)}
        />
      )}
    </div>
  );
};

export default ReservasTabla;