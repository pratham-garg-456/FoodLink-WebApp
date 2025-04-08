import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import validateToken from '../../../utils/validateToken';
import Image from 'next/image';
import donorImage from '../../../../public/images/donation-portal.jpg';

const DonorDashboard = () => {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [donorUsernames, setDonorUsernames] = useState('');

  const getUsername = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
      ); // Replace with your actual API endpoint
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
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      try {
        const decodedToken = await validateToken(token);
        if (decodedToken.error) {
          console.error('Invalid token:', decodedToken.error);
          router.push('/auth/login');
          return;
        }
        const userId = decodedToken.user.id;
        setUserId(decodedToken.user.id.slice(0, 5));
        const username = await getUsername(userId);
        setDonorUsernames(username);
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/auth/login');
      }
    };

    checkToken();
  }, [router]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col justify-center items-center w-[70vw] md:flex-row md:justify-end md:w-[80vw] md:gap-2">
        {/* Left Section */}
        <div className="order-last md:order-first md:w-4/6 md:pr-4">
          <h1 className="text-2xl md:text-5xl text-center mt-5 font-bold text-gray-900 md:text-left mb-7">
            Welcome to the Donor Dashboard, {donorUsernames}
          </h1>
          <p className="text-lg text-gray-700 text-center md:text-left mb-4">
            Your Donor ID: <span className="font-mono font-bold">{userId}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-gray-700"
              onClick={() => router.push('/dashboard/donor/donate')}
            >
              Donate Now!
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-gray-700"
              onClick={() => router.push('/dashboard/donor/tracker')}
            >
              Track Donations
            </button>
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-gray-700"
              onClick={() => router.push('/dashboard/donor/findDropOffLocation')}
            >
              Find Drop-off Location
            </button>
            <button
              className="px-4 py-2 bg-pink-800 text-white rounded-lg hover:bg-gray-700"
              onClick={() => router.push('/dashboard/donor/eventList')}
            >
              View Ongoing Events
            </button>
          </div>

          <div className="mt-8 text-md text-gray-800 flex flex-col items-center md:flex-row md:justify-start md:items-start md:gap-4">
            <p>
              <strong>2.5k</strong> Donations Made
            </p>
            <p>
              <strong>$5,000+</strong> Dollars Contributed
            </p>
            <p>
              <strong>15k+</strong> Meals Supported
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-2/6 flex flex-col justify-center items-center">
          <Image
            src={donorImage}
            alt="Donor"
            className="rounded-full object-cover shadow-lg w-32 h-32 md:w-64 md:h-64"
          />
          <div className="mt-6 text-center text-gray-600">
            <p className="text-md font-semibold">Your generosity helps communities thrive</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
