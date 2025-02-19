import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Retrieve current access-token in the local storage
    const token = localStorage.getItem('accessToken');
    console.log('Access token:', token);

    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log('Decoded token:', decodedToken);
      setUserRole(decodedToken.role);
      if (userRole == 'foodbank') {
        router.push('/dashboard/foodbank');
      }
      // } else if (decodedToken.role === 'donor') {
      //   router.push('/dashboard/foodbank/donations');
      // }
    } catch (error) {
      console.error('Invalid token: ', error);
      router.push('/login');
    }
  });

  return (
    <div>
      <h1>Loading your dashboard....</h1>
    </div>
  );
};

export default Dashboard;
