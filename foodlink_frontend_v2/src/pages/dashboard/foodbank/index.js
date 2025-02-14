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

  const handleGetApplication = () => {
    router.push('/dashboard/foodbank/getApplication'); // Change this to your target page
  };

  const handleGetApproveApplication=()=>{
    router.push('/dashboard/foodbank/getApproveApplication');
  }


  return <div>
    
    
    
    <div>Welcome to Foodbank dashboard</div>
    <button 
        onClick={handleGetApplication} 
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        fetch application
      </button>
      <button 
        onClick={handleGetApproveApplication} 
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        fetch application
      </button>
    </div>;
};

export default Foodbank_dashboard;
