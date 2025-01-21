// components/Layout.js
import NavbarIndividual from '../components/NavbarIndividual.js';
import NavbarFoodBank from '../components/NavbarFoodbank.js';
import NavbarDonor from '../components/NavbarDonor.js';
import Footer from '../components/Footer.js';
import Navbar from '../components/Navbar.js';

const Layout = ({ children, userRole }) => {
  let NavbarComponent;

  // Determine which Navbar to use based on the user role
  if (userRole === 'individual') {
    NavbarComponent = NavbarIndividual;
  } else if (userRole === 'foodBank') {
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
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
