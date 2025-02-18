import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

const NavbarFoodbank = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [svgColor, setSvgColor] = useState('#000');
  const [foodbankName, setFoodbankName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navRef = useRef(null); // Ref for the navbar
  const dropdownRef = useRef(null); // Ref for the dropdown

  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setFoodbankName(decodedToken.name || decodedToken.sub.slice(0, 5)); // Use food bank name or first 5 digits of ID
      } catch (error) {
        console.error('Invalid token: ', error);
      }
    }
  }, []);

  const openNav = () => {
    setIsNavOpen(true);
    setSvgColor('#fff');
  };
  const exitNav = () => {
    setIsNavOpen(false);
    setSvgColor('#000');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    router.push('/auth/login');
    window.location.reload(); // Force page reload
  };

  // Close navbar if clicked outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        exitNav();
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false); // Hide navbar when scrolling down
      } else {
        setIsVisible(true); // Show navbar when scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed w-full flex p-8 md:p-4 md:px-6 md gap-4 basis-1/10 text-white md:text-black z-50 transition-transform duration-300 justify-between items-center  md:${
        isVisible ? 'md:translate-y-0' : 'md:-translate-y-full'
      }`}
    >
      <div className="text-2xl font-bold text-black">
        <Link href="/dashboard/foodbank" legacyBehavior>
          FoodLink
        </Link>
      </div>

      <div onClick={openNav} className="cursor-pointer md:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="18.853" height="12" viewBox="0 0 18.853 12">
          <g id="Icon_feather-menu" data-name="Icon feather-menu" transform="translate(-4.5 -8)">
            <path
              id="Path_3"
              data-name="Path 3"
              d="M4.5,18H23.353"
              transform="translate(0 -4)"
              fill="none"
              stroke={svgColor}
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              id="Path_4"
              data-name="Path 4"
              d="M4.5,9H23.353"
              transform="translate(0)"
              fill="none"
              stroke={svgColor}
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              id="Path_5"
              data-name="Path 5"
              d="M4.5,27H23.353"
              transform="translate(0 -8)"
              fill="none"
              stroke={svgColor}
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>

      {/* Sidebar */}
      <div
        ref={navRef} // Attach ref to the sidebar
        className={`md:relative fixed top-0 right-0 bg-black md:bg-transparent overflow-x-hidden duration-500 font-bold  flex justify-center items-center h-full md:h-auto md:w-full  ${
          isNavOpen ? 'w-2/5' : 'w-0 bg-transparent '
        }`}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault(); // Prevent scrolling to the top
            exitNav();
          }}
          className="text-3xl absolute top-0 right-0 mr-4 mt-5 md:hidden"
        >
          &times;
        </a>
        <div className="p-2 md:flex-row md:p-0 md:w-full justify-between md:oxygen-bold drop-shadow-md flex flex-col text-sm md:text-base gap-4">
          <div></div>
          <div className="flex flex-col items-center md:flex-row ">
            <div>
              <Link
                className={`md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3`}
                href="/dashboard/foodbank/manageAppointments"
              >
                Manage Appointments
              </Link>
            </div>
            <div>
              <Link
                className={`md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3`}
                href="/dashboard/foodbank/events"
              >
                Manage Events
              </Link>
            </div>
            <div>
              <Link
                className={`md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3`}
                href="/dashboard/foodbank/donations"
              >
                Track Donations
              </Link>
            </div>
            <div>
              <Link
                className={`md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3`}
                href="/dashboard/foodbank/manageVolunteer"
              >
                Manage Volunteers
              </Link>
            </div>
          </div>
          <div className="my-4 flex justify-center w-36 relative">
            {/* Display food bank name or first 5 digits of ID */}
            <span
              className="text-center bg-white text-black px-3 py-2 rounded-lg md:bg-black md:text-white cursor-pointer"
              onClick={toggleDropdown}
            >
              {foodbankName}
            </span>
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-full mt-2 w-full bg-white text-black rounded-lg shadow-lg z-10"
              >
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-200">
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarFoodbank;
