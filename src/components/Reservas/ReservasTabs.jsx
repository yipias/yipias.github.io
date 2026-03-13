// src/components/Reservas/ReservasTabs.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
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
import ConfirmacionProgramada from '../Modals/ConfirmacionProgramada';
import ConfirmacionPorHoras from '../Modals/ConfirmacionPorHoras';
// Firebase
import { db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
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

  const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: "AIzaSyCP3jgrVjb4nKEoiJM9-yPaM30hPgKmWls",
  libraries: ["places"]
});
  
  // Estados para pestañas y selección
  const [activeTab, setActiveTab] = useState('programada');
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
const markersRef = useRef({
  pickup: null,
  dropoff: null,
  horas: null
});
  
  // Estados para hora con AM/PM
  const { ampm: progAmpm, setAmpm: setProgAmpm, formatearHoraParaFirebase } = useFormatoHoraAMPM();
  const { ampm: horasAmpm, setAmpm: setHorasAmpm } = useFormatoHoraAMPM();
  const [progHora, setProgHora] = useState('');
  const [horasHora, setHorasHora] = useState('');
  
  // Estados para controlar ubicación actual
  const [ubicacionError, setUbicacionError] = useState(null);
  
  // 🔥 NUEVO: Estado para forzar recálculo cuando cambien tarifas
  const [tarifasVersion, setTarifasVersion] = useState(0);
  
  // Refs
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const autocompleteRefs = useRef({
    pickup: null,
    dropoff: null,
    horas: null
  });

  // ===== FUNCIÓN PARA HACER SCROLL AL MAPA EN MÓVIL ===== 🔥 NUEVO
  const scrollToMap = () => {
    // Solo en móvil (menor a 768px)
    if (window.innerWidth <= 768) {
      const mapElement = document.querySelector('.map-col');
      if (mapElement) {
        setTimeout(() => {
          mapElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 100); // Pequeño delay para que se active el modo selección
      }
    }
  };

  // ===== EFECTO PARA ESCUCHAR CAMBIOS EN TARIFAS =====
  useEffect(() => {
    console.log('🎯 Iniciando listener de tarifas activas');
    
    const tarifasRef = doc(db, 'config', 'tarifas');
    
    const unsubscribe = onSnapshot(tarifasRef, (docSnap) => {
      if (docSnap.exists()) {
        console.log('🔄 Tarifas activas actualizadas en Firebase');
        
        // Incrementar versión para forzar recálculo
        setTarifasVersion(v => v + 1);
        
        // Si estamos en programada y hay puntos, recalcular
        if (activeTab === 'programada' && pickupLocation && dropoffLocation) {
          console.log('📍 Recalculando ruta por cambio en tarifas activas');
          limpiarRuta();
          calcularRutaYDistancia(pickupLocation, dropoffLocation);
        }
        
        // Si estamos en por horas y hay punto, recalcular
        if (activeTab === 'porhoras' && horasLocation) {
          console.log('⏰ Recalculando precio horas por cambio en tarifas activas');
          const paxInput = document.getElementById('horasPax');
          const horasSelect = document.getElementById('horasCantidad');
          const priceSpan = document.getElementById('horasPrice');
          
          if (paxInput && horasSelect && priceSpan) {
            const horas = parseInt(horasSelect.value);
            let pax = parseInt(paxInput.value) || 1;
            
            if (pax > 6) pax = 6;
            if (pax < 1) pax = 1;
            
            try {
              const tarifa = obtenerTarifaHoras(horas, pax);
              if (tarifa) {
                priceSpan.textContent = `S/ ${tarifa}.00`;
              }
            } catch (error) {
              console.log('Error actualizando precio horas:', error);
            }
          }
        }
      }
    });

    return () => {
      console.log('🔇 Limpiando listener de tarifas activas');
      unsubscribe();
    };
  }, [activeTab, pickupLocation, dropoffLocation, horasLocation]);

  // ===== LIMPIAR RUTA =====
  const limpiarRuta = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
  };

  // ===== LIMPIAR RUTA SI SE BORRA INPUT MANUALMENTE =====
  useEffect(() => {
    const pickupInput = document.getElementById('pickup');
    const dropoffInput = document.getElementById('dropoff');

    const handlePickupClear = () => {
      if (pickupInput && pickupInput.value.trim() === '') {
        setPickupLocation(null);

        if (markersRef.current.pickup) {
          markersRef.current.pickup.setMap(null);
        }

        limpiarRuta();

        const distanceSpan = document.getElementById('progDistance');
        const priceSpan = document.getElementById('progPrice');

        if (distanceSpan) distanceSpan.textContent = '—';
        if (priceSpan) priceSpan.textContent = 'S/ 0.00';
      }
    };

    const handleDropoffClear = () => {
      if (dropoffInput && dropoffInput.value.trim() === '') {
        setDropoffLocation(null);

        if (markersRef.current.dropoff) {
          markersRef.current.dropoff.setMap(null);
        }

        limpiarRuta();

        const distanceSpan = document.getElementById('progDistance');
        const priceSpan = document.getElementById('progPrice');

        if (distanceSpan) distanceSpan.textContent = '—';
        if (priceSpan) priceSpan.textContent = 'S/ 0.00';
      }
    };

    pickupInput?.addEventListener('input', handlePickupClear);
    dropoffInput?.addEventListener('input', handleDropoffClear);

    return () => {
      pickupInput?.removeEventListener('input', handlePickupClear);
      dropoffInput?.removeEventListener('input', handleDropoffClear);
    };
  }, []);

  // ===== LIMPIAR TODO AL CAMBIAR DE PESTAÑA =====
  const limpiarTodo = () => {
    console.log('🧹 Limpiando todo al cambiar de pestaña');
    
    setPickupAddress('');
    setDropoffAddress('');
    setHorasAddress('');
    
    setPickupLocation(null);
    setDropoffLocation(null);
    setHorasLocation(null);
    
    setProgHora('');
    setHorasHora('');
    setProgAmpm('AM');
    setHorasAmpm('AM');
    
Object.values(markersRef.current).forEach(marker => {
  if (marker) marker.setMap(null);
});

markersRef.current = {
  pickup: null,
  dropoff: null,
  horas: null
};
    
    
    limpiarRuta();
    
    const inputs = ['pickup', 'dropoff', 'horasRecojo', 'progHoraInput', 'horasHoraInput'];
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    
    const progDistance = document.getElementById('progDistance');
    const progPrice = document.getElementById('progPrice');
    const horasPrice = document.getElementById('horasPrice');
    
    if (progDistance) progDistance.textContent = '—';
    if (progPrice) progPrice.textContent = 'S/ 0.00';
    if (horasPrice) horasPrice.textContent = 'S/ 38.00';
    
    setUbicacionError(null);
  };

  // ===== MANEJAR CAMBIO DE PESTAÑA =====
  const handleTabClick = (tab) => {
    // Ya no se verifica usuario aquí
    limpiarTodo();
    setActiveTab(tab);
  };

  // ===== AGREGAR MARCADOR =====
