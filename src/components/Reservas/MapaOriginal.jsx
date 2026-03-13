// src/components/Reservas/MapaOriginal.jsx
import React, { useEffect, useRef } from 'react';

const MapaOriginal = ({ onMapReady, onMapClick, selectedInput }) => {

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const clickListenerRef = useRef(null);
  const userLocationMarkerRef = useRef(null);

  // ===============================
  // CREAR MAPA
  // ===============================
  useEffect(() => {

    if (!window.google || !mapContainerRef.current) return;

    const defaultCenter = { lat: -5.1945, lng: -80.6328 };

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 11,
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
    });

    mapRef.current = map;

    // enviar mapa al componente padre
    if (onMapReady) {
      onMapReady(map);
    }

    // ===============================
    // GEOLOCALIZACIÓN DEL USUARIO
    // ===============================
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          map.setCenter(userLocation);
          map.setZoom(15);

          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setMap(null);
          }

          userLocationMarkerRef.current = new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Tu ubicación',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(30, 30)
            }
          });

        },

        (error) => {
          console.log('No se pudo obtener la ubicación:', error);
          map.setCenter(defaultCenter);
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }

      );

    }

    // limpieza al desmontar
    return () => {

      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setMap(null);
      }

      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
      }

    };

  }, []);



  // ===============================
  // CLICK EN MAPA
  // ===============================
  useEffect(() => {

    if (!mapRef.current || !window.google) return;

    // eliminar listener anterior
    if (clickListenerRef.current) {
      window.google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }

    if (selectedInput) {

      mapRef.current.setOptions({
        draggableCursor: 'crosshair'
      });

      clickListenerRef.current = mapRef.current.addListener('click', (event) => {

        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        const location = { lat, lng };

        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ location }, (results, status) => {

          if (status === 'OK' && results[0]) {

            const address = results[0].formatted_address;
            const placeName = results[0].name || null;

            if (onMapClick) {
              onMapClick(selectedInput, address, location, placeName);
            }

          } else {
            alert('No se pudo obtener la dirección');
          }

        });

        mapRef.current.setOptions({
          draggableCursor: null
        });

      });

    } else {

      mapRef.current.setOptions({
        draggableCursor: null
      });

    }

    return () => {

      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }

    };

  }, [selectedInput, onMapClick]);



  // ===============================
  // RENDER
  // ===============================
  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );

};

export default MapaOriginal;