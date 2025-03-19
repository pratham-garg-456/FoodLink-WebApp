import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import validateToken from '@/utils/validateToken';

const NavbarFoodbank = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [svgColor, setSvgColor] = useState('#000');
  const [foodbankId, setFoodbankId] = useState('');
  const [foodbankName, setFoodbankName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navRef = useRef(null); // Ref for the navbar
  const dropdownRef = useRef(null); // Ref for the dropdown

  const router = useRouter(); // Initialize the router

  const getUsername = async (userId) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/foodlink/misc/users'); // Replace with your actual API endpoint
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      const users = data.users; // Extract the 'users' array from the response
      const matchedUser = users.find((user) => user.id === userId);

      return matchedUser ? matchedUser.name : userId.slice(0, 5);
    } catch (error) {
      console.error('Error fetching users:', error);
      return 'Guest'; // Default name if there's an error
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const decodedToken = await validateToken(token);
          if (!decodedToken) {
            router.push('/auth/login');
            return;
          }

          const userId = decodedToken.user.id; // Assuming 'sub' is the user ID
          const username = await getUsername(userId);
          setFoodbankId(userId.slice(0, 5));
          setFoodbankName(username);
        } catch (error) {
          console.error('Invalid token: ', error);
        }
      }
    };
    fetchUserName();
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
    event.stopPropagation(); // Prevent event from bubbling up
    setDropdownOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  // Close navbar if clicked outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        event.target !== document.querySelector('#dropdown-button')
      ) {
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
      className={`fixed w-full flex md:mt-5 p-8 md:p-4 md:px-6 md gap-4 basis-1/10 text-white md:text-black z-50 transition-transform duration-300 justify-between items-center md:items-start  md:${
        isVisible ? 'md:translate-y-0' : 'md:-translate-y-full'
      }`}
    >
      <div className="flex items-start text-2xl font-bold text-black">
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
        <div className="p-2 md:items-start items-center text-center md:flex-row md:p-0 md:w-full justify-between md:oxygen-bold drop-shadow-md flex flex-col text-sm md:text-base gap-4">
          <div></div>
          <div className="flex  md:mt-2 md:text-base flex-col items-center md:items-start md:flex-row md:oxygen-bold">
            <div>
              <Link
                className={`md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3 flex items-center`}
                href="/dashboard/foodbank"
              >
                Home
              </Link>
            </div>
            <div>
              <Link
                className={`md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3 flex items-center`}
                href="/dashboard/foodbank/manageAppointments"
              >
                Manage Appointments
              </Link>
            </div>
            <div className="">
              <Link
                className={` md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3 flex items-center `}
                href="/dashboard/foodbank/events"
              >
                Manage Events
              </Link>
            </div>
            <div>
              <Link
                className={`md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3 flex items-center`}
                href="/dashboard/foodbank/donations"
              >
                Track Donations
              </Link>
            </div>
            <div>
              <Link
                className={`md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3 text-center flex items-center`}
                href="/dashboard/foodbank/manageVolunteer"
              >
                Manage Volunteers
              </Link>
            </div>
            <div className="">
              <Link
                className={` md:hover:text-gray-700 hover:text-gray-300 transition-colors ease-linear md:px-3 flex items-center `}
                href="/dashboard/foodbank/inventory"
              >
                Manage Inventory
              </Link>
            </div>
          </div>
          <div className=" flex flex-col w-28  items-center md:mb-10 justify-center">
            {/* Display food bank name or first 5 digits of ID */}
            <button
              id="dropdown-button"
              className=" flex items-center justify-center bg-white text-black px-3 py-2 rounded-lg md:bg-black md:text-white cursor-pointer w-full"
              onClick={toggleDropdown}
            >
              {foodbankId}

              <svg
                className="w-2.5 h-2.5 ms-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="flex flex-col justify-center items-center mt-2  bg-white text-black rounded-lg shadow-lg w-auto "
              >
                <Link
                  href="/profile"
                  className="w-full px-4 py-2 hover:bg-gray-200 hover:rounded-lg hover:rounded-b-none "
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 hover:bg-gray-200 hover:rounded-lg hover:rounded-t-none"
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