const addMarker = (type, location, address, placeName = null) => {

  if (!mapRef.current || !window.google) return;

  console.log(`📍 Agregando marcador tipo: ${type}`, location);

  const markers = markersRef.current;

  // eliminar anterior
  if (markers[type]) {
    markers[type].setMap(null);
  }

  const marker = new window.google.maps.Marker({
    position: location,
    map: mapRef.current,
    title: placeName || address,
    icon: {
      url:
        type === 'pickup'
          ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : type === 'dropoff'
          ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      scaledSize: new window.google.maps.Size(40, 40)
    },
    label: {
      text: type === 'pickup' ? 'A' : type === 'dropoff' ? 'B' : 'H',
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold'
    }
  });

  markers[type] = marker;

  mapRef.current.panTo(location);
  mapRef.current.setZoom(15);
};

  // ===== CALCULAR RUTA Y PRECIO =====
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
          let shortestRoute = result.routes[0];
          let shortestDistance = result.routes[0].legs[0].distance.value;
          
          result.routes.forEach(route => {
            const distance = route.legs[0].distance.value;
            if (distance < shortestDistance) {
              shortestDistance = distance;
              shortestRoute = route;
            }
          });
          
          limpiarRuta();

          directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
            map: mapRef.current,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#0d6efd',
              strokeWeight: 6,
              strokeOpacity: 1
            }
          });
          
          directionsRendererRef.current.setDirections({
            ...result,
            routes: [shortestRoute]
          });
          
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

  // ===== EFECTO PARA TRAZAR RUTA =====
  useEffect(() => {
    if (activeTab !== 'programada') return;

    if (!pickupLocation || !dropoffLocation) {
      limpiarRuta();

      const distanceSpan = document.getElementById('progDistance');
      const priceSpan = document.getElementById('progPrice');

      if (distanceSpan) distanceSpan.textContent = '—';
      if (priceSpan) priceSpan.textContent = 'S/ 0.00';

      return;
    }

    console.log('🔄 Trazando ruta (versión tarifas:', tarifasVersion, ')');
    limpiarRuta();
    calcularRutaYDistancia(pickupLocation, dropoffLocation);

  }, [pickupLocation, dropoffLocation, activeTab, tarifasVersion]);

  // ===== EFECTO PARA ACTUALIZAR PRECIO PROGRAMADA =====
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
    
    if (distanceSpan.textContent !== '—') {
      handlePaxChange();
    }
    
    return () => {
      paxInput.removeEventListener('change', handlePaxChange);
      paxInput.removeEventListener('input', handlePaxChange);
    };
  }, [activeTab, pickupLocation, dropoffLocation, tarifasVersion]);

  // ===== EFECTO PARA ACTUALIZAR PRECIO POR HORAS =====
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
  }, [activeTab, horasLocation, tarifasVersion]);

  // ===== CONFIGURAR AUTOCOMPLETADOS =====
