import Footer from '../components/Footer.js';
import Navbar from '../components/Navbar.js';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Conditionally render the appropriate navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-grow pt-20 flex justify-center items-center">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
