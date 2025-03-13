import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NavbarFoodbank from './NavbarFoodbank';
import HomeNavbar from './HomeNavbar';
import NavbarIndividual from './NavbarIndividual';
import NavbarDonor from './NavbarDonor';
import NavbarVolunteer from './NavbarVolunteer';

const Navbar = () => {
  const [userType, setUserType] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch user role from localStorage
    const fetchUser = () => {
      const userRole = localStorage.getItem('userRole');
      console.log('User Role:', userRole);
      setUserType(userRole); // Directly setting the role from storage
    };

    fetchUser();

    // Listen for localStorage changes (Note: Only works across tabs)
    const handleStorageChange = (event) => {
      if (event.key === 'userRole') {
        fetchUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Route Matching
  const routes = {
    foodbank: '/dashboard/foodbank',
    individual: '/dashboard/individual',
    donor: '/dashboard/donor',
    volunteer: '/dashboard/volunteer',
  };

  const navComponents = {
    foodbank: <NavbarFoodbank />,
    individual: <NavbarIndividual />,
    donor: <NavbarDonor />,
    volunteer: <NavbarVolunteer />,
  };

  const matchingNav =
    userType && router.pathname.startsWith(routes[userType]) ? (
      navComponents[userType]
    ) : (
      <HomeNavbar />
    );

  return <>{matchingNav}</>;
};

export default Navbar;
