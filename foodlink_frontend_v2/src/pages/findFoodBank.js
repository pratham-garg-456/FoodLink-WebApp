import { useEffect, useState, useRef } from 'react';
import FoodBankList from '@/components/FoodBankList';
import Map from '@/components/Map';
import mapboxgl from 'mapbox-gl';
import { useRouter } from 'next/router';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYnJvamVyZW1pYWgiLCJhIjoiY202OTJhNms3MG1lMzJtb2xhMWplYTJ0ayJ9.Mii1Lm7LmWL2HA-f3ZB3oQ';

const FindBankPage = () => {
  const router = useRouter();
  const [foodBanks, setFoodBanks] = useState([]);
  const [selectedFoodBank, setSelectedFoodBank] = useState(null);
  const [directions, setDirections] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const mapRef = useRef(null);

  const handleSelectFoodBank = (foodBank) => {
    setSelectedFoodBank(foodBank);
    setDirections(null); // Reset directions
    setCurrentStep(0); // Reset steps to the beginning

    // Fly to the selected food bank's location immediately
    if (mapRef.current && foodBank) {
      mapRef.current.easeTo({
        center: [foodBank.lng, foodBank.lat],
        zoom: 14,
        essential: true,
        duration: 1000,
      });
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedFoodBank(null); // Reset selected food bank
    setDirections(null); // Reset directions
    setCurrentStep(0); // Reset steps to the beginning
  };

  const handleBookAppointment = (foodBank) => {
    router.push(`/dashboard/individual/manageAppointments/book?foodBank=${foodBank.id}`);
  };

  const getDirections = async (foodBank) => {
    const targetFoodBank = foodBank || selectedFoodBank || foodBanks[0]; // Use the first food bank as fallback

    if (!targetFoodBank) {
      alert('No food banks available to get directions.');
      return;
    }

    if (!userLocation) {
      alert('Could not determine your location!');
      return;
    }

    const userCoords = userLocation;
    const foodBankCoords = [targetFoodBank.lng, targetFoodBank.lat];

    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${foodBankCoords[0]},${foodBankCoords[1]}?steps=true&geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0].geometry; // GeoJSON geometry of the route
        const steps = data.routes[0].legs[0].steps; // Navigation steps
        setDirections({ steps, route });

        // Ensure the map and style are loaded before adding the route
        if (mapRef.current) {
          const addRouteToMap = () => {
            if (!mapRef.current.getSource('route')) {
              mapRef.current.addSource('route', {
                type: 'geojson',
                data: route,
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
              mapRef.current.getSource('route').setData(route);
            }
          };

          if (mapRef.current.isStyleLoaded()) {
            addRouteToMap();
          } else {
            mapRef.current.once('styledata', addRouteToMap);
          }
        }
      } else {
        alert('No directions found.');
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      alert('Failed to fetch directions. Please try again.');
    }
  };

  useEffect(() => {
    if (userLocation) {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        console.error("Map container not found.");
        return;
      }

      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: userLocation,
        zoom: 12,
      });

      mapRef.current = map;

      // Listen for changes in directions to update the map with the new route
      if (directions) {
        const routeGeoJson = directions.route;
        map.on('load', () => {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: routeGeoJson,
              }],
            },
          });

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            paint: {
              'line-color': '#3b9ddd',
              'line-width': 5,
            },
          });
        });
      }

      return () => map.remove();
    }
  }, [userLocation, foodBanks, directions]);

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
              hours: user.operating_hours || 'Hours not available',
              phone: user.phone_number || 'Phone not available',
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

  const cities = [...new Set(foodBanks.map((bank) => bank.city))]; // Extract unique cities

  const filteredFoodBanks = selectedCity
    ? foodBanks.filter((bank) => bank.city === selectedCity)
    : foodBanks; // Filter food banks based on selected city

  return (
    <div className="flex flex-col my-8 w-[75vw] justify-center items-center md:my-16">
      <h1 className="text-center text-4xl font-bold">Find a Food Bank</h1>
      <div className="flex flex-col my-8 w-[75vw] justify-center items-center">
        <div className="flex justify-center items-center">
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
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
        <div className="flex flex-col lg:flex-row w-[75vw] justify-center items-center lg:justify-around">
          <div className="w-auto p-4 md:h-[60vh] h-[60vh] overflow-y-auto flex flex-col items-start mb-16 md:mb-0">
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
                    <p className="text-gray-600 my-2 text-center">Hours: {foodBank.hours}</p>
                    <p className="text-gray-600 my-2 text-center">Phone: {foodBank.phone}</p>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => getDirections(foodBank)}
                        className="px-4 py-2 bg-black text-white border-none rounded-md cursor-pointer shadow-sm transform transition duration-200 hover:scale-105"
                      >
                        Get Directions
                      </button>
                      <button
                        onClick={() => handleBookAppointment(foodBank)}
                        className="px-4 py-2 bg-gray-600 text-white border-none rounded-md cursor-pointer shadow-sm transform transition duration-200 hover:scale-105"
                      >
                        Book an Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex flex-col justify-center items-center w-full bg-black h-[60vh] max-w-[65vw] md:max-w-auto">
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
