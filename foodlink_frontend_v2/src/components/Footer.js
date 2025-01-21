import { FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-4">
      <div className="container mx-auto flex flex-col items-center md:flex-row justify-between px-6">
        {/* Follow Us Section */}
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <span className="font-bold text-lg">Follow Us:</span>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="text-2xl hover:text-blue-600 transition-colors" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="text-2xl hover:text-pink-600 transition-colors" />
          </a>
        </div>

        {/* Rights Reserved */}
        <div className="text-center md:text-right text-sm">
          <p>2024 FoodLink All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
