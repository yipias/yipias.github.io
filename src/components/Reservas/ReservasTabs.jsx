// src/components/Reservas/ReservasTabs.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLimpiarInputs } from '../../hooks/useLimpiarInputs';
import { useFechaMinima } from '../../hooks/useFechaMinima';
import { useValidaciones } from '../../hooks/useValidaciones';
import { useUbicacionActual } from '../../hooks/useUbicacionActual';
import { useModales } from '../../hooks/useModales';
import { useFirebaseReservas } from '../../hooks/useFirebaseReservas';
import { useFormatoHoraAMPM } from '../../hooks/useFormatoHoraAMPM';
import { useAuth } from '../../context/AuthContext';
import FormularioProgramada from './FormularioProgramada';
import FormularioPorHoras from './FormularioPorHoras';
import MapaOriginal from './MapaOriginal';
import AuthModal from '../Auth/AuthModal';
// Modales
import ExplicacionProgramada from '../Modals/ExplicacionProgramada';
import ExplicacionPorHoras from '../Modals/ExplicacionPorHoras';
import ConfirmacionProgramada from '../Modals/ConfirmacionProgramada';
import ConfirmacionPorHoras from '../Modals/ConfirmacionPorHoras';
import './Reservas.css';

// Importar funciones de cálculo
import { obtenerTarifaKm, obtenerTarifaHoras } from '../../utils/calculos';

