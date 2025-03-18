import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NavbarFoodbank from './NavbarFoodbank';
import HomeNavbar from './HomeNavbar';
import NavbarIndividual from './NavbarIndividual';
import NavbarDonor from './NavbarDonor';
import NavbarVolunteer from './NavbarVolunteer';

const Navbar = () => {
  const [userType, setUserType] = useState(null);
  const router = useRouter();

  const fetchUser = () => {
    const userRole = localStorage.getItem('userRole');
    console.log('User Role:', userRole);
    setUserType(userRole);
  };

  useEffect(() => {
    fetchUser();

    // Listen for localStorage changes (only across tabs)
    const handleStorageChange = (event) => {
      if (event.key === 'userRole') {
        fetchUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen for route changes to update navbar
    const handleRouteChange = () => {
      fetchUser();
    };
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

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