useEffect(() => {
  if (!mapRef.current || !window.google || !isLoaded) return;

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
        types: ['geocode', 'establishment']
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
        types: ['geocode', 'establishment']
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
  }, [isLoaded]);

  const handleMapReady = (map) => {
    mapRef.current = map;
  };

  const handlePlaceSelected = (inputType, address, location, placeName = null) => {
if (markersRef.current[inputType]) {
  markersRef.current[inputType].setMap(null);
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
    
    // 👇 NUEVO: En móvil, hacer scroll al formulario después de seleccionar
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        const formElement = document.querySelector('.form-col');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  // ===== MANEJAR SELECCIÓN EN MAPA ===== 🔥 MODIFICADO
  const handleSelectInMap = (inputType) => {
    setSelectedInput(inputType);
    setActiveMode(inputType);
    scrollToMap(); // 👈 NUEVO: Hace scroll al mapa en móvil
  };

  const handleUbicacionActualPickup = async (buttonElement) => {
    const inputElement = document.getElementById('pickup');
    setUbicacionError(null);

    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        alert('Debes habilitar la ubicación manualmente en el navegador (candado del sitio → Permitir ubicación).');
        return;
      }
    }
    
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
      setUbicacionError('No se pudo obtener la ubicación. Asegúrate de tener permisos de ubicación activados.');
      alert('No se pudo acceder a tu ubicación. Por favor, verifica que los permisos de ubicación estén activados en tu navegador y vuelve a intentarlo.');
    }
  };

  const handleUbicacionActualHoras = async (buttonElement) => {
    const inputElement = document.getElementById('horasRecojo');
    setUbicacionError(null);
    
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        alert('Debes habilitar la ubicación manualmente en el navegador (candado del sitio → Permitir ubicación).');
        return;
      }
    }

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
      setUbicacionError('No se pudo obtener la ubicación. Asegúrate de tener permisos de ubicación activados.');
      alert('No se pudo acceder a tu ubicación. Por favor, verifica que los permisos de ubicación estén activados en tu navegador y vuelve a intentarlo.');
    }
  };

 const handleReservaProgramada = async (observaciones = '') => {
  // ✅ Verificar usuario
  if (!currentUser) {
    setShowAuthModal(true);
    document.body.style.overflow = 'hidden';
    return;
  }
  
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

  if (!progHora || progHora.trim() === '') {
    alert('Por favor selecciona una hora');
    return;
  }
  
  const horaFormateada = formatearHoraParaFirebase(progHora, progAmpm);
  
  const distancia = document.getElementById('progDistance')?.textContent || '—';
  const precio = document.getElementById('progPrice')?.textContent || 'S/ 0.00';
  
  const mapsLink = `https://www.google.com/maps/dir/${pickupLocation.lat},${pickupLocation.lng}/${dropoffLocation.lat},${dropoffLocation.lng}`;
  
  const datosReserva = {
    tipoReserva: 'programada',
    email: currentUser?.email || '',
    nombreCompleto: currentUser?.displayName || '',
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
    mapsLink: mapsLink,
    observaciones: observaciones || ''
  };
  
  const resultado = await guardarReservaProgramada(datosReserva);
  
  if (resultado.success) {
    modales.mostrarConfirmacionProgramada();
    limpiarTodo();
  }
};

  const handleReservaHoras = async (observaciones = '') => {
  // ✅ Verificar usuario
  if (!currentUser) {
    setShowAuthModal(true);
    document.body.style.overflow = 'hidden';
    return;
  }
  
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

  if (!horasHora || horasHora.trim() === '') {
    alert('Por favor selecciona una hora');
    return;
  }
  
  const horaFormateada = formatearHoraParaFirebase(horasHora, horasAmpm);
  
  const precio = document.getElementById('horasPrice')?.textContent || 'S/ 38.00';
  
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${horasLocation.lat},${horasLocation.lng}`;
  
  const datosReserva = {
    tipoReserva: 'horas',
    email: currentUser?.email || '',
    nombreCompleto: currentUser?.displayName || '',
    lugarRecojo: horasAddress,
    fechaServicio: fecha,
    horaInicio: horaFormateada,
    horaOriginal: `${horasHora} ${horasAmpm}`,
    horasContratadas: horas,
    pasajeros: pax,
    precio: precio,
    recojoLat: horasLocation.lat,
    recojoLng: horasLocation.lng,
    mapsLink: mapsLink,
    observaciones: observaciones || ''
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
/>
            ) : (
              <div className="form" style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Selecciona un tipo de reserva para comenzar</p>
              </div>
            )}
          </div>
          
          <div className="col map-col">
            <div className="map">
{isLoaded ? (
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