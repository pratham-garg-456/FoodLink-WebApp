import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import { OrbitProgress } from 'react-loading-indicators';
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
      
      setUserRole(decodedToken.role);
      if (userRole == 'foodbank') {
        router.push('/dashboard/foodbank');
      }
      if (userRole == 'individual') {
        
        router.push('/dashboard/individual');
      }
      if (userRole == 'volunteer') {
        
        router.push('/dashboard/volunteer');
      }
      if (userRole == 'donor') {
       
        router.push('/dashboard/donor');
      }
    } catch (error) {
      console.error('Invalid token: ', error);
      router.push('/login');
    }
  });

  return <OrbitProgress color="#000000" size="large" text="" textColor="" />;
};

export default Dashboard;
