// src/components/Reservas/Mapa.jsx
import React, { useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { DEFAULT_CENTER } from '../../utils/constants';
import './Mapa.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const Mapa = forwardRef(({ 
  tipo, 
  onPlaceSelected, 
  selectedInput, 
  onMapReady,
  pickupLocation,
  dropoffLocation,
  horasLocation,
  onMapClick 
}, ref) => {
  const [map, setMap] = React.useState(null);
  const [markers, setMarkers] = React.useState({
    pickup: null,
    dropoff: null,
    horas: null
  });

  // Exponer funciones al padre mediante ref
  useImperativeHandle(ref, () => ({
    addMarker: (type, location, address) => {
      if (!map) return;
      
      const markerConfig = {
        position: location,
        map: map,
        title: type === 'pickup' ? 'Punto de recojo' : 
               type === 'dropoff' ? 'Destino final' : 'Punto de recojo (horas)',
        icon: {
          url: type === 'pickup' ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' :
               type === 'dropoff' ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' :
               'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        },
        label: {
          text: type === 'pickup' ? 'A' : type === 'dropoff' ? 'B' : 'H',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        }
      };

      // Eliminar marcador anterior del mismo tipo
      if (markers[type]) {
        markers[type].setMap(null);
      }

      // Crear nuevo marcador
      const newMarker = new window.google.maps.Marker(markerConfig);
      
      setMarkers(prev => ({
        ...prev,
        [type]: newMarker
      }));

      // Centrar mapa en la nueva ubicación
      map.panTo(location);
      map.setZoom(15);
    },
    
    clearMarkers: () => {
      Object.values(markers).forEach(marker => {
        if (marker) marker.setMap(null);
      });
      setMarkers({ pickup: null, dropoff: null, horas: null });
    },
    
    drawRoute: (origin, destination) => {
      if (!map || !origin || !destination) return;
      
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#0d6efd',
          strokeWeight: 6,
          strokeOpacity: 1
        }
      });
      
      directionsService.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            // Guardar referencia para limpiar después
            setMarkers(prev => ({
              ...prev,
              directionsRenderer
            }));
          }
        }
      );
    }
  }));

  const handleMapClick = useCallback((event) => {
    if (!selectedInput) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const location = { lat, lng };
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        onPlaceSelected(selectedInput, address, location);
      }
    });
  }, [selectedInput, onPlaceSelected]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    if (onMapReady) onMapReady(mapInstance);
  }, [onMapReady]);

  if (!window.google) {
    return <div className="map-loading">Cargando mapa...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={DEFAULT_CENTER}
      zoom={11}
      onLoad={onLoad}
      onClick={handleMapClick}
      options={{
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
          }
        ]
      }}
    />
  );
});

export default Mapa;