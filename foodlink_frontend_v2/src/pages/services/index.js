import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Services = () => {
  const [serviceDetails, setServiceDetails] = useState({});
  const [services, setServices] = useState([]);

  const serviceImages = {
    'Interactive Map Tools': '/images/map-tools.jpg',
    'Donation Portal': '/images/donation-portal.jpg',
    'Volunteer Management': '/images/volunteer-management.jpg',
    'Appointment Booking': '/images/appointment-booking.jpg',
  };

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/services`
      );
      setServices(response.data.services);
    }
    fetchData();
  }, []);

  const toggleDetails = (service) => {
    setServiceDetails((prevDetails) => ({
      ...prevDetails,
      [service]: !prevDetails[service],
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service) => (
          <div key={service.id} className="service-item text-center">
            <img
              src={serviceImages[service.title] || '/images/default.jpg'}
              alt={service.title}
              className="h-48 w-full mb-4 object-cover"
            />
            <h2 className="text-xl font-semibold">{service.title}</h2>
            <p className="text-gray-600">{service.description}</p>
            {serviceDetails[service.title] && (
              <p className="text-gray-500 mt-2">Additional details about {service.title}.</p>
            )}
            <button
              onClick={() => toggleDetails(service.title)}
              className="mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
