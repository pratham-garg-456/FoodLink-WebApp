import React from 'react';

const DonationPortal = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 mt-10">Donation Portal</h1>
      <img
        src="/images/donation-portal.jpg"
        alt="Donation Portal"
        className="h-48 w-full mb-4 object-cover rounded-lg shadow-lg"
      />
      <p className="text-xl text-gray-600 mb-2 mt-10 text-center">
        A platform to facilitate donations to our cause.
      </p>
      <p className="text-gray-600 mt-1 text-center">
        Our donation portal allows individuals and organizations to contribute easily and
        effectively.
      </p>

      <h2 className="text-4xl font-semibold mt-20 mb-10 text-center">How It Works:</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-20">
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/donate.jpg"
            alt="Donate"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Make a Donation</h3>
            <p className="text-gray-600 text-center">
              Easily donate to support our cause through a simple and secure process.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/manage-donations.jpg"
            alt="Manage Donations"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Track Donations</h3>
            <p className="text-gray-600 text-center">
              Food banks can track incoming donations and manage their resources effectively.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <img
            src="/images/view-impact.jpg"
            alt="View Impact"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">View Your Impact</h3>
            <p className="text-gray-600 text-center">
              Users can see how much they have donated and the impact of their contributions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPortal;
