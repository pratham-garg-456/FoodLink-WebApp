import { useEffect, useState } from 'react';
import FoodBankList from '../components/FoodBankList';
import Map from '../components/Map';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYnJvamVyZW1pYWgiLCJhIjoiY202OTJhNms3MG1lMzJtb2xhMWplYTJ0ayJ9.Mii1Lm7LmWL2HA-f3ZB3oQ';

const FindBankPage = () => {
  const [foodBanks, setFoodBanks] = useState([]);
  const [selectedFoodBank, setSelectedFoodBank] = useState(null);
  const [directions, setDirections] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');

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

  useEffect(() => {
    // Fetch the user's location on component mount
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [position.coords.longitude, position.coords.latitude];
          setUserLocation(userCoords);
        },
        (error) => {
          console.error('Error fetching location: ', error);
          alert('Could not fetch user location.');
        }
      );
    }
  }, [userLocation]);

  useEffect(() => {
    const fetchFoodBanks = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const { users } = await response.json();
        const foodbankUsers = users.filter((user) => user.role === 'foodbank');

        // Hardcode address and coordinates for foodbank users
        const foodBankData = foodbankUsers.map((user) => ({
          name: user.name, // Assuming user object has a name property
          address: user.address || 'Hardcoded Address', // Hardcoded address
          lat: user.lat || 43.7, // Hardcoded latitude
          lng: user.lng || -79.4, // Hardcoded longitude
        }));

        setFoodBanks(foodBankData);
      } catch (error) {
        console.error('Error fetching food banks:', error);
      }
    };

    fetchFoodBanks();
  }, []);

  const cities = [...new Set(foodBanks.map((bank) => bank.city))]; // Extract unique cities from food banks

  const filteredFoodBanks = selectedCity
    ? foodBanks.filter((bank) => bank.city === selectedCity)
    : foodBanks; // Filter food banks based on selected city

  return (
    <div className="flex flex-col my-16 w-[80vw] justify-center items-center md:my-24 ">
      <h1 className="text-center text-4xl font-bold ">Find a Food Bank</h1>
      <div className="flex flex-col  my-16 w-[80vw] justify-center items-center ">
        <div className=" flex justify-center items-center">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="mb-4"
          >
            <option value="">Select a city</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col lg:flex-row w-[80vw] justify-center items-center lg:justify-around">
          <div className="w-auto  p-4 overflow-y-auto flex flex-col items-start">
            <FoodBankList
              foodBanks={filteredFoodBanks}
              onSelect={handleSelectFoodBank}
              getDirections={getDirections}
            />
          </div>
          <div className="relative flex flex-col justify-center items-center w-full bg-black h-[50vh] max-w-[50vw] md:max-w-auto">
            <Map
              foodBanks={filteredFoodBanks}
              selectedFoodBank={selectedFoodBank}
              userLocation={userLocation}
              setUserLocation={setUserLocation}
              directions={directions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindBankPage;
