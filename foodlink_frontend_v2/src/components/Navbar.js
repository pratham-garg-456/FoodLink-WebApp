import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NavbarFoodbank from './NavbarFoodbank';
import HomeNavbar from './HomeNavbar';

const Navbar = () => {
  const [userType, setUserType] = useState(null); // Store user type
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching user data (Replace with actual auth logic)
    const fetchUser = async () => {
      const user = localStorage.getItem('userRole'); // Example: Replace with API or Context
      console.log('User:', user);
      if (user) {
        setUserType(user); // Assuming 'type' is stored (e.g., 'foodbank', 'admin', 'customer')
      }
    };
    fetchUser();
    // Listen for changes in localStorage (when a user logs in/out)
    window.addEventListener('storage', fetchUser);

    return () => {
      window.removeEventListener('storage', fetchUser);
    };
  }, []);
  // Check if the current route is '/foodbank'
  const isFoodbankRoute = router.pathname.startsWith('/dashboard/foodbank');

  return (
    <nav>{userType === 'foodbank' && isFoodbankRoute ? <NavbarFoodbank /> : <HomeNavbar />}</nav>
  );
};
export default Navbar;
