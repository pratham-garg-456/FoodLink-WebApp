import React from 'react';

const AppointmentBooking = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 mt-10">Appointment Booking</h1>
      <img
        src="/images/appointment-booking2.jpg"
        alt="Appointment Booking"
        className="h-48 w-full mb-4 object-cover rounded-lg shadow-lg"
      />
      <p className="text-xl text-gray-600 mb-2 mt-10 text-center">
        Book appointments easily through our online system.
      </p>

      <p className="text-gray-600 mt-1 text-center">
        Our online appointment booking system makes it easy for individuals in need to access food
        resources efficiently and conveniently.
      </p>
      <h2 className="text-4xl font-semibold mt-20 mb-10 text-center">How It Works:</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4 mb-20">
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/create-account.jpg"
            alt="Create Account"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Sign up or create an account</h3>
            <p className="text-gray-600 text-center">
              Access all features and manage your bookings.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/select-foodbank.jpg"
            alt="Select Food Bank"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Select your preferred food bank</h3>
            <p className="text-gray-600 text-center">Choose from a list of available food banks.</p>
          </div>
        </div>
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/select-time.jpg"
            alt="Select Time"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Choose a convenient time</h3>
            <p className="text-gray-600 text-center">Pick a time that works best for you.</p>
          </div>
        </div>

        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/select-items.jpg"
            alt="Select Items"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Browse and select items</h3>
            <p className="text-gray-600 text-center">
              Choose the items you need, just like Uber or Instacart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
