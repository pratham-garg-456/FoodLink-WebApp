import React, { useState } from 'react';
import axios from 'axios';

const Services = () => {
  const [serviceDetails, setServiceDetails] = useState({});

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
        <div className="service-item text-center">
          <img
            src="/images/map-tools.jpg"
            alt="Interactive Map Tools"
            className="h-48 w-full mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold">Interactive Map Tools</h2>
          <p className="text-gray-600">
            Find nearby food banks and services with our interactive map tool.
          </p>
          {serviceDetails['mapTools'] && (
            <p className="text-gray-500 mt-2">
              Additional details about interactive map tools to assist users in locating services.
            </p>
          )}
          <button
            onClick={() => toggleDetails('mapTools')}
            className="mt-4 bg-black text-white px-4 py-2 rounded"
          >
            Learn More
          </button>
        </div>
        <div className="service-item text-center">
          <img
            src="/images/donation-portal.jpg"
            alt="Donation Portal"
            className="h-48 w-full mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold">Donation Portal</h2>
          <p className="text-gray-600">
            Make secure online donations using various payment methods. Support our mission to end
            hunger.
          </p>
          {serviceDetails['donationPortal'] && (
            <p className="text-gray-500 mt-2">
              More information on how your donations make a difference.
            </p>
          )}
          <button
            onClick={() => toggleDetails('donationPortal')}
            className="mt-4 bg-black text-white px-4 py-2 rounded"
          >
            Learn More
          </button>
        </div>
        <div className="service-item text-center">
          <img
            src="/images/volunteer-management.jpg"
            alt="Volunteer Management"
            className="h-48 w-full mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold">Volunteer Management</h2>
          <p className="text-gray-600">
            View and register for volunteer activities. Manage schedules and tasks efficiently.
          </p>
          {serviceDetails['volunteerManagement'] && (
            <p className="text-gray-500 mt-2">
              Details on volunteer opportunities and how to get involved.
            </p>
          )}
          <button
            onClick={() => toggleDetails('volunteerManagement')}
            className="mt-4 bg-black text-white px-4 py-2 rounded"
          >
            Learn More
          </button>
        </div>
        <div className="service-item text-center">
          <img
            src="/images/appointment-booking.jpg"
            alt="Appointment Booking"
            className="h-48 w-full mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold">Appointment Booking</h2>
          <p className="text-gray-600">
            Schedule appointments for food assistance and view available slots in real-time.
          </p>
          {serviceDetails['appointmentBooking'] && (
            <p className="text-gray-500 mt-2">
              Instructions on how to book appointments efficiently.
            </p>
          )}
          <button
            onClick={() => toggleDetails('appointmentBooking')}
            className="mt-4 bg-black text-white px-4 py-2 rounded"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
