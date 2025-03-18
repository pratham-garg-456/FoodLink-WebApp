import React from 'react';

const FoodBankList = ({ foodBanks, onSelect, getDirections }) => {
  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <h2 className="text-center mb-4 font-bold text-3xl">Food Banks</h2>
      <div className="flex flex-col justify-center gap-4">
        {foodBanks.map((foodBank, index) => (
          <div
            key={index}
            className="mb-4 border border-gray-300 rounded-lg p-6 bg-white shadow-md flex flex-col items-center justify-center"
          >
            <strong
              className="text-xl text-black cursor-pointer"
              onClick={() => onSelect(foodBank)}
            >
              {foodBank.name}
            </strong>
            <p className="text-gray-600 my-2">{foodBank.address}</p>
            <button
              onClick={() => getDirections(foodBank)}
              className="px-4 py-2 bg-blue-500 text-white border-none rounded-md cursor-pointer shadow-sm transform transition duration-200 hover:scale-105"
            >
              Get Directions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodBankList;
