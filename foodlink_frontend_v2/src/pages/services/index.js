import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

  const servicesList = [
    { id: '1', title: 'Interactive Map Tools', link: '/services/interactive-map-tools' },
    { id: '2', title: 'Donation Portal', link: '/services/donation-portal' },
    { id: '3', title: 'Volunteer Management', link: '/services/volunteer-management' },
    { id: '4', title: 'Appointment Booking', link: '/services/appointment-booking' },
  ];

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/services`
      );
      setServices(response.data.services);
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="mt-2 text-4xl md:text-5xl font-extrabold mb-2 text-center">Our Services</h1>
      <p className="text-lg text-center mb-8 w-1/2 mx-auto">
        We offer a variety of services to support our community, including interactive tools,
        donation options, volunteer management, and appointment booking. Explore our services below
        to learn more about how we can assist you.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {servicesList.map((service) => (
          <Link key={service.id} href={service.link}>
            <div className="service-item text-center transition-transform transform hover:scale-105 shadow-lg p-4 rounded-lg flex flex-col justify-between">
              <div className="relative">
                <img
                  src={serviceImages[service.title] || '/images/default.jpg'}
                  alt={service.title}
                  className="h-48 w-full mb-4 object-cover rounded-lg"
                />
                <h2 className="text-xl font-semibold">{service.title}</h2>
                {serviceDetails[service.title] && (
                  <p className="text-gray-500 mt-2">Additional details about {service.title}.</p>
                )}
              </div>
              <div className="">
                <button className="mt-4 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded transition duration-200">
                  Learn More
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Services;