const ReservasTabs = () => {
  useLimpiarInputs();
  useFechaMinima();
  const { validarFechaHoraReserva, validarPasajeros } = useValidaciones();
  const { obtenerUbicacionActual } = useUbicacionActual();
  const modales = useModales();
  const { guardarReservaProgramada, guardarReservaHoras } = useFirebaseReservas();
  const { currentUser } = useAuth();
  
  // ✅ NUEVO: Estado para saber si Maps está listo
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  // Estados para pestañas y selección
  const [activeTab, setActiveTab] = useState('');
  const [selectedInput, setSelectedInput] = useState(null);
  const [activeMode, setActiveMode] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Estados para direcciones
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [horasAddress, setHorasAddress] = useState('');
  
  // Estados para ubicaciones
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [horasLocation, setHorasLocation] = useState(null);
  
  // Estados para marcadores
  const [markers, setMarkers] = useState({
    pickup: null,
    dropoff: null,
    horas: null
  });
  
  // Estados para hora con AM/PM
  const { ampm: progAmpm, setAmpm: setProgAmpm, formatearHoraParaFirebase } = useFormatoHoraAMPM();
  const { ampm: horasAmpm, setAmpm: setHorasAmpm } = useFormatoHoraAMPM();
  const [progHora, setProgHora] = useState('');
  const [horasHora, setHorasHora] = useState('');
  
  // Refs
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const autocompleteRefs = useRef({
    pickup: null,
    dropoff: null,
    horas: null
  });

  // ✅ NUEVO: Efecto para verificar carga de Maps
  useEffect(() => {
    // Función para verificar si Maps ya está cargado
    const checkMapsLoaded = () => {
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps listo');
        setMapsLoaded(true);
      } else {
        console.log('⏳ Esperando Google Maps...');
        setTimeout(checkMapsLoaded, 200);
      }
    };

    // Si ya está cargado, activar inmediatamente
    if (window.google?.maps) {
      setMapsLoaded(true);
    } else {
      checkMapsLoaded();
    }

    // Escuchar el callback de Maps
    window.initMap = function() {
      setMapsLoaded(true);
    };
  }, []);

  // ===== LIMPIAR RUTA =====
  const limpiarRuta = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
  };

  // ===== LIMPIAR TODO AL CAMBIAR DE PESTAÑA =====
  const limpiarTodo = () => {
    console.log('🧹 Limpiando todo al cambiar de pestaña');
    
    // Limpiar estados de direcciones
    setPickupAddress('');
    setDropoffAddress('');
    setHorasAddress('');
    
    // Limpiar ubicaciones
    setPickupLocation(null);
    setDropoffLocation(null);
    setHorasLocation(null);
    
    // Limpiar horas
    setProgHora('');
    setHorasHora('');
    setProgAmpm('AM');
    setHorasAmpm('AM');
    
    // Limpiar marcadores del mapa
    Object.values(markers).forEach(marker => {
      if (marker) marker.setMap(null);
    });
    
    setMarkers({
      pickup: null,
      dropoff: null,
      horas: null
    });
    
    // Limpiar ruta
    limpiarRuta();
    
    // Limpiar inputs del DOM
    const inputs = ['pickup', 'dropoff', 'horasRecojo', 'progHoraInput', 'horasHoraInput'];
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    
    // Limpiar distancia y precio
    const progDistance = document.getElementById('progDistance');
    const progPrice = document.getElementById('progPrice');
    const horasPrice = document.getElementById('horasPrice');
    
    if (progDistance) progDistance.textContent = '—';
    if (progPrice) progPrice.textContent = 'S/ 0.00';
    if (horasPrice) horasPrice.textContent = 'S/ 38.00';
  };

  // ===== MANEJAR CAMBIO DE PESTAÑA =====
  const handleTabClick = (tab) => {
    // Si NO hay usuario logueado, mostrar modal de autenticación
    if (!currentUser) {
      setShowAuthModal(true);
      document.body.style.overflow = 'hidden';
      return;
    }
    
    // Si HAY usuario logueado, proceder normalmente
    limpiarTodo();
    setActiveTab(tab);
    if (tab === 'programada') {
      modales.mostrarExplicacionProgramada();
    } else {
      modales.mostrarExplicacionPorHoras();
    }
  };

  // ===== AGREGAR MARCADOR (SIEMPRE LIMPIA EL ANTERIOR) =====
  const addMarker = (type, location, address, placeName = null) => {
    if (!mapRef.current || !window.google) return;
    
    console.log(`📍 Agregando marcador tipo: ${type}`, location);
    
    // Si ya existe un marcador del mismo tipo, eliminarlo
    if (markers[type]) {
      console.log(`🗑️ Eliminando marcador anterior tipo: ${type}`);
      markers[type].setMap(null);
    }
    
    const title = type === 'pickup' ? 'Punto de recojo' : 
                  type === 'dropoff' ? 'Destino final' : 'Punto de recojo (horas)';
    
    const markerTitle = placeName || title;
    
    // Configurar icono según tipo
    const iconConfig = {
      url: type === 'pickup' ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' :
           type === 'dropoff' ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' :
           'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      scaledSize: new window.google.maps.Size(40, 40)
    };
    
    // Configurar label según tipo
    const labelConfig = {
      text: type === 'pickup' ? 'A' : type === 'dropoff' ? 'B' : 'H',
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold'
    };
    
    const markerConfig = {
      position: location,
      map: mapRef.current,
      title: markerTitle,
      icon: iconConfig,
      label: labelConfig
    };
    
    const newMarker = new window.google.maps.Marker(markerConfig);
    
    // Actualizar estado
    setMarkers(prev => {
      const newMarkers = { ...prev, [type]: newMarker };
      return newMarkers;
    });
    
    // Centrar mapa
    mapRef.current.panTo(location);
    mapRef.current.setZoom(15);
  };

  // ===== CALCULAR RUTA Y PRECIO (RUTA MÁS CORTA) =====
  const calcularRutaYDistancia = (origin, destination) => {
    if (!mapRef.current || !window.google || !origin || !destination) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      },
      (result, status) => {
        if (status === 'OK') {
          // Buscar la ruta con menor distancia
          let shortestRoute = result.routes[0];
          let shortestDistance = result.routes[0].legs[0].distance.value;
          
          // Recorrer todas las rutas alternativas
          result.routes.forEach(route => {
            const distance = route.legs[0].distance.value;
            if (distance < shortestDistance) {
              shortestDistance = distance;
              shortestRoute = route;
            }
          });
          
          // Crear nuevo renderizador con la ruta más corta
          directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
            map: mapRef.current,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#0d6efd',
              strokeWeight: 6,
              strokeOpacity: 1
            }
          });
          
          // Mostrar solo la ruta más corta
          directionsRendererRef.current.setDirections({
            ...result,
            routes: [shortestRoute]
          });
          
          // Calcular distancia y precio
          const distance = shortestDistance / 1000;
          const paxInput = document.getElementById('progPax');
          let pax = paxInput ? parseInt(paxInput.value) || 1 : 1;
          
          if (pax > 6) pax = 6;
          if (pax < 1) pax = 1;
          
          const distanceSpan = document.getElementById('progDistance');
          if (distanceSpan) {
            distanceSpan.textContent = distance.toFixed(2) + ' km';
          }
          
          try {
            const tarifa = obtenerTarifaKm(distance, pax);
            const priceSpan = document.getElementById('progPrice');
            if (priceSpan && tarifa) {
              priceSpan.textContent = `S/ ${tarifa}.00`;
              console.log(`📍 Ruta más corta: ${distance}km, Pasajeros: ${pax}, Tarifa: S/ ${tarifa}.00`);
            }
          } catch (error) {
            console.log('Error calculando tarifa:', error);
          }
        } else {
          console.log('❌ Error calculando ruta:', status);
        }
      }
    );
  };

  // ===== EFECTO PARA TRAZAR RUTA CUANDO AMBOS PUNTOS CAMBIAN =====
  useEffect(() => {
    if (activeTab !== 'programada') return;
    if (pickupLocation && dropoffLocation) {
      console.log('🔄 Trazando ruta por cambio en ubicaciones');
      limpiarRuta();
      calcularRutaYDistancia(pickupLocation, dropoffLocation);
    }
  }, [pickupLocation, dropoffLocation, activeTab]);

  // ===== EFECTO PARA ACTUALIZAR PRECIO EN TIEMPO REAL (PROGRAMADA) =====
  useEffect(() => {
    if (activeTab !== 'programada') return;
    
    const paxInput = document.getElementById('progPax');
    const distanceSpan = document.getElementById('progDistance');
    const priceSpan = document.getElementById('progPrice');
    
    if (!paxInput || !distanceSpan || !priceSpan) return;
    
    const handlePaxChange = () => {
      const distanceText = distanceSpan.textContent;
      if (!distanceText || distanceText === '—') return;
      
      const kmMatch = distanceText.match(/([\d.]+)/);
      if (!kmMatch) return;
      
      const km = parseFloat(kmMatch[0]);
      let pax = parseInt(paxInput.value) || 1;
      
      if (pax > 6) pax = 6;
      if (pax < 1) pax = 1;
      
      try {
        const tarifa = obtenerTarifaKm(km, pax);
        if (tarifa) {
          priceSpan.textContent = `S/ ${tarifa}.00`;
          console.log(`🔄 Tiempo real - Km: ${km}, Pasajeros: ${pax}, Tarifa: S/ ${tarifa}.00`);
        }
      } catch (error) {
        console.log('Error actualizando precio:', error);
      }
    };
    
    paxInput.addEventListener('change', handlePaxChange);
    paxInput.addEventListener('input', handlePaxChange);
    
    return () => {
      paxInput.removeEventListener('change', handlePaxChange);
      paxInput.removeEventListener('input', handlePaxChange);
    };
  }, [activeTab]);

  // ===== EFECTO PARA ACTUALIZAR PRECIO EN TIEMPO REAL (POR HORAS) =====
  useEffect(() => {
    if (activeTab !== 'porhoras') return;
    
    const paxInput = document.getElementById('horasPax');
    const horasSelect = document.getElementById('horasCantidad');
    const priceSpan = document.getElementById('horasPrice');
    
    if (!paxInput || !horasSelect || !priceSpan) return;
    
    const handleChange = () => {
      const horas = parseInt(horasSelect.value);
      let pax = parseInt(paxInput.value) || 1;
      
      if (pax > 6) pax = 6;
      if (pax < 1) pax = 1;
      
      try {
        const tarifa = obtenerTarifaHoras(horas, pax);
        if (tarifa) {
          priceSpan.textContent = `S/ ${tarifa}.00`;
          console.log(`⏰ Tiempo real - Horas: ${horas}, Pasajeros: ${pax}, Tarifa: S/ ${tarifa}.00`);
        }
      } catch (error) {
        console.log('Error actualizando precio:', error);
      }
    };
    
    paxInput.addEventListener('change', handleChange);
    paxInput.addEventListener('input', handleChange);
    horasSelect.addEventListener('change', handleChange);
    
    handleChange();
    
    return () => {
      paxInput.removeEventListener('change', handleChange);
      paxInput.removeEventListener('input', handleChange);
      horasSelect.removeEventListener('change', handleChange);
    };
  }, [activeTab]);

  // Configurar autocompletados
  useEffect(() => {
    if (!mapRef.current || !window.google || !mapsLoaded) return;

    if (autocompleteRefs.current.pickup) {
      window.google.maps.event.clearInstanceListeners(autocompleteRefs.current.pickup);
    }
    if (autocompleteRefs.current.dropoff) {
      window.google.maps.event.clearInstanceListeners(autocompleteRefs.current.dropoff);
    }
    if (autocompleteRefs.current.horas) {
      window.google.maps.event.clearInstanceListeners(autocompleteRefs.current.horas);
    }

    const pickupInput = document.getElementById('pickup');
    if (pickupInput) {
      const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInput, {
        fields: ['place_id', 'geometry', 'formatted_address', 'name'],
        componentRestrictions: { country: 'pe' },
        types: ['geocode', 'establishment'],
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(-5.5, -81.5),
          new window.google.maps.LatLng(-4.5, -80.0)
        ),
        strictBounds: true
      });
      
      pickupAutocomplete.addListener('place_changed', () => {
        const place = pickupAutocomplete.getPlace();
        if (place?.geometry) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          const displayName = place.name || place.formatted_address;
          setPickupAddress(displayName);
          setPickupLocation(location);
          addMarker('pickup', location, displayName, place.name);
        }
      });
      
      autocompleteRefs.current.pickup = pickupAutocomplete;
    }

    const dropoffInput = document.getElementById('dropoff');
    if (dropoffInput) {
      const dropoffAutocomplete = new window.google.maps.places.Autocomplete(dropoffInput, {
        fields: ['place_id', 'geometry', 'formatted_address', 'name'],
        componentRestrictions: { country: 'pe' },
        types: ['geocode', 'establishment']
      });
      
      dropoffAutocomplete.addListener('place_changed', () => {
        const place = dropoffAutocomplete.getPlace();
        if (place?.geometry) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          const displayName = place.name || place.formatted_address;
          setDropoffAddress(displayName);
          setDropoffLocation(location);
          addMarker('dropoff', location, displayName, place.name);
        }
      });
      
      autocompleteRefs.current.dropoff = dropoffAutocomplete;
    }

    const horasInput = document.getElementById('horasRecojo');
    if (horasInput) {
      const horasAutocomplete = new window.google.maps.places.Autocomplete(horasInput, {
        fields: ['place_id', 'geometry', 'formatted_address', 'name'],
        componentRestrictions: { country: 'pe' },
        types: ['geocode', 'establishment'],
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(-5.5, -81.5),
          new window.google.maps.LatLng(-4.5, -80.0)
        ),
        strictBounds: true
      });
      
      horasAutocomplete.addListener('place_changed', () => {
        const place = horasAutocomplete.getPlace();
        if (place?.geometry) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          const displayName = place.name || place.formatted_address;
          setHorasAddress(displayName);
          setHorasLocation(location);
          addMarker('horas', location, displayName, place.name);
        }
      });
      
      autocompleteRefs.current.horas = horasAutocomplete;
    }

    return () => {
      if (autocompleteRefs.current.pickup) {
        window.google.maps.event.clearInstanceListeners(autocompleteRefs.current.pickup);
      }
      if (autocompleteRefs.current.dropoff) {
        window.google.maps.event.clearInstanceListeners(autocompleteRefs.current.dropoff);
      }
      if (autocompleteRefs.current.horas) {
        window.google.maps.event.clearInstanceListeners(autocompleteRefs.current.horas);
      }
    };
  }, [mapRef.current, activeTab, mapsLoaded]);

  const handleMapReady = (map) => {
    mapRef.current = map;
  };

  const handlePlaceSelected = (inputType, address, location, placeName = null) => {
    if (markers[inputType]) {
      markers[inputType].setMap(null);
    }
    
    if (inputType === 'pickup') {
      setPickupAddress(address);
      setPickupLocation(location);
      addMarker('pickup', location, address, placeName);
    } else if (inputType === 'dropoff') {
      setDropoffAddress(address);
      setDropoffLocation(location);
      addMarker('dropoff', location, address, placeName);
    } else if (inputType === 'horas') {
      setHorasAddress(address);
      setHorasLocation(location);
      addMarker('horas', location, address, placeName);
    }
    setSelectedInput(null);
    setActiveMode(null);
  };

  const handleSelectInMap = (inputType) => {
    setSelectedInput(inputType);
    setActiveMode(inputType);
  };

  const handleUbicacionActualPickup = async (buttonElement) => {
    const inputElement = document.getElementById('pickup');
    try {
      const result = await obtenerUbicacionActual(
        inputElement, 
        buttonElement, 
        mapRef.current
      );
      
      if (result) {
        setPickupAddress(result.address);
        setPickupLocation(result.location);
        addMarker('pickup', result.location, result.address);
      }
    } catch (error) {
      console.log('Error en ubicación actual:', error);
    }
  };

  const handleUbicacionActualHoras = async (buttonElement) => {
    const inputElement = document.getElementById('horasRecojo');
    try {
      const result = await obtenerUbicacionActual(
        inputElement, 
        buttonElement, 
        mapRef.current
      );
      
      if (result) {
        setHorasAddress(result.address);
        setHorasLocation(result.location);
        addMarker('horas', result.location, result.address);
      }
    } catch (error) {
      console.log('Error en ubicación actual:', error);
    }
  };

  const handleReservaProgramada = async () => {
    const fecha = document.getElementById('progFecha')?.value;
    const pax = parseInt(document.getElementById('progPax')?.value) || 1;
    
    if (pax < 1 || pax > 6) {
      alert('El número de pasajeros debe ser entre 1 y 6');
      return;
    }
    
    if (!pickupLocation || !dropoffLocation) {
      alert('Por favor selecciona punto de recojo y destino final');
      return;
    }
    
    const horaFormateada = formatearHoraParaFirebase(progHora, progAmpm);
    
    const distancia = document.getElementById('progDistance')?.textContent || '—';
    const precio = document.getElementById('progPrice')?.textContent || 'S/ 0.00';
    
    const mapsLink = `https://www.google.com/maps/dir/${pickupLocation.lat},${pickupLocation.lng}/${dropoffLocation.lat},${dropoffLocation.lng}`;
    
    // ===== AGREGAR EMAIL DEL USUARIO A LA RESERVA =====
    const datosReserva = {
      tipoReserva: 'programada',
      email: currentUser?.email || '', // ← NUEVO
      nombreCompleto: currentUser?.displayName || '', // ← NUEVO
      lugarRecojo: pickupAddress,
      destino: dropoffAddress,
      fechaViaje: fecha,
      horaInicio: horaFormateada,
      horaOriginal: `${progHora} ${progAmpm}`,
      pasajeros: pax,
      distancia: distancia,
      precio: precio,
      recojoLat: pickupLocation.lat,
      recojoLng: pickupLocation.lng,
      destinoLat: dropoffLocation.lat,
      destinoLng: dropoffLocation.lng,
      mapsLink: mapsLink
    };
    
    const resultado = await guardarReservaProgramada(datosReserva);
    
    if (resultado.success) {
      modales.mostrarConfirmacionProgramada();
      limpiarTodo();
    }
  };

  const handleReservaHoras = async () => {
    const fecha = document.getElementById('horasFecha')?.value;
    const pax = parseInt(document.getElementById('horasPax')?.value) || 1;
    const horas = parseInt(document.getElementById('horasCantidad')?.value) || 1;
    
    if (pax < 1 || pax > 6) {
      alert('El número de pasajeros debe ser entre 1 y 6');
      return;
    }
    
    if (!horasLocation) {
      alert('Por favor selecciona punto de recojo');
      return;
    }
    
    const horaFormateada = formatearHoraParaFirebase(horasHora, horasAmpm);
    
    const precio = document.getElementById('horasPrice')?.textContent || 'S/ 38.00';
    
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${horasLocation.lat},${horasLocation.lng}`;
    
    // ===== AGREGAR EMAIL DEL USUARIO A LA RESERVA =====
    const datosReserva = {
      tipoReserva: 'horas',
      email: currentUser?.email || '', // ← NUEVO
      nombreCompleto: currentUser?.displayName || '', // ← NUEVO
      lugarRecojo: horasAddress,
      fechaServicio: fecha,
      horaInicio: horaFormateada,
      horaOriginal: `${horasHora} ${horasAmpm}`,
      horasContratadas: horas,
      pasajeros: pax,
      precio: precio,
      recojoLat: horasLocation.lat,
      recojoLng: horasLocation.lng,
      mapsLink: mapsLink
    };
    
    const resultado = await guardarReservaHoras(datosReserva);
    
    if (resultado.success) {
      modales.mostrarConfirmacionHoras();
      limpiarTodo();
    }
  };

  return (
    <section id="reservas" className="section">
      <div className="container">
        <h2 className="section-title">Reservas</h2>
        <p className="section-subtitle reveal">
          Las reservas pueden realizarse en cualquier momento.
        </p>
        
        <div className="tab-container reveal">
          <button 
            className={`tab-btn ${activeTab === 'programada' ? 'active' : ''}`}
            onClick={() => handleTabClick('programada')}
          >
            Reserva de punto a punto
          </button>
          <button 
            className={`tab-btn ${activeTab === 'porhoras' ? 'active' : ''}`}
            onClick={() => handleTabClick('porhoras')}
          >
            Reserva por horas
          </button>
        </div>

        <div className="grid">
          <div className="col form-col">
            {activeTab === 'programada' ? (
              <FormularioProgramada 
                pickupAddress={pickupAddress}
                dropoffAddress={dropoffAddress}
                setPickupAddress={setPickupAddress}
                setDropoffAddress={setDropoffAddress}
                onSelectInMap={handleSelectInMap}
                onReservar={handleReservaProgramada}
                onUbicacionActual={handleUbicacionActualPickup}
                activeMode={activeMode}
                horaValue={progHora}
                onHoraChange={setProgHora}
                ampm={progAmpm}
                onAmpmChange={setProgAmpm}
                markers={markers}
                setMarkers={setMarkers}
              />
            ) : activeTab === 'porhoras' ? (
              <FormularioPorHoras 
                horasAddress={horasAddress}
                setHorasAddress={setHorasAddress}
                onSelectInMap={handleSelectInMap}
                onReservar={handleReservaHoras}
                onUbicacionActual={handleUbicacionActualHoras}
                activeMode={activeMode}
                horaValue={horasHora}
                onHoraChange={setHorasHora}
                ampm={horasAmpm}
                onAmpmChange={setHorasAmpm}
                markers={markers}
                setMarkers={setMarkers}
              />
            ) : (
              <div className="form" style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Selecciona un tipo de reserva para comenzar</p>
              </div>
            )}
          </div>
          
          <div className="col map-col">
            <div className="map">
              {mapsLoaded ? (
                <MapaOriginal 
                  onMapReady={handleMapReady}
                  onMapClick={handlePlaceSelected}
                  selectedInput={selectedInput}
                />
              ) : (
                <div className="map-loading">
                  <div className="spinner"></div>
                  <p>Cargando mapa...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE AUTENTICACIÓN */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => {
            setShowAuthModal(false);
            document.body.style.overflow = 'auto';
          }}
          onSuccess={() => {
            setShowAuthModal(false);
            document.body.style.overflow = 'auto';
          }}
        />
      )}

      {modales.modalExplicacionProgramada && (
        <ExplicacionProgramada onClose={modales.cerrarModales} />
      )}
      {modales.modalExplicacionHoras && (
        <ExplicacionPorHoras onClose={modales.cerrarModales} />
      )}
      {modales.modalConfirmacionProgramada && (
        <ConfirmacionProgramada onClose={modales.cerrarModales} />
      )}
      {modales.modalConfirmacionHoras && (
        <ConfirmacionPorHoras onClose={modales.cerrarModales} />
      )}
    </section>
  );
};

export default ReservasTabs;