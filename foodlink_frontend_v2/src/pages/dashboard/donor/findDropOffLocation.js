import { useEffect, useState } from 'react';
import FoodBankList from '@/components/FoodBankList';
import Map from '@/components/Map';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYnJvamVyZW1pYWgiLCJhIjoiY202OTJhNms3MG1lMzJtb2xhMWplYTJ0ayJ9.Mii1Lm7LmWL2HA-f3ZB3oQ';

export default function FindDropOffLocation({ foodBanks }) {
  const [selectedFoodBank, setSelectedFoodBank] = useState(null);
  const [directions, setDirections] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const handleSelectFoodBank = (foodBank) => {
    setSelectedFoodBank(foodBank);
    setDirections(null); // Reset directions when selecting a new food bank
  };

  const getDirections = async (foodBank) => {
    if (!userLocation) {
      alert('Could not determine your location!');
      return;
    }

    const userCoords = userLocation;
    const foodBankCoords = [foodBank.lng, foodBank.lat];
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${foodBankCoords[0]},${foodBankCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0].geometry; // GeoJSON geometry of the route
        const steps = data.routes[0].legs[0].steps; // Navigation steps
        setDirections({ steps, route });
      } else {
        alert('No directions found.');
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      alert('Failed to fetch directions. Please try again.');
    }
  };

  // Get user location on mount
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [position.coords.longitude, position.coords.latitude];
          setUserLocation(userCoords);
        },
        (error) => {
          console.error('Error fetching location:', error);
          alert('Could not fetch user location.');
        }
      );
    }
  }, [userLocation]);

  return (
    <div className="mx-auto w-[95%] h-[85vh] grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left Panel: Food Bank List */}
      <div className="md:col-span-1 p-4 bg-gray-100 overflow-y-auto">
        <FoodBankList
          foodBanks={foodBanks}
          onSelect={handleSelectFoodBank}
          getDirections={getDirections}
        />
      </div>

      {/* Right Panel: Map */}
      <div className="md:col-span-2 flex-1">
        <Map
          foodBanks={foodBanks}
          selectedFoodBank={selectedFoodBank}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          directions={directions}
        />
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const foodBanks = [
    {
      name: 'Daily Bread Food Bank',
      address: '191 New Toronto St, Toronto, ON M8V 2E7',
      lat: 43.635417,
      lng: -79.535421,
    },
    {
      name: 'North York Harvest Food Bank',
      address: '116 Industry St, Toronto, ON M6M 4L8',
      lat: 43.763619,
      lng: -79.481751,
    },
    {
      name: 'Scarborough Centre for Healthy Communities',
      address: '629 Markham Rd, Toronto, ON M1H 2A4',
      lat: 43.7805,
      lng: -79.2273,
    },
  ];

  return {
    props: {
      foodBanks,
    },
  };
}
