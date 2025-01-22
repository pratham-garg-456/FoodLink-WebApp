import { FaFacebook, FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-4">
      <div className=" mx-auto flex flex-col items-center md:flex-row justify-between px-6">
        {/* Follow Us Section */}
        <div className="flex items-center gap-4 mb-2 md:mb-0">
          <span className="font-bold text-md">Follow Us:</span>
          <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="text-xl hover:text-blue-600 transition-colors" />
          </Link>
          <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="text-xl hover:text-pink-600 transition-colors" />
          </Link>
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
