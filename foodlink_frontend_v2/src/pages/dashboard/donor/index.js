import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import validateToken from '../../../utils/validateToken';
import Image from 'next/image';

// Instead of using the yellow-themed donor navbar, we use HomeNavbar for a neutral look.
import HomeNavbar from '@/components/HomeNavbar';
import Footer from '@/components/Footer';

const DonorDashboard = () => {
  const router = useRouter();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const decodedToken = await validateToken(token);
      if (decodedToken.error) {
        console.error('Invalid token:', decodedToken.error);
        router.push('/auth/login');
        return;
      }
      if (decodedToken.user?.id) {
        setUserId(decodedToken.user.id.slice(0, 5));
      }
      if (decodedToken.role !== 'donor') {
        router.push('/auth/login');
        return;
      }
    };
    checkToken();
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Use a neutral, black/white navbar instead of the yellow donor navbar */}
      <HomeNavbar />

      {/* Main Content */}
      <main className="flex flex-col items-center flex-grow">
        <div className="flex flex-col justify-center items-center w-[70vw] md:flex-row md:justify-end md:w-[80vw] md:gap-2 mt-8">
          {/* Left Section */}
          <div className="order-last md:order-first md:w-4/6 md:pr-4">
            <h1 className="text-2xl md:text-5xl text-center mt-5 font-bold text-gray-900 md:text-left mb-7">
              Welcome to the Donor Dashboard
            </h1>
            <p className="text-lg text-gray-700 text-center md:text-left mb-4">
              Your User ID: <span className="font-mono font-bold">{userId}</span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition duration-300"
                onClick={() => router.push('/dashboard/donor/donate')}
              >
                Donate Now
              </button>
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition duration-300"
                onClick={() => router.push('/dashboard/donor/donations')}
              >
                Track Donations
              </button>
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition duration-300"
                onClick={() => router.push('/dashboard/donor/dropOffLocation')}
              >
                Find Drop-off Location
              </button>
            </div>

            {/* Statistics or extra info */}
            <div className="mt-8 text-md text-gray-800 flex flex-col items-center md:flex-row md:justify-start md:items-start md:gap-4">
              <p>
                <strong>100+</strong> Donations Made
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
            <div className="mt-6 text-center text-gray-600">
              <p className="text-md font-semibold">Your generosity helps communities thrive</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DonorDashboard;
