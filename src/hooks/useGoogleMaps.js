// src/hooks/useGoogleMaps.js
import { useState, useEffect } from 'react';

const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCP3jgrVjb4nKEoiJM9-yPaM30hPgKmWls&libraries=places&loading=async&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setLoadError('Error al cargar Google Maps');
    
    document.head.appendChild(script);
  }, []);

  return { isLoaded, loadError };
};

export default useGoogleMaps;