import React from 'react';

const InteractiveMapTools = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Interactive Map Tools</h1>
      <img
        src="/images/map-tools.jpg"
        alt="Interactive Map Tools"
        className="h-48 w-full mb-4 object-cover rounded-lg shadow-lg"
      />
      <p className="text-xl text-gray-600 mb-2 mt-10 text-center">
        Tools to help you navigate and explore our services interactively.
      </p>
      <p className="text-gray-600 mt-1 text-center">
        Use our interactive map to find nearby food banks and get directions easily.
      </p>

      <h2 className="text-4xl font-semibold mt-20 mb-10 text-center">How It Works:</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-20">
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow mx-auto">
          <img
            src="/images/find-foodbank.jpg"
            alt="Find Nearby Food Bank"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Find Nearby Food Banks</h3>
            <p className="text-gray-600 text-center">
              Easily locate food banks in your area using our interactive map.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center flex-col gap-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow  mx-auto">
          <img
            src="/images/get-directions.jpg"
            alt="Get Directions"
            className="h-48 w-full object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-center">Get Directions</h3>
            <p className="text-gray-600 text-center">
              Get step-by-step directions to your selected food bank.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapTools;
