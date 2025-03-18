import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import validateToken from '../../../utils/validateToken';
import Image from 'next/image';
import foodbank from '../../../../public/images/food-bank2.jpg';

const FoodbankDashboard = ({ userRole }) => {
  const router = useRouter();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const decodedToken = await validateToken(token);
      setUserId(decodedToken.user.id.slice(0, 5));
      if (decodedToken.error) {
        console.error('Invalid token: ', decodedToken.error);
        router.push('/auth/login');
        return;
      }
    };
    checkToken();
  }, [router]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col justify-center items-center w-[70vw] md:flex-row md:justify-end md:w-[80vw] md:gap-2">
        {/* Left Section */}
        <div className="order-last md:order-first md:w-4/6 md:pr-4">
          <h1 className="text-2xl md:text-5xl text-center mt-5 font-bold text-gray-900 md:text-left mb-7">
            Welcome to the Food Bank Dashboard
          </h1>
          <p className="text-lg text-gray-700 text-center md:text-left mb-4">
            Your User ID: <span className="font-mono font-bold">{userId}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => router.push('/dashboard/foodbank/inventory')}
            >
              Manage Inventory
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={() => router.push('/dashboard/foodbank/events')}
            >
              Manage Events
            </button>
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              onClick={() => router.push('/dashboard/foodbank/manageAppointments')}
            >
              Manage Appointments
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              onClick={() => router.push('/dashboard/foodbank/manageVolunteer')}
            >
              Manage Volunteers
            </button>
            <button
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              onClick={() => router.push('/dashboard/foodbank/manageDonations')}
            >
              Manage Donations
            </button>
            <button
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              onClick={() => router.push('/dashboard/foodbank/job')}
            >
              Manage Jobs
            </button>
          </div>

          <div className="mt-8 text-md text-gray-800 flex flex-col items-center md:justify-start md:items-start md:flex-row md:gap-4">
            <p>
              <strong>500+</strong> Appointments Scheduled
            </p>
            <p>
              <strong>1,200</strong> Volunteers Engaged
            </p>
            <p>
              <strong>50k+</strong> Meals Distributed
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-2/6 flex flex-col justify-center items-center">
          <Image
            src={foodbank}
            alt="Food Bank"
            className="rounded-full object-cover shadow-lg w-32 h-32 md:w-64 md:h-64"
          />
          <div className="mt-6 text-center text-gray-600">
            <p className="text-md font-semibold">
              Supporting communities through food and resources
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodbankDashboard;
