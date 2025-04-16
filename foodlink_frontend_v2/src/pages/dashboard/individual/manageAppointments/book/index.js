import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import router from 'next/router';
import { useRouter } from 'next/router';
import {
  appointmentDateAtom,
  appointmentTimeAtom,
  selectedFoodbankAtom,
} from '../../../../../../store';

import validateToken from '@/utils/validateToken';

const BookAppointment = () => {
  const router = useRouter();
  const { foodBank } = router.query;

  const [appointmentDate, setAppointmentDate] = useAtom(appointmentDateAtom);
  const [appointmentTime, setAppointmentTime] = useAtom(appointmentTimeAtom);
  const [selectedFoodbank, setSelectedFoodbank] = useAtom(selectedFoodbankAtom);
  const [foodbanks, setFoodbanks] = useState([]); // updated from foodBanks to foodbanks
  const [userAppointments, setUserAppointments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        localStorage.clear();
        router.push('/auth/login');
        return;
      }

      try {
        const decodedToken = await validateToken(token);
      } catch (error) {
        console.error('Invalid token: ', error);
        router.push('/auth/login');
      }
    };
    checkToken();
  }, [router]);
  const [nextAvailableDate, setNextAvailableDate] = useState('');

  useEffect(() => {
    if (foodBank) {
      setSelectedFoodbank(foodBank);
    }
  }, [foodBank, setSelectedFoodbank]);

  // Load data from localStorage on page load
  useEffect(() => {
    const storedAppointmentDate = localStorage.getItem('appointmentDate');
    const storedAppointmentTime = localStorage.getItem('appointmentTime');
    const storedSelectedFoodbank = localStorage.getItem('selectedFoodbank'); // updated from selectedFoodBank to userSelectedFoodbank

    // updated from selectedFoodBank to userSelectedFoodbank

    const fetchFoodbanks = async () => {
      // updated from fetchFoodBanks to fetchFoodbanks
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/misc/users`
        );
        const data = await response.json();
        const filteredFoodbanks = data.users.filter((user) => user.role === 'foodbank'); // updated from foodBanks to foodbanks
        setFoodbanks(filteredFoodbanks); // updated from setFoodBanks to setFoodbanks
      } catch (error) {
        console.error('Error fetching foodbanks:', error); // updated from food banks to foodbanks
      }
    };

    const fetchUserAppointments = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/foodlink/individual/appointments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        const filteredAppointments = data.appointments.filter(
          (appointment) =>
            appointment.status !== 'cancelled' &&
            ['scheduled', 'picked', 'rescheduled'].includes(appointment.status)
        );
        setUserAppointments(filteredAppointments);

        if (filteredAppointments.length > 1) {
          const lastAppointmentDate = new Date(
            filteredAppointments[filteredAppointments.length - 1].end_time
          );
          lastAppointmentDate.setDate(lastAppointmentDate.getDate() + 30);
          setNextAvailableDate(lastAppointmentDate.toISOString().split('T')[0]);
        } else {
          setNextAvailableDate(null);
        }
      } catch (error) {
        console.error('Error fetching user appointments:', error);
      }
    };

    fetchFoodbanks(); // updated from fetchFoodBanks to fetchFoodbanks
    fetchUserAppointments();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedFoodbank) {
      // updated from selectedFoodBank to userSelectedFoodbank
      setErrorMessage('Please select a food bank.');
      return;
    }

    const minTime = '10:00';
    const maxTime = '16:00';
    if (appointmentTime < minTime || appointmentTime > maxTime) {
      setErrorMessage('Please select a time between 10:00 AM and 4:00 PM.');
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const nextAvailable = new Date(nextAvailableDate);

    if (selectedDate < nextAvailable) {
      setErrorMessage(
        `You cannot book more than 2 appointments in a month. You can only book an appointment after ${nextAvailableDate}.`
      );
      return;
    }

    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    const appointmentsInMonth = userAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date);
      return (
        appointmentDate.getMonth() === selectedMonth &&
        appointmentDate.getFullYear() === selectedYear
      );
    });

    if (appointmentsInMonth.length >= 2) {
      setErrorMessage('');
      return;
    }

    setErrorMessage('');

    // Save the values in localStorage to persist across refreshes
    localStorage.setItem('appointmentDate', appointmentDate);
    localStorage.setItem('appointmentTime', appointmentTime);
    localStorage.setItem('selectedFoodbank', selectedFoodbank); // updated from selectedFoodBank to userSelectedFoodbank

    router.push(
      `/dashboard/individual/manageAppointments/book/selectItems?foodBank=${selectedFoodbank}` // updated from foodBank to foodbank
    );
  };

  const currentDate = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const maxDate = futureDate.toISOString().split('T')[0];

  return (
    <div className="flex flex-col my-16 w-[90vw] justify-center items-center md:my-24 h-full">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Book an Appointment</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Select your preferred food bank, date, and time for your appointment.
          </p>
        </div>

        {/* Booking Rules */}
        <div className="mb-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Booking Rules</h2>
          <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
            <li>You can book appointments up to 10 days in advance</li>
            <li>Maximum 2 appointments allowed per month</li>
            <li>Appointments available between 10:00 AM and 4:00 PM</li>
          </ul>
        </div>

        {nextAvailableDate && (
          <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">
              ⚠️ You have already booked 2 appointments this month. Next available booking date:{' '}
              {new Date(nextAvailableDate).toLocaleDateString()}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Bank Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Food Bank Location</label>
            <div className="relative">
              <select
                value={selectedFoodbank}
                onChange={(e) => setSelectedFoodbank(e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                required
              >
                <option value="">Select a Food Bank</option>
                {foodbanks.map((foodbank) => (
                  <option key={foodbank.id} value={foodbank.id}>
                    {foodbank.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min={currentDate}
                max={maxDate}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Appointment Time</label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="10:00"
                max="16:00"
                step="1800"
              />
              <p className="text-xs text-gray-500 mt-1">Available hours: 10:00 AM - 4:00 PM</p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Continue to Select Items
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
