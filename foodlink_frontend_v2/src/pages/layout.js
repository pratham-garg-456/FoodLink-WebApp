import React, { useEffect, useState } from 'react';
import NavbarIndividual from '../components/NavbarIndividual.js';
import NavbarFoodBank from '../components/NavbarFoodbank.js';
import NavbarDonor from '../components/NavbarDonor.js';
import Footer from '../components/Footer.js';
import Navbar from '../components/Navbar.js';
import {jwtDecode} from 'jwt-decode';

const Layout = ({ children }) => {
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem('accessToken');

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    } catch (error) {
      console.error('Invalid token: ', error);
    }
  }
  }, []);

  // Determine which Navbar to use based on the user role
  let NavbarComponent;
  if (userRole === 'individual') {
    NavbarComponent = NavbarIndividual;
  } else if (userRole === 'foodbank') {
    NavbarComponent = NavbarFoodBank;
  } else if (userRole === 'donor') {
    NavbarComponent = NavbarDonor;
  } else {
    NavbarComponent = Navbar;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Conditionally render the appropriate navbar */}
      {NavbarComponent && <NavbarComponent />}

      {/* Main content */}
      <main className="flex-grow pt-20 flex justify-center items-center">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;