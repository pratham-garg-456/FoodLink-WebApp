
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import Layout from '../../layout';

const FoodbankDashboard = ({ userRole }) => {
  const router = useRouter();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.sub.slice(0, 5)); // Display first 5 digits of user ID

    } catch (error) {
      console.error('Invalid token: ', error);
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <Layout userRole={userRole}>
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Food Bank Dashboard</h1>
        <p className="mb-4">Your User ID: {userId}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/foodbank/inventory')}
            className="bg-blue-500 text-white p-4 rounded"
          >
            Manage Inventory
          </button>
          <button
            onClick={() => router.push('/dashboard/foodbank/events')}
            className="bg-green-500 text-white p-4 rounded"
          >
            Manage Events
          </button>
          <button
            onClick={() => router.push('/dashboard/foodbank/appointments')}
            className="bg-purple-500 text-white p-4 rounded"
          >
            Manage Appointments
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default FoodbankDashboard;