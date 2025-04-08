import { useEffect, useState } from 'react';
import FoodBankList from '@/components/FoodBankList';
import Map from '@/components/Map';
import mapboxgl from 'mapbox-gl';
import { useRouter } from 'next/router';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYnJvamVyZW1pYWgiLCJhIjoiY202OTJhNms3MG1lMzJtb2xhMWplYTJ0ayJ9.Mii1Lm7LmWL2HA-f3ZB3oQ';

const FindDropOffLocation = () => {
  const router = useRouter();
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

        const foodBankData = await Promise.all(
          foodbankUsers.map(async (user) => {
            let lat = user.lat || 43.7; // Default latitude
            let lng = user.lng || -79.4; // Default longitude
            let city = 'Unknown City'; // Default city

            if (user.location) {
              // Extract city from the location string
              const locationParts = user.location.split(',');
              if (locationParts.length > 1) {
                city = locationParts[1].trim(); // Get the second part and trim whitespace
              }

              try {
                const geocodeResponse = await fetch(
                  `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    user.location
                  )}.json?access_token=${mapboxgl.accessToken}`
                );
                const geocodeData = await geocodeResponse.json();

                if (geocodeData.features && geocodeData.features[0]) {
                  lat = geocodeData.features[0].center[1]; // Latitude
                  lng = geocodeData.features[0].center[0]; // Longitude
                }
              } catch (geocodeError) {
                console.error(`Error geocoding location for ${user.name}:`, geocodeError);
              }
            }

            return {
              name: user.name,
              address: user.location || 'Hardcoded Address',
              lat,
              lng,
              city, // Include the extracted city
              id: user.id,
            };
          })
        );

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
          <div className="w-auto  p-4 md:h-[60vh] h-[50vh] overflow-y-auto flex flex-col items-start mb-20 md:mb-0">
            <div className="p-4 flex flex-col w-auto">
              <h2 className="text-center mb-4 font-bold text-3xl">Food Banks</h2>
              <div className="flex flex-col justify-center gap-4">
                {filteredFoodBanks.map((foodBank, index) => (
                  <div
                    key={index}
                    className="mb-4 border border-gray-300 rounded-lg p-6 bg-white shadow-md flex flex-col items-center justify-center"
                  >
                    <strong
                      className="text-xl text-center text-black cursor-pointer"
                      onClick={() => handleSelectFoodBank(foodBank)}
                    >
                      {foodBank.name}
                    </strong>
                    <p className="text-gray-600 my-2 text-center">{foodBank.address}</p>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => getDirections(foodBank)}
                        className="px-4 py-2 bg-black text-white border-none rounded-md cursor-pointer shadow-sm transform transition duration-200 hover:scale-105"
                      >
                        Get Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex flex-col justify-center items-center w-full bg-black h-[50vh] max-w-[570vw] md:max-w-auto">
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

export default FindDropOffLocation;
