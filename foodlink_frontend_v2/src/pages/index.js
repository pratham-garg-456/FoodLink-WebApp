import Image from 'next/image';
import foodbank from '../../public/images/food-bank.jpg';

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center  ">
        <div className="flex flex-col justify-center items-center w-[70vw]">
          {/* Left section */}
          <div className="w-full md:w-1/2 space-y-6 order-last">
            <h1 className="text-2xl md:text-5xl text-center mt-5 font-bold text-gray-900">
              Find, support, and donate to local food banks
            </h1>

            <div className="flex flex-wrap justify-center gap-2 ">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Register
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Donate Now
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                Find Food Bank
              </button>
            </div>

            <div className="mt-8 text-l text-gray-800 flex flex-col items-center">
              <p>
                <strong>2.5k</strong> donations
              </p>
              <p>
                <strong>2000</strong> Volunteers
              </p>
              <p>
                <strong>100k+</strong> Users connected
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
            <Image
              src={foodbank} // Make sure to add your image in the public folder
              alt="Food Bank"
              className="rounded-full object-cover shadow-lg w-32 h-32 "
            />
            <div className="mt-6 text-center text-gray-600">
              <p className="text-md w-[70vw] font-semibold">
                Connecting communities with food and resources
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
