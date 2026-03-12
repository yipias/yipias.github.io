// src/components/Reservas/TarjetaReserva.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Clock, Users, DollarSign, Car,
  CheckCircle, XCircle, Clock as ClockIcon, Map, Phone
} from 'lucide-react';
import PagoModal from './PagoModal';
import './TarjetaReserva.css';

const TarjetaReserva = ({ reserva }) => {
  const mapRef = useRef(null);
  const [mapaListo, setMapaListo] = useState(false);
  const [mostrarConductor, setMostrarConductor] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const estado = reserva.estado || 'pendiente';

  // ===== MAPA =====
  useEffect(() => {
    if (!reserva.recojoLat || !reserva.recojoLng) return;

    const initMap = () => {
      if (!window.google?.maps || !mapRef.current) {
        setTimeout(initMap, 500);
        return;
      }

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: reserva.recojoLat, lng: reserva.recojoLng },
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] }
          ]
        });

        // Marcador A (recojo)
        new window.google.maps.Marker({
          position: { lat: reserva.recojoLat, lng: reserva.recojoLng },
          map: map,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          },
          label: { text: 'A', color: 'white', fontSize: '14px', fontWeight: 'bold' }
        });

        // Marcador B (destino) + ruta
        if (reserva.destinoLat && reserva.destinoLng) {
          new window.google.maps.Marker({
            position: { lat: reserva.destinoLat, lng: reserva.destinoLng },
            map: map,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(40, 40)
            },
            label: { text: 'B', color: 'white', fontSize: '14px', fontWeight: 'bold' }
          });

          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: { strokeColor: '#0d6efd', strokeWeight: 5 }
          });

          directionsService.route({
            origin: { lat: reserva.recojoLat, lng: reserva.recojoLng },
            destination: { lat: reserva.destinoLat, lng: reserva.destinoLng },
            travelMode: window.google.maps.TravelMode.DRIVING
          }, (result, status) => {
            if (status === 'OK') directionsRenderer.setDirections(result);
          });
        }

        setMapaListo(true);
      } catch (error) {
        console.error('Error al crear mapa:', error);
        setTimeout(initMap, 1000);
      }
    };

    initMap();
  }, [reserva.recojoLat, reserva.recojoLng, reserva.destinoLat, reserva.destinoLng]);

  // ===== FORMATEAR FECHAS =====
  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    
    try {
      if (typeof fecha === 'string' && fecha.includes('/')) return fecha;
      if (fecha?.seconds) {
        const date = new Date(fecha.seconds * 1000);
        return date.toLocaleDateString('es-PE');
      }
      if (typeof fecha === 'string' && fecha.includes('-')) {
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
      }
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE');
    } catch {
      return '—';
    }
  };

  // ===== ESTADO DE RESERVA (NORMALIZADO) =====
  const getEstadoInfo = () => {
    const estadoLower = String(estado).toLowerCase().trim();
    
    const estados = {
      pendiente: {
        texto: 'Pendiente',
        desc: 'Esperando confirmación',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        icon: <ClockIcon size={14} />
      },
      confirmada: {
        texto: 'Confirmada',
        desc: 'Reserva confirmada',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        icon: <CheckCircle size={14} />
      },
      cancelada: {
        texto: 'Cancelada',
        desc: 'Reserva cancelada',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        icon: <XCircle size={14} />
      },
      'en camino': {
        texto: 'En camino',
        desc: 'Conductor en camino',
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.15)',
        icon: <Car size={14} />
      },
      'en transcurso': {
        texto: 'En transcurso',
        desc: 'Viaje en progreso',
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.15)',
        icon: <ClockIcon size={14} />
      },
      llegó: {
        texto: 'Llegó',
        desc: 'Conductor en el lugar',
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.15)',
        icon: <MapPin size={14} />
      },
      completada: {
        texto: 'Completada',
        desc: 'Viaje finalizado',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.15)',
        icon: <CheckCircle size={14} />
      }
    };

    if (['pendiente'].includes(estadoLower)) return estados.pendiente;
    if (['confirmada', 'confirmado'].includes(estadoLower)) return estados.confirmada;
    if (['cancelada', 'cancelado'].includes(estadoLower)) return estados.cancelada;
    if (['en camino', 'encamino'].includes(estadoLower)) return estados['en camino'];
    if (['en transcurso', 'entranscurso', 'transcurso'].includes(estadoLower)) return estados['en transcurso'];
    if (['llegó', 'llego'].includes(estadoLower)) return estados.llegó;
    if (['completada', 'completado', 'finalizada'].includes(estadoLower)) return estados.completada;

    return estados.pendiente;
  };

  const estadoInfo = getEstadoInfo();

  // ===== CONDUCTOR ASIGNADO =====
  const tieneConductor = reserva.conductorAsignado && reserva.conductorAsignado.id;

  // Estados en los que se puede contactar al conductor
  const estadosContactables = ['en camino', 'llegó', 'en transcurso'];
  const estadoLower = String(estado).toLowerCase().trim();
  const puedeContactarConductor = tieneConductor && estadosContactables.some(e => estadoLower.includes(e));

  // EFECTO PARA CERRAR LA SECCIÓN DEL CONDUCTOR CUANDO YA NO ES CONTACTABLE
  useEffect(() => {
    if (!puedeContactarConductor) {
      setMostrarConductor(false);
    }
  }, [puedeContactarConductor]);

  const handleWhatsAppConductor = () => {
    if (reserva.conductorAsignado?.telefono) {
      const mensaje = `Hola ${reserva.conductorAsignado.nombre}, soy el cliente de la reserva.`;
      window.open(`https://wa.me/${reserva.conductorAsignado.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
    }
  };

  return (
    <div className={`tarjeta-reserva ${estado}`}>
      {/* HEADER */}
      <div className="tarjeta-header">
        <div className="estado-badge" style={{ 
          backgroundColor: estadoInfo.bg,
          color: estadoInfo.color,
          borderColor: estadoInfo.color
        }}>
          {estadoInfo.icon}
          <span className="estado-texto">{estadoInfo.texto}</span>
          <span className="estado-desc">{estadoInfo.desc}</span>
        </div>
        <span className="fecha-reserva">
          <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          {formatFecha(reserva.fechaReserva)}
        </span>
      </div>

      {/* CONTENIDO: MAPA + DATOS */}
      <div className="tarjeta-contenido">
        {/* MAPA */}
        {reserva.recojoLat && reserva.recojoLng && (
          <div className="mapa-contenedor">
            <div 
              ref={mapRef} 
              className="mapa"
              style={{ width: '100%', height: '250px', borderRadius: '12px' }}
            />
            {!mapaListo && (
              <div className="mapa-loading">
                <div className="spinner"></div>
                <p>Cargando mapa...</p>
              </div>
            )}
          </div>
        )}

        {/* DATOS */}
        <div className="datos-contenedor">
          <div className="info-item">
            <MapPin size={18} className="icon" style={{ color: '#22c55e' }} />
            <div className="info-content">
              <span className="label">De:</span>
              <span className="value" title={reserva.lugarRecojo}>{reserva.lugarRecojo || '—'}</span>
            </div>
          </div>
          
          {reserva.tipoReserva === 'programada' && reserva.destino && (
            <div className="info-item">
              <MapPin size={18} className="icon" style={{ color: '#ef4444' }} />
              <div className="info-content">
                <span className="label">Para:</span>
                <span className="value" title={reserva.destino}>{reserva.destino}</span>
              </div>
            </div>
          )}

          <div className="info-item">
            <Calendar size={18} className="icon" />
            <div className="info-content">
              <span className="label">Fecha del viaje:</span>
              <span className="value">{formatFecha(reserva.fechaViaje || reserva.fechaServicio)}</span>
            </div>
          </div>

          <div className="info-item">
            <Clock size={18} className="icon" />
            <div className="info-content">
              <span className="label">Hora de inicio:</span>
              <span className="value">{reserva.horaOriginal || reserva.horaInicio || '—'}</span>
            </div>
          </div>

          <div className="info-item">
            <Users size={18} className="icon" />
            <div className="info-content">
              <span className="label">Pasajeros:</span>
              <span className="value">{reserva.pasajeros || 1}</span>
            </div>
          </div>

          {reserva.tipoReserva === 'horas' && reserva.horasContratadas && (
            <div className="info-item">
              <Clock size={18} className="icon" />
              <div className="info-content">
                <span className="label">Horas contratadas:</span>
                <span className="value">{reserva.horasContratadas} h</span>
              </div>
            </div>
          )}

          {reserva.distancia && reserva.distancia !== '—' && (
            <div className="info-item">
              <Map size={18} className="icon" />
              <div className="info-content">
                <span className="label">Distancia:</span>
                <span className="value">{reserva.distancia}</span>
              </div>
            </div>
          )}

          <div className="info-item precio">
            <DollarSign size={18} className="icon" />
            <div className="info-content">
              <span className="label">Total:</span>
              <span className="value">{reserva.precio || 'S/ 0.00'}</span>
            </div>
          </div>

          {/* DATOS DEL CONDUCTOR (si está asignado) */}
          {tieneConductor && mostrarConductor && (
            <div className="conductor-info">
              <h4>Conductor asignado</h4>
              <p><strong>Nombre:</strong> {reserva.conductorAsignado.nombre}</p>
              {reserva.conductorAsignado.vehiculo && (
                <>
                  <p><strong>Vehículo:</strong> {reserva.conductorAsignado.vehiculo.marca} {reserva.conductorAsignado.vehiculo.modelo}</p>
                  <p><strong>Placa:</strong> {reserva.conductorAsignado.vehiculo.placa}</p>
                </>
              )}
              {reserva.conductorAsignado.telefono && puedeContactarConductor && (
                <button 
                  className="btn-whatsapp-conductor"
                  onClick={handleWhatsAppConductor}
                >
                  <Phone size={14} /> Contactar conductor
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="tarjeta-footer">
        {estado === 'pendiente' && (
          <button 
            className="btn-pagar"
            onClick={() => setShowPagoModal(true)}
          >
            <DollarSign size={16} /> Pagar
          </button>
        )}
        {tieneConductor && (
          <button 
            className="btn-conductor"
            onClick={() => setMostrarConductor(!mostrarConductor)}
          >
            <Car size={16} /> 
            {mostrarConductor ? 'Ocultar conductor' : 'Ver conductor'}
          </button>
        )}
        {reserva.mapsLink && (
          <a 
            href={reserva.mapsLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-maps"
          >
            Ver en Google Maps
          </a>
        )}
      </div>

      {/* Modal de pago */}
      {showPagoModal && (
        <PagoModal 
          onClose={() => setShowPagoModal(false)}
          monto={reserva.precio}
        />
      )}
    </div>
  );
};

export default TarjetaReserva;