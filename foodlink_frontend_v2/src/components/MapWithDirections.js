import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const DEFAULT_LOCATION = [43.65107, -79.347015]; // Toronto

const MapWithDirections = ({ selectedFoodBank }) => {
  const [route, setRoute] = useState(null);

  const fetchDirections = async (start, end) => {
    const apiKey = '5b3ce3597851110001cf624875100eb6f4ef415c9515432f95f37771';
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`;

    console.log('Fetching directions from URL:', url);

    try {
      const response = await axios.get(url);
      console.log('API response:', response.data);
      const coordinates = response.data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      setRoute(coordinates);
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  useEffect(() => {
    if (selectedFoodBank) {
      fetchDirections(DEFAULT_LOCATION, [selectedFoodBank.lat, selectedFoodBank.lng]);
    }
  }, [selectedFoodBank]);

  const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
  const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
  const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
  const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

  return (
    <MapContainer center={DEFAULT_LOCATION} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectedFoodBank && (
        <Marker position={[selectedFoodBank.lat, selectedFoodBank.lng]} />
      )}
      {route && (
        <Polyline positions={route} color="blue" />
      )}
    </MapContainer>
  );
};

export default MapWithDirections;