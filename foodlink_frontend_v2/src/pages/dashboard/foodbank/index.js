import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import validateToken from '../../../utils/validateToken';

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
      setUserId(decodedToken.user.id.slice(0, 5)); // Display first 5 digits of user ID
      if (decodedToken.error) {
        console.error('Invalid token: ', decodedToken.error);
        router.push('/auth/login');
        return;
      }
    };
    checkToken();
  }, [router]);

  const handleManageVolunteer = () => {
    router.push('/dashboard/foodbank/manageVolunteer'); // Navigate to Manage Volunteer page
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Food Bank Dashboard</h1>
      <p className="mb-6 text-lg">
        Your User ID: <span className="font-mono">{userId}</span>
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => router.push('/dashboard/foodbank/inventory')}
          className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Manage Inventory
        </button>
        <button
          onClick={() => router.push('/dashboard/foodbank/events')}
          className="bg-green-500 text-white p-4 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
        >
          Manage Events
        </button>
        <button
          onClick={() => router.push('/dashboard/foodbank/manageAppointments')}
          className="bg-purple-500 text-white p-4 rounded-lg shadow-md hover:bg-purple-600 transition duration-300"
        >
          Manage Appointments
        </button>
        <button
          onClick={handleManageVolunteer}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Manage Volunteer
        </button>
      </div>
    </div>
  );
};

export default FoodbankDashboard;
