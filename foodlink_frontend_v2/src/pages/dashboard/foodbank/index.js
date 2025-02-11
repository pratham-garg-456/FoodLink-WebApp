import { useEffect } from 'react';
import validateToken from '@/utils/validateToken';
import { useRouter } from 'next/router';
const Foodbank_dashboard = () => {
  const router = useRouter();
  // Usage example
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    async function checkToken() {
      const result = await validateToken(token);
      if (result.error) {
        console.error('Token validation failed:', result.error);
        // Handle the error
        router.push('/login');
      } else {
        console.log('Token is valid:', result);
        // Proceed with valid token
      }
    }
    checkToken();
  }, []);
  return <div>Welcome to Foodbank dashboard</div>;
};

export default Foodbank_dashboard;
