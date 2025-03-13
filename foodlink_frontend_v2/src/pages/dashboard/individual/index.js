import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import validateToken from '../../../utils/validateToken';
import Image from 'next/image';
import foodbank from '../../../../public/images/food-bank2.jpg';

const IndividualDashboard = () => {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const decodedToken = await validateToken(token);
      setUserId(decodedToken.user.id.slice(0, 5));
      if (decodedToken.error) {
        console.error('Invalid token: ', decodedToken.error);
        router.push('/auth/login');
        return;
      }
    };

    checkToken();
    fetchAppointments();
  }, [router]);

  const fetchAppointments = async () => {
    // Fetch user appointments (Replace with actual API call)
    const mockAppointments = [
      { id: 1, date: 'March 20, 2025', time: '10:00 AM', foodBank: 'Downtown Food Bank' },
      { id: 2, date: 'March 25, 2025', time: '2:30 PM', foodBank: 'Community Help Center' },
    ];
    setAppointments(mockAppointments);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col justify-center items-center w-[70vw] md:flex-row md:justify-end md:w-[80vw] md:gap-2">
        {/* Left Section */}
        <div className="order-last md:order-first md:w-4/6 md:pr-4">
          <h1 className="text-2xl md:text-5xl text-center mt-5 font-bold text-gray-900 md:text-left mb-7">
            Welcome to FoodLink, {userId}!
          </h1>
          <p className="text-lg text-gray-700 text-center md:text-left mb-4">
            Your User ID: <span className="font-mono font-bold">{userId}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => router.push('/dashboard/individual/manageAppointments/book')}
            >
              Book an Appointment
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={() => router.push('/findFoodBank')}
            >
              Find Nearby Food Banks
            </button>
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              onClick={() => router.push('/dashboard/individual/manageAppointments/view')}
            >
              View My Appointments
            </button>
          </div>

          {/* Upcoming Appointments */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
            {appointments.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-700">
                {appointments.map((appt) => (
                  <li key={appt.id}>
                    {appt.date} at {appt.time} - <strong>{appt.foodBank}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No upcoming appointments.</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-2/6 flex flex-col justify-center items-center">
          <Image
            src={foodbank}
            alt="Food Bank"
            className="rounded-full object-cover shadow-lg w-32 h-32 md:w-64 md:h-64"
          />
          <div className="mt-6 text-center text-gray-600">
            <p className="text-md font-semibold">
              Providing food support for individuals and families in need.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
