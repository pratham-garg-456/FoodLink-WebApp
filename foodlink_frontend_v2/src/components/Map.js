import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { FaCrosshairs, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

mapboxgl.accessToken = 'pk.eyJ1IjoiYnJvamVyZW1pYWgiLCJhIjoiY202OTJhNms3MG1lMzJtb2xhMWplYTJ0ayJ9.Mii1Lm7LmWL2HA-f3ZB3oQ'; 

const Map = ({ foodBanks, selectedFoodBank, userLocation, setUserLocation, directions }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation || [-79.3832, 43.6532], // Default to Toronto
      zoom: 12,
    });

    mapRef.current.on('load', () => {
      setMapLoaded(true);

      // Add food bank markers
      foodBanks.forEach((bank) => {
        new mapboxgl.Marker()
          .setLngLat([bank.lng, bank.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${bank.name}</h3><p>${bank.address}</p>`))
          .addTo(mapRef.current);
      });

      // Add user location marker if available
      if (userLocation) {
        new mapboxgl.Marker({ color: 'blue' })
          .setLngLat(userLocation)
          .setPopup(new mapboxgl.Popup().setHTML('<h3>You are here</h3>'))
          .addTo(mapRef.current);
      }
    });

    return () => mapRef.current.remove();
  }, [foodBanks, userLocation]);

  useEffect(() => {
    // Center the map on the selected food bank
    if (selectedFoodBank && mapRef.current) {
      mapRef.current.easeTo({
        center: [selectedFoodBank.lng, selectedFoodBank.lat],
        zoom: 14,
        essential: true,
        duration: 1000, 
      });
    }
  }, [selectedFoodBank]);

  useEffect(() => {
    if (directions?.route && mapLoaded) {
      const routeGeoJSON = {
        type: 'Feature',
        geometry: directions.route, // GeoJSON route geometry
      };

      if (!mapRef.current.getSource('route')) {
        mapRef.current.addSource('route', {
          type: 'geojson',
          data: routeGeoJSON,
        });

        mapRef.current.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#007bff',
            'line-width': 5,
          },
        });
      } else {
        mapRef.current.getSource('route').setData(routeGeoJSON);
      }

      // Fit bounds to the route
      const bounds = new mapboxgl.LngLatBounds();
      routeGeoJSON.geometry.coordinates.forEach((coord) => bounds.extend(coord));
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [directions, mapLoaded]);

  const handleNextStep = () => {
    if (directions?.steps && currentStep < directions.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextLocation = directions.steps[nextStep].maneuver.location;
      mapRef.current.easeTo({ center: nextLocation, zoom: 16, essential: true, duration: 1000 });
    }
  };

  const handlePrevStep = () => {
    if (directions?.steps && currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const prevLocation = directions.steps[prevStep].maneuver.location;
      mapRef.current.easeTo({ center: prevLocation, zoom: 16, essential: true, duration: 1000 });
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* User Location Button */}
      <button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const userCoords = [position.coords.longitude, position.coords.latitude];
              setUserLocation(userCoords);
              mapRef.current.easeTo({ center: userCoords, zoom: 14, duration: 1000 });
            });
          }
        }}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          width: '50px',
          height: '50px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title="Center on My Location"
      >
        <FaCrosshairs size={20} />
      </button>

      {/* Directions Controls */}
      {directions && directions.steps && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <button onClick={handlePrevStep} disabled={currentStep === 0}>
            <FaArrowLeft />
          </button>

          {directions.steps[currentStep]?.maneuver ? (
            <p>{directions.steps[currentStep].maneuver.instruction}</p>
          ) : (
            <p>No directions available.</p>
          )}

          <button onClick={handleNextStep} disabled={currentStep === directions.steps.length - 1}>
            <FaArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Map;